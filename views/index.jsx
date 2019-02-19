'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var moment = require('moment');
moment.locale('fr');
var DatePicker = require('react-datepicker');
var async = require('async');
require('../static/css/style.css');
require('../static/css/react-yearly-calendar.css');
require('react-datepicker/dist/react-datepicker.css');
require('es6-promise').polyfill();

require('whatwg-fetch');
var yearlyCalendar = require('react-yearly-calendar');
var Calendar = yearlyCalendar.Calendar;
var CalendarControls = yearlyCalendar.CalendarControls;

var Option = React.createClass({
    render: function () {
        return (
            <option value={this.props.val.id}>{this.props.val.name}</option>
        );
    }
});

var SelectList = React.createClass({
    render: function () {
        if (this.props.values && this.props.values.length <= 1) {
            return null;
        }
        var options = [<Option val='' key='-1' />];
        if (this.props.values) {
            this.props.values.forEach(function (val) {
                options.push(<Option val={val} key={val.id} />);
            }.bind(this));
        }

        return (
            <div className={this.props.cssclass}>
                <label htmlFor={this.props.id} className='select-label'>{this.props.label}</label><select className='select-form' value={this.props.selected} id={this.props.id} onChange={this.onChange}>
                    {options}
                </select>
            </div>
        );
    },
    onChange: function (e) {
        this.props.changeFunc(e.target.value);
    }
});


function isWeekday(d) {
    var dow = d.weekday();
    return dow < 5;
}

var JNTDatePicker = React.createClass({
    render: function () {
        var jnts = [];
        this.props.jnts.forEach(function (e) {
            jnts.push(moment(e, 'YYYY-MM-DD'));
        });

        return (
            <div className='jnt-picker'>
                <label htmlFor='date' >Date ({this.props.date.format('dddd')}) </label>
                <div style={{ display: 'table-cell' }} >
                    <DatePicker selected={this.props.date} onChange={this.props.changeDate} dateFormat='DD/MM/YYYY' filterDate={this.isWeekday} locale='fr' excludeDates={jnts} />
                    <input type='button' onClick={this.props.previousDay} value='Jour précédent' className="button" style={{ display: 'table-cell' }} />
                    <input type='button' onClick={this.props.nextDay} value='Jour suivant' className="button" style={{ display: 'table-cell' }} />
                </div>
            </div>
        );
    },
});

var Comment = React.createClass({
    render: function () {
        return (
            <div className='comment'><label htmlFor='comment' className='comment-label'>Remarque</label><textarea id='comment' value={this.props.comment} onChange={this.props.updateComment} /></div>
        );
    }
});

function arrayToMap(a) {
    var m = {};
    for (var i = 0; i < a.length; i++) {
        m[a[i].id] = a[i];
    }
    return m;
}

function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response.json();
    } else {
        return response.json().then(function (body) {
            throw body;
        });
    }
}

function fetcher(url, cb) {
    fetch(url).then(checkStatus)
        .then(function (content) {
            cb(null, content)
        }).catch(function (ex) {
            cb(ex, null);
        });
};

function filterSubMenu(id, sublist, name) {
    if (id == -1) {
        return [];
    }

    var lst = [];
    for (var i = 0; i < sublist.list.length; i++) {
        var elem = sublist.list[i];
        if (elem[name] == id) {
            lst.push(elem);
        }
    }
    return lst;
}

