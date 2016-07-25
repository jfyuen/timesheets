'use strict';

require('babel-register')

var React = require('react');
var ReactDOM = require('react-dom');
var moment = require('moment');
moment.locale('en-gb');
var DatePicker = require('react-datepicker');
require('../static/css/style.css');
require('react-datepicker/dist/react-datepicker.css');

var Option = React.createClass({
    render: function () {
        return (
            <option value={this.props.val.id}>{this.props.val.name}</option>
        );
    }
});


var SelectList = React.createClass({
    getInitialState: function () {
        var val = this.props.values[0].id;
        return {
            selected: val
        };
    },
    componentWillMount: function () {
        var val = this.props.values[0].id;
        this.props.changeFunc(val);

    },
    render: function () {
        var options = [];
        this.props.values.forEach(function (val) {
            options.push(<Option val={val} key={val.id}/>);
        }.bind(this));

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


var JNTDatePicker = React.createClass({
    render: function () {
        return (
            <div className='jnt-picker'>
                <label htmlFor='date' >Date</label>
                <div style={{ display: 'table-cell' }} >
                    <DatePicker selected={this.props.date} onChange={this.handleChange} dateFormat='DD/MM/YYYY' filterDate={this.isWeekday}  locale='en-gb'  excludeDates={this.props.jnt}/>

                    <input type='button' onClick={this.previousDay} value='Jour précédent'  className="button" style={{ display: 'table-cell' }}/>
                    <input type='button' onClick={this.nextDay} value='Jour suivant'  className="button" style={{ display: 'table-cell' }}/>
                </div>
            </div>
        );
    },

    isWorkingDay: function (d) {
        for (var i = 0; i < this.props.jnt.length; i++) {
            if (this.props.jnt[i].format('YYYY-MM-DD') == d.format('YYYY-MM-DD')) {
                return false;
            }
        }
        return this.isWeekday(d);
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

    isWeekday: function (d) {
        var dow = d.weekday();
        return dow < 5;
    }
});

var Comment = React.createClass({
    render: function () {
        return (
            <div className='comment'><label htmlFor='comment' className='comment-label'>Remarque</label><textarea id='comment'/></div>
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

var Timetable = React.createClass({
    getInitialState: function () {
        return {
            today: moment(),
            weeklyTasks: TASKS,
            user: null,
            project_id: null,
            activity_id: null,
            allocation_id: null,
            users: arrayToMap(USERS),
            projects: arrayToMap(PROJECTS),
            activities: arrayToMap(ACTIVITIES),
            allocations: arrayToMap(ALLOCATION),
        };
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
                    <SelectList values={USERS} label='Trigramme' cssclass='user' changeFunc={this.changeUser}/>
                    <JNTDatePicker jnt={JNT} date={this.state.today} changeDate={this.changeDate}/>
                    <SelectList values={PROJECTS} label='Projet' cssclass='project-select' id='project' changeFunc={this.changeProject}/>
                    <SelectList values={ACTIVITIES} label='Activité' cssclass='activity-select' id='activity' changeFunc={this.changeActivity}/>
                    <SelectList values={ALLOCATION} label='Temps' cssclass='allocation-select' id='allocation' changeFunc={this.changeAllocation}/>
                    <Comment />
                    <div style={{ display: 'table-row' }}>
                        <input type='button' onClick={this.addTime} value='Ajouter cette tâche'  style={{ display: 'table-cell' }}/>
                    </div>
                </form>
                <hr/>
                <DailySummary tasks={dailyTasks} deleteTasks={this.deleteDailyTasks}/>
                <hr/>
                <WeeklySummary tasks={this.state.weeklyTasks} date={this.state.today}/>
            </div>
        );
    },
    changeUser: function (user_id) {
        this.setState({ user_id: parseInt(user_id) });
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
        this.setState({ weeklyTasks: weeklyTasks });
    },
    changeDate: function (d) {
        this.setState({ today: d });
    },
    addTime: function () {
        var weeklyTasks = {};
        for (var k in this.state.weeklyTasks) {
            weeklyTasks[k] = this.state.weeklyTasks[k];
        }

        var today = this.state.today.format('YYYY-MM-DD');
        if (!(today in weeklyTasks))
            weeklyTasks[today] = [];
        TASK_ID++;
        weeklyTasks[today].push({
            id: TASK_ID,
            activity: this.state.activities[this.state.activity_id],
            project: this.state.projects[this.state.project_id],
            allocation: this.state.allocations[this.state.allocation_id],
            date: today
        })
        this.setState({ weeklyTasks: weeklyTasks });
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
            <tr><td><input type="checkbox" value={this.state.checked} onChange={this.handleClick}/></td><td>{this.props.project.name}</td><td>{this.props.activity.name}</td><td>{this.props.allocation.name}</td></tr>
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
            rows.push(<DailyTask project={task.project} key={task.id} index={i} activity={task.activity} allocation={task.allocation} handleTaskClick={this.handleTaskClick}/>);
            i++;
        }.bind(this));
        return (
            <table>
                <caption>Journée en cours</caption>
                <tbody>
                    <tr>
                        <th>&nbsp; </th><th>Projet</th><th>Activité</th><th>Temps</th>
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

var USERS = [
    { id: 0, name: 'JFY' },
    { id: 1, name: 'PCN' },
    { id: 2, name: 'BDS' },
]

var JNT = ['2016-01-29', '2016-02-26', '2016-03-25', '2016-04-15', '2016-05-06', '2016-07-15', '2016-08-26', '2016-10-31', '2016-12-26', '2016-12-27'];

for (var i = 0; i < JNT.length; i++) {
    JNT[i] = moment(JNT[i], 'YYYY-MM-DD');
}

var TASK_ID = 2;

var TASKS = {
    '2016-07-25': [{ id: 0, activity: { id: 0, name: 'Activity 1' }, project: { id: 0, name: 'Project A' }, allocation: { id: 0, name: '1', value: 1 }, date: '2016-07-25' }],
    '2016-07-28': [{ id: 1, activity: { id: 0, name: 'Activity 1' }, project: { id: 0, name: 'Project A' }, allocation: { id: 0, name: '1', value: 1 }, date: '2016-07-28' },
        { id: 2, activity: { id: 0, name: 'Activity 2' }, project: { id: 0, name: 'Project b' }, allocation: { id: 2, name: '1/2', value: 0.5 }, date: '2016-07-28' }]
}

var PROJECTS = [
    { id: 0, name: 'Project A' },
    { id: 1, name: 'Project B' },
    { id: 2, name: 'Project C' },
]

var ACTIVITIES = [
    { id: 0, name: 'Activity 1' },
    { id: 1, name: 'Activity 2' },
    { id: 2, name: 'Activity 3' },
]

var ALLOCATION = [
    { id: 0, name: '1', value: 1 },
    { id: 1, name: '3/4', value: 0.75 },
    { id: 2, name: '1/2', value: 0.5 },
    { id: 3, name: '1/4', value: 0.25 },
]

ReactDOM.render(
    <Timetable />,
    // <FilterableProductTable products={PRODUCTS} />,
    document.getElementById('container')
);