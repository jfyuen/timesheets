import React from 'react';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import { registerLocale } from 'react-datepicker';
import fr from 'date-fns/locale/fr';
import {Calendar, CalendarControls} from 'react-yearly-calendar';

import async from 'async';
moment.updateLocale('fr',{
    months : 'janvier_février_mars_avril_mai_juin_juillet_août_septembre_octobre_novembre_décembre'.split('_'),
    monthsShort : 'janv._févr._mars_avr._mai_juin_juil._août_sept._oct._nov._déc.'.split('_'),
    monthsParseExact : true,
    weekdays : 'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split('_'),
    weekdaysShort : 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
    weekdaysMin : 'Di_Lu_Ma_Me_Je_Ve_Sa'.split('_'),
    weekdaysParseExact : true,
    longDateFormat : {
        LT : 'HH:mm',
        LTS : 'HH:mm:ss',
        L : 'DD/MM/YYYY',
        LL : 'D MMMM YYYY',
        LLL : 'D MMMM YYYY HH:mm',
        LLLL : 'dddd D MMMM YYYY HH:mm'
    },
    calendar : {
        sameDay : '[Aujourd’hui à] LT',
        nextDay : '[Demain à] LT',
        nextWeek : 'dddd [à] LT',
        lastDay : '[Hier à] LT',
        lastWeek : 'dddd [dernier à] LT',
        sameElse : 'L'
    },
    relativeTime : {
        future : 'dans %s',
        past : 'il y a %s',
        s : 'quelques secondes',
        m : 'une minute',
        mm : '%d minutes',
        h : 'une heure',
        hh : '%d heures',
        d : 'un jour',
        dd : '%d jours',
        M : 'un mois',
        MM : '%d mois',
        y : 'un an',
        yy : '%d ans'
    },
    dayOfMonthOrdinalParse : /\d{1,2}(er|e)/,
    ordinal : function (number) {
        return number + (number === 1 ? 'er' : 'e');
    },
    meridiemParse : /PD|MD/,
    isPM : function (input) {
        return input.charAt(0) === 'M';
    },
    // In case the meridiem units are not separated around 12, then implement
    // this function (look at locale/id.js for an example).
    // meridiemHour : function (hour, meridiem) {
    //     return /* 0-23 hour, given meridiem token and hour 1-12 */ ;
    // },
    meridiem : function (hours, minutes, isLower) {
        return hours < 12 ? 'PD' : 'MD';
    },
    week : {
        dow : 1, // Monday is the first day of the week.
        doy : 4  // Used to determine first week of the year.
    }
});
moment.weekdays(true)
registerLocale('fr', fr);

require('./App.css');
require('./react-yearly-calendar.css');
require('react-datepicker/dist/react-datepicker.css');

const backendUrl = process.env.REACT_APP_BACKEND_URL || "";
console.log("using backend url:", backendUrl);

class Option extends React.Component {
    render() {
        return (
            <option value={this.props.val.id}>{this.props.val.name}</option>
        );
    }
}

class SelectList extends React.Component {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    render() {
        if (this.props.values && this.props.values.length <= 1) {
            return null;
        }
        const options = [<Option val='' key='-1' />];
        if (this.props.values) {
            this.props.values.forEach(function (val) {
                options.push(<Option val={val} key={val.id} />);
            });
        }

        return (
            <div className={this.props.cssclass}>
                <label htmlFor={this.props.id} className='select-label'>{this.props.label}</label><select className='select-form' value={this.props.selected} id={this.props.id} onChange={this.onChange}>
                    {options}
                </select>
            </div>
        );
    }
    onChange (e) {
        this.props.changeFunc(e.target.value);
    }
}


function isWeekday(d) {
    const dow = d.weekday();
    return dow < 5;
}

class JNTDatePicker extends React.Component {
    render() {
        const jnts = [];
        this.props.jnts.forEach(function (e) {
            jnts.push(moment(e, 'YYYY-MM-DD'));
        });
        const date = this.props.date.toDate();
        return (
            <div className='jnt-picker'>
                <label htmlFor='date' >Date ({this.props.date.format('dddd')}) </label>
                <div style={{ display: 'table-cell' }} >
                    <DatePicker selected={date} onChange={this.props.changeDate} dateFormat='dd/MM/yyyy' filterDate={this.isWeekday} locale='fr' excludeDates={jnts} />
                    <input type='button' onClick={this.props.previousDay} value='Jour précédent' className="button" style={{ display: 'table-cell' }} />
                    <input type='button' onClick={this.props.nextDay} value='Jour suivant' className="button" style={{ display: 'table-cell' }} />
                </div>
            </div>
        );
    }
}