var Timetable = React.createClass({
    getInitialState: function () {
        return {
            today: moment(),
            weeklyTasks: {},
            user_id: -1,
            category_id: -1,
            project_id: -1,
            activity_id: -1,
            allocation_id: -1,
            users: {},
            categories: {},
            projects: {},
            activities: {},
            allocations: {},
            errorMsg: '',
            comment: '',
            jnts: new Set(),
        };
    },
    componentDidMount: function () {
        var that = this;
        async.parallel({
            categories: function (cb) {
                fetcher('/categories', cb);
            },
            activities: function (cb) {
                fetcher('/activities', cb);
            },
            projects: function (cb) {
                fetcher('/projects', cb);
            },
            allocations: function (cb) {
                fetcher('/allocations', cb);
            },
            users: function (cb) {
                fetcher('/users', cb);
            },
            jnts: function (cb) {
                fetcher('/jnt', cb);
            }
        }, function (err, results) {
            if (err) {
                console.log('error in async parrallel', err);
                that.setState({ errorMsg: err });
            } else {

                var jntJson = results['jnts'];

                var jnts = new Set();

                for (var i = 0; i < jntJson.length; i++) {
                    jnts.add(jntJson[i]);
                }

                delete results['jnts'];
                var state = { jnts: jnts }
                for (var k in results) {
                    state[k] = {};
                    state[k]['dict'] = arrayToMap(results[k]);
                    state[k]['list'] = results[k];
                }
                that.setState(state);

                if (!that.isWorkingDay(that.state.today)) {
                    today = that.nextDay();
                    that.setState({ today: today });
                }
            }
        });
    },
    dailyTasks: function () {
        var today = this.state.today.format('YYYY-MM-DD');
        if (today in this.state.weeklyTasks) {
            return this.state.weeklyTasks[today];
        }
        return [];
    },
    getProjectActivities: function (projectId) {
        return filterSubMenu(projectId, this.state.activities, 'project_id');
    },
    getCategoryProjects: function (categoryId) {
        return filterSubMenu(categoryId, this.state.projects, 'category_id');
    },
    render: function () {
        var dailyTasks = this.dailyTasks();
        var that = this;
        var categoryProjects = this.getCategoryProjects(this.state.category_id);
        var projectActivities = this.getProjectActivities(this.state.project_id);
        return (
            <div>
                <form className='task-table'>
                    <SelectList values={this.state.users.list} label='Trigramme' cssclass='user' changeFunc={this.changeUser} selected={this.state.user_id} />
                    <JNTDatePicker date={this.state.today} previousDay={this.previousDay} nextDay={this.nextDay} jnts={this.state.jnts} changeDate={this.changeDate} />
                    <SelectList values={this.state.categories.list} label='Catégorie' cssclass='category-select' id='category' changeFunc={this.changeCategory} selected={this.state.category_id} />
                    <SelectList values={categoryProjects} label='Projet' cssclass='project-select' id='project' changeFunc={this.changeProject} selected={this.state.project_id} />
                    <SelectList values={projectActivities} label='Activité' cssclass='activity-select' id='activity' changeFunc={this.changeActivity} selected={this.state.activity_id} />
                    <SelectList values={this.state.allocations.list} label='Temps' cssclass='allocation-select' id='allocation' changeFunc={this.changeAllocation} selected={this.state.allocation_id} />
                    <Comment comment={this.state.comment} updateComment={this.changeComment} />
                    <div style={{ display: 'table-row' }}>
                        <div style={{ display: 'table-cell' }}>
                            <input type='button' onClick={this.addTask} value='Ajouter cette tâche' />
                        </div>
                        <div style={{ display: 'table-cell' }}>
                            <input type='button' onClick={this.addTaskAndNextDay} value='Ajouter cette tâche et aller au prochain jour' />
                        </div>
                    </div>
                </form>
                <div className='error'>{this.state.errorMsg}</div>
                <hr />
                <DailySummary tasks={dailyTasks} deleteTasks={this.deleteDailyTasks} date={this.state.today} />
                <hr />
                <WeeklySummary tasks={this.state.weeklyTasks} date={this.state.today} isWorkingDay={this.isWorkingDay} />
                <hr />
                <div id='demo'>
                    <div id='calendar'>
                        <CalendarControls
                            year={this.state.today.year()}
                            showTodayButton={true}
                            //onPrevYear={() => this.onPrevYear()}
                            //onNextYear={() => this.onNextYear()}
                            goToToday={this.goToToday} />
                        <Calendar year={this.state.today.year()} onPickDate={this.changeDate} selectedDay={this.state.today} customClasses={function (d) { return that.getWorkingDayCss(d) } } />
                    </div>
                </div>
                <hr />
                <a download='tasks.csv' href='/tasks'>Télécharger en csv</a>
            </div>
        );
    },
    goToToday: function () {
        this.changeDate(moment());
    },
    getWorkingDayCss: function (d) {
        if (this.isWorkingDay(d)) {
            var dStr = d.format('YYYY-MM-DD');
            if (!(dStr in this.state.weeklyTasks)) {
                return '';
            }
            var tasks = this.state.weeklyTasks[dStr];
            var total = 0;
            for (var i = 0; i < tasks.length; i++) {
                total += tasks[i].allocation.value;
            }
            switch (parseInt(total * 100)) {
                case 100:
                    return 'day-ok';
                case 75:
                    return 'day-75';
                case 50:
                    return 'day-50';
                case 25:
                    return 'day-25';
                default:
                    return '';
            }
        }
        return 'jnt';
    },
    isWorkingDay: function (d) {
        if (this.state.jnts.has(d.format('YYYY-MM-DD'))) {
            return false;
        }
        return isWeekday(d);
    },

    previousDay: function () {
        var d = this.state.today.clone().add(-1, 'day');
        while (!this.isWorkingDay(d)) {
            d.add(-1, 'day');
        }
        this.changeDate(d);
    },
    nextDay: function () {
        var d = this.state.today.clone().add(1, 'day');
        while (!this.isWorkingDay(d)) {
            d.add(1, 'day');
        }
        this.changeDate(d);
    },
    changeComment: function (e) {
        this.setState({ comment: e.target.value });
    },
    changeUser: function (user_id) {
        var that = this;
        var jnts = [];
        fetch('/users/' + user_id + '/tasks').then(function (response) {
            return response.json();
        }).then(function (content) {
            var weeklyTasks = {};
            for (var i = 0; i < content.length; i++) {
                var task = content[i];
                if (!(task.date in weeklyTasks)) {
                    weeklyTasks[task.date] = [];
                }
                weeklyTasks[task.date].push({
                    id: task.id,
                    activity: that.state.activities.dict[task.activity_id],
                    project: that.state.projects.dict[task.project_id],
                    allocation: that.state.allocations.dict[task.allocation_id],
                    comment: task.comment,
                    date: task.date
                });
            }
            that.setState({ user_id: parseInt(user_id), weeklyTasks: weeklyTasks });
        }).catch(function (ex) {
            console.log(ex);
            that.setState({ errorMsg: 'Error in receiving user tasks' + ex });
        });
    },
    changeCategory: function (categoryId) {
        var categoryId = parseInt(categoryId);
        var projects = this.getCategoryProjects(categoryId);
        if (projects.length == 1) {
            var projectId = projects[0].id;
            this.setState({ category_id: categoryId, project_id: projectId, activity_id: -1 });
            this.changeProject(projectId);
        } else {
            this.setState({ category_id: categoryId, project_id: -1, activity_id: -1 });
        }
    },
    changeProject: function (project_id) {
        var projectId = parseInt(project_id);
        var activities = this.getProjectActivities(projectId);
        if (activities.length == 1) {
            this.setState({ project_id: projectId, activity_id: activities[0].id });
        } else {
            this.setState({ project_id: projectId, activity_id: -1 });
        }
    },
    changeActivity: function (activity_id) {
        this.setState({ activity_id: parseInt(activity_id) });
    },
    changeAllocation: function (allocation_id) {
        this.setState({ allocation_id: parseInt(allocation_id) });
    },
    deleteDailyTasks: function (indexes) {
        var that = this;
        fetch('/tasks/' + indexes.join(), {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }

        }).then(function (response) {
            return response.json();
        }).then(function (content) {
            var dailyTasks = [];
            var oldTasks = that.dailyTasks();
            for (var i = 0; i < oldTasks.length; i++) {
                if (indexes.indexOf(oldTasks[i].id) >= 0) {
                    continue;
                }
                dailyTasks.push(oldTasks[i]);
            }
            var weeklyTasks = that.state.weeklyTasks;
            var today = that.state.today.format('YYYY-MM-DD');
            weeklyTasks[today] = dailyTasks;
            that.setState({ weeklyTasks: weeklyTasks, errorMsg: '' });
        }).catch(function (ex) {
            console.log(ex)
            that.setState({ errorMsg: ex });
        });
    },
    changeDate: function (d) {
        this.setState({ today: d, errorMsg: '' });
    },
    addTaskAndNextDay: function (event) {
        event.preventDefault();
        this.addTask(event, this.nextDay);
    },
    addTask: function (event, cb) {
        event.preventDefault();
        if (!isWeekday(this.state.today)) {
            this.setState({ errorMsg: 'Veuillez sélectionner un jour de la semaine entre lundi et vendredi.' });
            return;
        }
        if (this.state.allocation_id == -1 || this.state.user_id == -1 || this.state.project_id == -1 || this.state.activity_id == -1 || this.state.category_id == -1) {
            this.setState({ errorMsg: 'Veuillez sélectionner un choix valide.' });
            return;
        }
        var today = this.state.today.format('YYYY-MM-DD');

        var that = this;
        fetch('/users/' + this.state.user_id + '/tasks', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                activity_id: this.state.activity_id,
                allocation_id: this.state.allocation_id,
                comment: this.state.comment,
                date: today
            })
        }).then(checkStatus)
            .then(function (content) {
                var weeklyTasks = {};
                for (var k in that.state.weeklyTasks) {
                    weeklyTasks[k] = that.state.weeklyTasks[k];
                }

                if (!(today in weeklyTasks))
                    weeklyTasks[today] = [];
                weeklyTasks[today].push({
                    id: content.id,
                    activity: that.state.activities.dict[that.state.activity_id],
                    project: that.state.projects.dict[that.state.project_id],
                    allocation: that.state.allocations.dict[that.state.allocation_id],
                    comment: that.state.comment,
                    date: today
                });
                that.setState({ weeklyTasks: weeklyTasks, errorMsg: '' });
                if (cb) {
                    cb();
                }
            }).catch(function (ex) {
                that.setState({ errorMsg: ex });
            });
    },
});


