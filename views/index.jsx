'use strict';

require('babel-register')

var React = require('react');
var ReactDOM = require('react-dom');
var moment = require('moment');
moment.locale('en-gb');
var DatePicker = require('react-datepicker');
var async = require('async');
require('../static/css/style.css');
require('react-datepicker/dist/react-datepicker.css');
require('whatwg-fetch');

var Option = React.createClass({
    render: function () {
        return (
            <option value={this.props.val.id}>{this.props.val.name}</option>
        );
    }
});

var SelectList = React.createClass({
    getInitialState: function () {
        return {
            selected: '-1'
        };
    },
    render: function () {
        var options = [<Option val='' key='-1'/>];
        if (this.props.values) {
            this.props.values.forEach(function (val) {
                options.push(<Option val={val} key={val.id}/>);
            }.bind(this));
        }

        return (
            <div className={this.props.cssclass}>
                <label htmlFor={this.props.id} className='select-label'>{this.props.label}</label><select className='select-form' value={this.state.selected} id={this.props.id} onChange={this.onChange}>
                    {options}
                </select>
            </div>
        );
    },
    onChange: function (e) {
        this.setState({ selected: e.target.value });
        this.props.changeFunc(e.target.value);
    }
});


function isWeekday(d) {
    var dow = d.weekday();
    return dow < 5;
}

var JNTDatePicker = React.createClass({
    getInitialState: function () {
        return {
            jnts: [],
        };
    },
    componentDidMount: function () {
        var that = this;
        var jnts = [];
        fetch('/jnt').then(function (response) {
            return response.json();
        }).then(function (content) {
            for (var i = 0; i < content.length; i++) {
                var day = moment(content[i], 'YYYY-MM-DD');
                jnts.push(day);
            }

            that.setState({
                jnts: jnts
            });
        }).catch(function (ex) {
            console.log('parsing failed', ex)
        });
    },

    componentWillUnmount: function () {
        // Cannot cancel a fetch request: https://github.com/whatwg/fetch/issues/27
        // this.serverRequest.abort(); // with jquery example: https://facebook.github.io/react/tips/initial-ajax.html
    },

    render: function () {
        return (
            <div className='jnt-picker'>
                <label htmlFor='date' >Date</label>
                <div style={{ display: 'table-cell' }} >
                    <DatePicker selected={this.props.date} onChange={this.handleChange} dateFormat='DD/MM/YYYY' filterDate={this.isWeekday}  locale='en-gb'  excludeDates={this.state.jnts}/>

                    <input type='button' onClick={this.previousDay} value='Jour précédent'  className="button" style={{ display: 'table-cell' }}/>
                    <input type='button' onClick={this.nextDay} value='Jour suivant'  className="button" style={{ display: 'table-cell' }}/>
                </div>
            </div>
        );
    },

    isWorkingDay: function (d) {
        for (var i = 0; i < this.state.jnts.length; i++) {
            if (this.state.jnts[i].format('YYYY-MM-DD') == d.format('YYYY-MM-DD')) {
                return false;
            }
        }
        return isWeekday(d);
    },

    previousDay: function () {
        var d = this.props.date.clone().add(-1, 'day');
        while (!this.isWorkingDay(d)) {
            d.add(-1, 'day');
        }
        this.props.changeDate(d);
    },
    nextDay: function () {
        var d = this.props.date.clone().add(1, 'day');
        while (!this.isWorkingDay(d)) {
            d.add(1, 'day');
        }
        this.props.changeDate(d);
    },
    handleChange: function (d) {
        this.props.changeDate(d);
    },
});