function Comment(props) {
    return (
        <div className='comment'><label htmlFor='comment' className='comment-label'>Remarque</label><textarea id='comment' value={props.comment} onChange={props.updateComment} /></div>
    );
}

function arrayToMap(a) {
  const m = {};
    for (let i = 0; i < a.length; i++) {
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

function canUserBeDisplayed(user, d) {
    return !user.leave_date || moment(user.leave_date) >= d;
}

function filterSubMenu(id, sublist, name) {
    if (id === -1) {
        return [];
    }

    const lst = [];
    for (let i = 0; i < sublist.list.length; i++) {
        const elem = sublist.list[i];
        if (elem[name] === id) {
            lst.push(elem);
        }
    }
    return lst;
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
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
        this.dailyTasks = this.dailyTasks.bind(this);
        this.getProjectActivities = this.getProjectActivities.bind(this);
        this.getCategoryProjects = this.getCategoryProjects.bind(this);
        this.filterUsers = this.filterUsers.bind(this);
        this.goToToday = this.goToToday.bind(this);
        this.getWorkingDayCss = this.getWorkingDayCss.bind(this);
        this.isWorkingDay = this.isWorkingDay.bind(this);
        this.previousDay = this.previousDay.bind(this);
        this.nextDay = this.nextDay.bind(this);
        this.changeComment = this.changeComment.bind(this);
        this.changeUser = this.changeUser.bind(this);
        this.changeCategory = this.changeCategory.bind(this);
        this.changeProject = this.changeProject.bind(this);
        this.changeActivity = this.changeActivity.bind(this);
        this.changeAllocation = this.changeAllocation.bind(this);
        this.deleteDailyTasks = this.deleteDailyTasks.bind(this);
        this.changeDate = this.changeDate.bind(this);
        this.addTaskAndNextDay = this.addTaskAndNextDay.bind(this);
        this.addTask = this.addTask.bind(this);
    }

    componentDidMount() {
        const that = this;
        async.parallel({
            categories: function (cb) {
                fetcher(backendUrl + '/categories', cb);
            },
            activities: function (cb) {
                fetcher(backendUrl + '/activities', cb);
            },
            projects: function (cb) {
                fetcher(backendUrl + '/projects', cb);
            },
            allocations: function (cb) {
                fetcher(backendUrl + '/allocations', cb);
            },
            users: function (cb) {
                fetcher(backendUrl + '/users', cb);
            },
            jnts: function (cb) {
                fetcher(backendUrl + '/jnt', cb);
            }
        }, function (err, results) {
            if (err) {
                console.error('error in async parrallel', err);
                that.setState({ errorMsg: err });
            } else {
                const jntJson = results['jnts'];

                const jnts = new Set();

                for (let i = 0; i < jntJson.length; i++) {
                    jnts.add(jntJson[i]);
                }

                delete results['jnts'];
                const state = { jnts: jnts }
                for (const k in results) {
                    state[k] = {};
                    state[k]['dict'] = arrayToMap(results[k]);
                    state[k]['list'] = results[k];
                }
                that.setState(state);

                if (!that.isWorkingDay(that.state.today)) {
                    that.nextDay();
                }
            }
        });
    }

    dailyTasks() {
        if (!this.state.today) {
            return [];
        }
        const today = this.state.today.format('YYYY-MM-DD');
        if (today in this.state.weeklyTasks) {
            return this.state.weeklyTasks[today];
        }
        return [];
    }

    getProjectActivities(projectId) {
        return filterSubMenu(projectId, this.state.activities, 'project_id');
    }

    getCategoryProjects(categoryId) {
        return filterSubMenu(categoryId, this.state.projects, 'category_id');
    }

    filterUsers(today) {
        const users = [];
        if (this.state.users.list) {
            const current_date = today.startOf('day');
            for (let user of this.state.users.list) {
                if (canUserBeDisplayed(user, current_date)) {
                    users.push(user);
                }
            }
        }
        return users;
    }

    render() {
        const dailyTasks = this.dailyTasks();
        const that = this;
        const categoryProjects = this.getCategoryProjects(this.state.category_id);
        const projectActivities = this.getProjectActivities(this.state.project_id);
        const users = this.filterUsers(this.state.today);

        return (
            <div>
                <form className='task-table'>
                    <SelectList values={users} label='Trigramme' cssclass='user' changeFunc={this.changeUser} selected={this.state.user_id} />
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
                <hr style={{clear:'both'}}/>
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
                <a download='tasks.csv' href={backendUrl + '/tasks'}>Télécharger en csv</a>
            </div>
        );
    }

    goToToday() {
        this.changeDate(moment());
    }

    getWorkingDayCss(d) {
        if (this.isWorkingDay(d)) {
            const dStr = d.format('YYYY-MM-DD');
            if (!(dStr in this.state.weeklyTasks)) {
                return '';
            }
            const tasks = this.state.weeklyTasks[dStr];
            let total = 0;
            for (let i = 0; i < tasks.length; i++) {
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
    }

    isWorkingDay(d) {
        if (this.state.jnts.has(d.format('YYYY-MM-DD'))) {
            return false;
        }
        return isWeekday(d);
    }

    previousDay() {
        let d = this.state.today.clone().add(-1, 'day');
        while (!this.isWorkingDay(d)) {
            d.add(-1, 'day');
        }
        this.changeDate(d);
    }

    nextDay() {
        let d = this.state.today.clone().add(1, 'day');
        while (!this.isWorkingDay(d)) {
            d.add(1, 'day');
        }
        this.changeDate(d);
    }

    changeComment(e) {
        this.setState({ comment: e.target.value });
    }

    changeUser(user_id) {
        const that = this;
        fetch(backendUrl + '/users/' + user_id + '/tasks').then(function (response) {
            return response.json();
        }).then(function (content) {
            const weeklyTasks = {};
            for (let i = 0; i < content.length; i++) {
                const task = content[i];
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
            console.error(ex);
            that.setState({ errorMsg: 'Error in receiving user tasks' + ex });
        });
    }

    changeCategory(category_id) {
        const categoryId = parseInt(category_id);
        const projects = this.getCategoryProjects(categoryId);
        if (projects.length === 1) {
            const projectId = projects[0].id;
            this.setState({ category_id: categoryId, project_id: projectId, activity_id: -1 });
            this.changeProject(projectId);
        } else {
            this.setState({ category_id: categoryId, project_id: -1, activity_id: -1 });
        }
    }

    changeProject(project_id) {
        const projectId = parseInt(project_id);
        const activities = this.getProjectActivities(projectId);
        if (activities.length === 1) {
            this.setState({ project_id: projectId, activity_id: activities[0].id });
        } else {
            this.setState({ project_id: projectId, activity_id: -1 });
        }
    }

    changeActivity(activity_id) {
        this.setState({ activity_id: parseInt(activity_id) });
    }

    changeAllocation(allocation_id) {
        this.setState({ allocation_id: parseInt(allocation_id) });
    }

    deleteDailyTasks(indexes) {
        const that = this;
        fetch(backendUrl + '/tasks/' + indexes.join(), {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }

        }).then(function (response) {
            return response.json();
        }).then(function (content) {
            const dailyTasks = [];
            const oldTasks = that.dailyTasks();
            for (let i = 0; i < oldTasks.length; i++) {
                if (indexes.indexOf(oldTasks[i].id) >= 0) {
                    continue;
                }
                dailyTasks.push(oldTasks[i]);
            }
            const weeklyTasks = that.state.weeklyTasks;
            const today = that.state.today.format('YYYY-MM-DD');
            weeklyTasks[today] = dailyTasks;
            that.setState({ weeklyTasks: weeklyTasks, errorMsg: '' });
        }).catch(function (ex) {
            console.error(ex)
            that.setState({ errorMsg: ex });
        });
    }

    changeDate(d) {
        d = moment(d);
        let user_id = this.state.user_id;
        if (this.state.user_id && (this.state.user_id in this.state.users.dict)) {
            const current_date = d.startOf('day');
            let user = this.state.users.dict[this.state.user_id];
            if (!canUserBeDisplayed(user, current_date)) {
                user_id = -1;
            }
        }
        this.setState({ today: d, errorMsg: '', user_id: user_id });
    }

    addTaskAndNextDay(event) {
        event.preventDefault();
        this.addTask(event, this.nextDay);
    }

    addTask(event, cb) {
        event.preventDefault();
        if (!isWeekday(this.state.today)) {
            this.setState({ errorMsg: 'Veuillez sélectionner un jour de la semaine entre lundi et vendredi.' });
            return;
        }
        if (this.state.allocation_id === -1 || this.state.user_id === -1 || this.state.project_id === -1 || this.state.activity_id === -1 || this.state.category_id === -1) {
            this.setState({ errorMsg: 'Veuillez sélectionner un choix valide.' });
            return;
        }
        const today = this.state.today.format('YYYY-MM-DD');

        const that = this;
        fetch(backendUrl + '/users/' + this.state.user_id + '/tasks', {
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
                const weeklyTasks = {};
                for (let k in that.state.weeklyTasks) {
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
    }
}


class DailyTask extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            checked: false
        };
        this.handleClick = this.handleClick.bind(this);
    }
    render() {
        return (
            <tr><td><input type="checkbox" value={this.state.checked} onChange={this.handleClick} /> {this.props.project.name}</td><td>{this.props.activity.name}</td><td>{this.props.allocation.name}</td><td>{this.props.comment}</td></tr>
        );
    }
    handleClick() {
        const newState = !this.state.checked;
        this.setState({ checked: newState });
        this.props.handleTaskClick(this.props.index, newState);
    }
}

class DailySummary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            checkedIndexes: {},
        };
        this.deleteTasks = this.deleteTasks.bind(this);
        this.handleTaskClick = this.handleTaskClick.bind(this);
    }
    render() {
        const rows = [];
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
    }

    deleteTasks() {
        const indexes = [];
        for (let k in this.state.checkedIndexes) {
            if (this.state.checkedIndexes[k])
                indexes.push(parseInt(k));
        }
        this.props.deleteTasks(indexes);
        this.setState({ checkedIndexes: {} });
    }

    handleTaskClick(index, checked) {
        const checkedIndexes = {};
        for (const k in this.state.checkedIndexes) {
            checkedIndexes[k] = this.state.checkedIndexes[k];
        }
        checkedIndexes[index] = checked;
        this.setState({ checkedIndexes: checkedIndexes });
    }
}