var DailyTask = React.createClass({
    getInitialState: function () {
        return {
            checked: false
        };
    },
    render: function () {
        return (
            <tr><td><input type="checkbox" value={this.state.checked} onChange={this.handleClick} /> {this.props.project.name}</td><td>{this.props.activity.name}</td><td>{this.props.allocation.name}</td><td>{this.props.comment}</td></tr>
        );
    },
    handleClick: function () {
        var newState = !this.state.checked;
        this.setState({ checked: newState });
        this.props.handleTaskClick(this.props.index, newState);
    }
});

var DailySummary = React.createClass({
    getInitialState: function () {
        return {
            checkedIndexes: {},
        };
    },
    render: function () {
        var rows = [];
        this.props.tasks.forEach(function (task) {
            rows.push(<DailyTask project={task.project} key={task.id} index={task.id} activity={task.activity} allocation={task.allocation} comment={task.comment} handleTaskClick={this.handleTaskClick} />);
        }.bind(this));
        return (
            <div>
                <table className='daily-sumup'>
                    <caption>Journée en cours: {this.props.date.format('dddd DD MMMM YYYY')}</caption>
                    <tbody>
                        <tr>
                            <th>Projet</th><th>Activité</th><th>Temps</th><th>Remarque</th>
                        </tr>
                        {rows}
                    </tbody>
                </table>
                <input type="button" value="Effacer les tâches" onClick={this.deleteTasks} />
            </div>
        );
    },
    deleteTasks: function () {
        var indexes = [];
        for (var k in this.state.checkedIndexes) {
            if (this.state.checkedIndexes[k])
                indexes.push(parseInt(k));
        }
        this.props.deleteTasks(indexes);
        this.setState({ checkedIndexes: {} });
    },
    handleTaskClick: function (index, checked) {
        var checkedIndexes = {};
        for (var k in this.state.checkedIndexes) {
            checkedIndexes[k] = this.state.checkedIndexes[k];
        }
        checkedIndexes[index] = checked;
        this.setState({ checkedIndexes: checkedIndexes });
    }
});