var Comment = React.createClass({
    render: function () {
        return (
            <div className='comment'><label htmlFor='comment' className='comment-label'>Remarque</label><textarea id='comment' value={this.props.comment} onChange={this.props.updateComment}/></div>
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

function fetcher(url, cb) {
    fetch(url).then(function (response) {
        return response.json();
    }).then(function (content) {
        cb(null, content)
    }).catch(function (ex) {
        cb(ex, null);
    });
};

var Timetable = React.createClass({
    getInitialState: function () {
        return {
            today: moment(),
            weeklyTasks: {},
            user_id: -1,
            project_id: -1,
            activity_id: -1,
            allocation_id: -1,
            users: {},
            projects: {},
            activities: {},
            allocations: {},
            errorMsg: '',
            comment: '',
        };
    },
    componentDidMount: function () {
        var that = this;
        async.parallel({
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
        }, function (err, results) {
            if (err) {
                console.log('error in async parrallel', err);
                that.setState({ errorMsg: err });
            } else {
                var state = {}
                for (var k in results) {
                    state[k] = {};
                    state[k]['dict'] = arrayToMap(results[k]);
                    state[k]['list'] = results[k];
                }
                that.setState(state);
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
    render: function () {
        var dailyTasks = this.dailyTasks();

        return (
            <div>
                <form className='task-table'>
                    <SelectList values={this.state.users.list} label='Trigramme' cssclass='user' changeFunc={this.changeUser}/>
                    <JNTDatePicker date={this.state.today} changeDate={this.changeDate}/>
                    <SelectList values={this.state.projects.list} label='Projet' cssclass='project-select' id='project' changeFunc={this.changeProject}/>
                    <SelectList values={this.state.activities.list} label='Activité' cssclass='activity-select' id='activity' changeFunc={this.changeActivity}/>
                    <SelectList values={this.state.allocations.list} label='Temps' cssclass='allocation-select' id='allocation' changeFunc={this.changeAllocation}/>
                    <Comment comment={this.state.comment} updateComment={this.changeComment}/>
                    <div style={{ display: 'table-row' }}>
                        <input type='button' onClick={this.addTask} value='Ajouter cette tâche'  style={{ display: 'table-cell' }}/>
                    </div>
                </form>
                <div className='error'>{this.state.errorMsg}</div>
                <hr/>
                <DailySummary tasks={dailyTasks} deleteTasks={this.deleteDailyTasks}/>
                <hr/>
                <WeeklySummary tasks={this.state.weeklyTasks} date={this.state.today}/>
            </div>
        );
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
    changeProject: function (project_id) {
        this.setState({ project_id: parseInt(project_id) });
    },
    changeActivity: function (activity_id) {
        this.setState({ activity_id: parseInt(activity_id) });
    },
    changeAllocation: function (allocation_id) {
        this.setState({ allocation_id: parseInt(allocation_id) });
    },
    deleteDailyTasks: function (indexes) {
        var dailyTasks = [];
        var oldTasks = this.dailyTasks();
        for (var i = 0; i < oldTasks.length; i++) {
            if (indexes.indexOf(i) >= 0) {
                continue;
            }
            dailyTasks.push(oldTasks[i]);
        }
        var weeklyTasks = this.state.weeklyTasks;
        var today = this.state.today.format('YYYY-MM-DD');
        weeklyTasks[today] = dailyTasks;
        this.setState({ weeklyTasks: weeklyTasks, errorMsg: '' });
    },
    changeDate: function (d) {
        this.setState({ today: d, errorMsg: '' });
    },
    addTask: function () {
        if (!isWeekday(this.state.today)) {
            this.setState({ errorMsg: 'Veuillez sélectionner un jour de la semaine entre lundi et vendredi.' });
            return;
        }
        if (this.state.allocation_id == -1 || this.state.user_id == -1 || this.state.project_id == -1 || this.state.activity_id == -1) {
            this.setState({ errorMsg: 'Veuillez sélectionner un choix valide.' });
            return;
        }
        var today = this.state.today.format('YYYY-MM-DD');
        var dailyWorkedTime = this.computeDailyWorkedTime(today);
        if (dailyWorkedTime.err) {
            this.setState({ errorMsg: dailyWorkedTime.err });
            return;
        }

        var weeklyTasks = {};
        for (var k in this.state.weeklyTasks) {
            weeklyTasks[k] = this.state.weeklyTasks[k];
        }

        if (!(today in weeklyTasks))
            weeklyTasks[today] = [];
        var that = this;
        fetch('/users/' + this.state.user_id + '/tasks', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                project_id: this.state.project_id,
                activity_id: this.state.activity_id,
                allocation_id: this.state.allocation_id,
                comment: this.state.comment,
                date: today
            })
        }).then(function (response) {
            return response.json();
        }).then(function (content) {
            weeklyTasks[today].push({
                id: content.id,
                activity: that.state.activities.dict[that.state.activity_id],
                project: that.state.projects.dict[that.state.project_id],
                allocation: that.state.allocations.dict[that.state.allocation_id],
                comment: that.state.comment,
                date: today
            });
            that.setState({ weeklyTasks: weeklyTasks, errorMsg: '' });
        }).catch(function (ex) {
            console.log('parsing failed', ex)
        });
    },
    // TODO: to be check on the server
    computeDailyWorkedTime: function (today) {
        var dailyWorkedTime = 0;

        if (today in this.state.weeklyTasks) {
            var dailyTasks = this.state.weeklyTasks[today];
            for (var i = 0; i < dailyTasks.length; i++) {
                var task = dailyTasks[i];
                if (task.activity.id == this.state.activity_id && task.project.id == this.state.project_id) {
                    return { err: 'Cette tâche existe déjà pour la journée.', value: 0 };
                }
                dailyWorkedTime += task.allocation.value;
            }
        }
        if (dailyWorkedTime + this.state.allocations.dict[this.state.allocation_id].value > 1.) {
            return { err: "Vous ne pouvez pas travailler plus d'une journée le même jour.", value: 0 };

        }
        return { err: null, value: dailyWorkedTime };
    }
});


var DailyTask = React.createClass({
    getInitialState: function () {
        return {
            checked: false
        };
    },
    render: function () {
        return (
            <tr><td><input type="checkbox" value={this.state.checked} onChange={this.handleClick}/></td><td>{this.props.project.name}</td><td>{this.props.activity.name}</td><td>{this.props.allocation.name}</td><td>{this.props.comment}</td></tr>
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
        var i = 0;
        this.props.tasks.forEach(function (task) {
            rows.push(<DailyTask project={task.project} key={task.id} index={i} activity={task.activity} allocation={task.allocation} comment={task.comment} handleTaskClick={this.handleTaskClick}/>);
            i++;
        }.bind(this));
        return (
            <table>
                <caption>Journée en cours</caption>
                <tbody>
                    <tr>
                        <th>&nbsp; </th><th>Projet</th><th>Activité</th><th>Temps</th><th>Remarque</th>
                    </tr>
                    {rows}
                    <tr><td colSpan="4"><input type="button" value="Effacer les tâches" onClick={this.deleteTasks}/></td></tr>
                </tbody>
            </table>
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
            var date = this.props.date.clone().add(i - dow, 'day').format('YYYY-MM-DD');
            dates.push(date);
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
                    var taskKey = parseInt(task.id) + dates[i];
                    columns.push(<td key={taskKey}>{task.allocation.name}</td>);
                }
                rows.push(<tr key={key}><td>{p}</td><td>{activity}</td>{columns}<td></td><td></td></tr>);
            }
        }
        return (
            <table>
                <caption>Semaine en cours</caption>
                <tbody>
                    <tr>
                        <th>Projet</th><th>Activité</th><th>Lundi</th><th>Mardi</th><th>Mercredi</th><th>Jeudi</th><th>Vendredi</th><th>Total</th>
                    </tr>
                    {rows}
                    <tr><td><strong>Total</strong></td><td></td><td>{sumDays['0']}</td><td>{sumDays['1']}</td><td>{sumDays['2']}</td><td>{sumDays['3']}</td><td>{sumDays['4']}</td><td>{total}</td></tr>
                </tbody>
            </table>
        );
    },
});

var TASK_ID = 2;

ReactDOM.render(
    <Timetable />,
    // <FilterableProductTable products={PRODUCTS} />,
    document.getElementById('container')
);