class WeeklySummary extends React.Component {
    render() {
        const dow = this.props.date.weekday();

        const projects = {};
        const defaultAllocation = { allocation: { name: '', value: 0 } }
        const sumDays = {};
        let total = 0;
        const dates = []
        for (let i = 0; i < 5; i++) {
            sumDays[i] = 0;
            const d = this.props.date.clone().add(i - dow, 'day');
            dates.push(d);
            const date = d.format('YYYY-MM-DD');
            if (date in this.props.tasks) {

                const dailyProject = this.props.tasks[date];

                for (let j = 0; j < dailyProject.length; j++) {
                    const projectName = dailyProject[j].project.name;
                    if (!(projectName in projects)) {
                        projects[projectName] = {};
                    }
                    const activity = dailyProject[j].activity.name;
                    if (!(activity in projects[projectName])) {
                        projects[projectName][activity] = [defaultAllocation, defaultAllocation, defaultAllocation, defaultAllocation, defaultAllocation];
                    }
                    projects[projectName][activity][i] = dailyProject[j];
                    sumDays[i] += dailyProject[j].allocation.value;
                    total += dailyProject[j].allocation.value;
                }
            }
        }

        const rows = [];
        for (let p in projects) {
            let key = p;
            for (const activity in projects[p]) {
                key += activity;
                const columns = [];
                for (let i = 0; i < 5; i++) {
                    const task = projects[p][activity][i];
                    const taskKey = parseInt(task.id) + dates[i].format('YYYY-MM-DD');
                    columns.push(<td key={taskKey}>{task.allocation.name}</td>);
                }
                rows.push(<tr key={key}><td>{p}</td><td>{activity}</td>{columns}<td></td></tr>);
            }
        }

        const totalCells = [];
        const dateNames = []
        let workingDaysInWeek = 0;
        for (let i = 0; i < 5; i++) {
            const s = parseInt(i);
            const workingDay = this.props.isWorkingDay(dates[i]);
            totalCells.push(<TotalCell total={sumDays[s]} key={'totalCell' + s} workingDay={workingDay} />);
            let selectedCss = '';
            if (dates[i].format('YYYY-MM-DD') === this.props.date.format('YYYY-MM-DD')) {
                selectedCss = 'selected';
            }
            dateNames.push(<th key={'date' + s} className={selectedCss}>{dates[i].format('dddd (DD/MM)')}</th>);
            if (workingDay) {
                workingDaysInWeek++;
            }
        }

        const totalCss = total === workingDaysInWeek ? 'green' : 'grey';
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
    }
}

class TotalCell extends React.Component {
    render() {
        let css = '';
        let total = '';
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
}

export default App;