var WeeklySummary = React.createClass({
    render: function () {
        var dow = this.props.date.weekday();

        var projects = {};
        var defaultAllocation = { allocation: { name: '', value: 0 } }
        var sumDays = {};
        var total = 0;
        var dates = []
        for (var i = 0; i < 5; i++) {
            sumDays[i] = 0;
            var d = this.props.date.clone().add(i - dow, 'day');
            dates.push(d);
            var date = d.format('YYYY-MM-DD');
            if (date in this.props.tasks) {

                var dailyProject = this.props.tasks[date];

                for (var j = 0; j < dailyProject.length; j++) {
                    var projectName = dailyProject[j].project.name;
                    if (!(projectName in projects))
                        projects[projectName] = {};
                    var activity = dailyProject[j].activity.name;
                    if (!(activity in projects[projectName])) {
                        projects[projectName][activity] = [defaultAllocation, defaultAllocation, defaultAllocation, defaultAllocation, defaultAllocation];
                    }
                    projects[projectName][activity][i] = dailyProject[j];
                    sumDays[i] += dailyProject[j].allocation.value;
                    total += dailyProject[j].allocation.value;
                }
            }
        }

        var rows = [];
        for (var p in projects) {
            var key = p;
            for (activity in projects[p]) {
                key += activity;
                var columns = [];
                for (var i = 0; i < 5; i++) {
                    var task = projects[p][activity][i];
                    var taskKey = parseInt(task.id) + dates[i].format('YYYY-MM-DD');
                    columns.push(<td key={taskKey}>{task.allocation.name}</td>);
                }
                rows.push(<tr key={key}><td>{p}</td><td>{activity}</td>{columns}<td></td></tr>);
            }
        }

        var totalCells = [];
        var dateNames = []
        var workingDaysInWeek = 0;
        for (var i = 0; i < 5; i++) {
            var s = parseInt(i);
            var workingDay = this.props.isWorkingDay(dates[i]);
            totalCells.push(<TotalCell total={sumDays[s]} key={'totalCell' + s} workingDay={workingDay} />);
            var selectedCss = '';
            if (dates[i].format('YYYY-MM-DD') == this.props.date.format('YYYY-MM-DD')) {
                selectedCss = 'selected';
            }
            dateNames.push(<th key={'date' + s} className={selectedCss}>{dates[i].format('dddd (DD/MM)')}</th>);
            if (workingDay) {
                workingDaysInWeek++;
            }
        }

        var totalCss = total == workingDaysInWeek ? 'green' : 'grey';
        return (
            <table>
                <caption>Semaine en cours</caption>
                <tbody>
                    <tr>
                        <th>Projet</th><th>Activité</th>{dateNames}<th>Total</th>
                    </tr>
                    {rows}
                    <tr><td colSpan='2'><strong>Total</strong></td>{totalCells}<td className={totalCss}>{total} / {workingDaysInWeek}</td></tr>
                </tbody>
            </table>
        );
    },
});

var TotalCell = React.createClass({
    render: function () {
        var css = '';
        var total = '';
        if (this.props.workingDay) {
            total = this.props.total;
            switch (parseInt(total * 100)) {
                case 100:
                    css = 'green';
                    break;
                case 75:
                    css = 'limegreen';
                    break;
                case 50:
                    css = 'darkseagreen';
                    break;
                case 25:
                    css = 'lightgreen';
                    break;
                default:
                    css = 'red';
            }
        }
        return (
            <td className={css}>{total}</td>
        );
    }
});

ReactDOM.render(
    <Timetable />,
    document.getElementById('container')
);