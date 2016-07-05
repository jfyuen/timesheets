'use strict';

require('babel-register')

var React = require('react');
var ReactDOM = require('react-dom');
var DatePicker = require('react-datepicker');
var moment = require('moment');
require('../static/css/style.css');

var Option = React.createClass({
    render: function () {
        return (
            <option value="{this.props.val.id}">{this.props.val.name}</option>
        );
    }
});


var SelectList = React.createClass({
    render: function () {
        var selected = '';
        var options = [];
        this.props.values.forEach(function (val) {
            options.push(<Option val={val} key={val.id}/>);
        }.bind(this));

        return (
            <div className={this.props.cssclass}>
                <label htmlFor={this.props.id} className='select-label'>{this.props.label}</label><select className='select-form' value="{selected}" id={this.props.id}>
                    {options}
                </select>
            </div>
        );
    }
});


var JNTDatePicker = React.createClass({
    render: function () {
        return (
            <div className='jnt-picker'>
                <label htmlFor='date' style={{ display: 'table-cell' }}>Date</label>
                <input value={this.props.date} onChange={this.handleChange} className='date' id='date' style={{ display: 'table-cell' }}/>
                <input type='button' onClick={this.previousDay} value='Jour précédent'  className="button" style={{ display: 'table-cell' }}/>
                <input type='button' onClick={this.nextDay} value='Jour suivant'  className="button" style={{ display: 'table-cell' }}/>
            </div>
        );
    },

    previousDay: function () {
        this.props.addDay(-1);
    },

    nextDay: function () {
        this.props.addDay(1);
    },
    handleChange: function () {
        console.log('change');
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

var Timetable = React.createClass({
    getInitialState: function () {
        return {
            today: moment(),
        };
    },
    render: function () {
        var dailyTasks = [{ project: PROJECTS[0], activity: ACTIVITIES[0], allocation: ALLOCATION[0] }];
        var weeklyTasks = TASKS;
        var today = this.state.today.format('DD/MM/YYYY');
        return (
            <div>
                <form className='task-table'>
                    <SelectList values={USERS} label='Trigramme' cssclass='user'/>
                    <JNTDatePicker jnt={JNT} date={today} addDay={this.addDay}/>
                    <SelectList values={PROJECTS} label='Projet' cssclass='project-select' id='project'/>
                    <SelectList values={ACTIVITIES} label='Activité' cssclass='activity-select' id='activity'/>
                    <SelectList values={ALLOCATION} label='Temps' cssclass='allocation-select' id='allocation'/>
                    <Comment />
                    <div style={{ display: 'table-row' }}>
                        <input type='button' onClick={this.addTime} value='Ajouter cette tâche'  style={{ display: 'table-cell' }}/>
                    </div>
                </form>
                <hr/>
                <DailySummary tasks={dailyTasks}/>
                <hr/>
                <WeeklySummary tasks={weeklyTasks}/>
            </div>
        );
    },
    addDay: function (v) {
        var today = this.state.today.add(v, 'day');
        this.setState({ today: today });
    },
    addTime: function () {
        console.log('add time');
    }
});


var DailyTask = React.createClass({
    getInitialState: function () {
        return {
            checked: this.props.checked || false
        };
    },
    render: function () {
        var checked = false;
        return (
            <tr><td><input type="checkbox" checked={this.state.checked}  onClick={this.handleClick}/></td><td>{this.props.project.name}</td><td>{this.props.activity.name}</td><td>{this.props.allocation.name}</td></tr>
        );
    },
    handleClick: function (e) {
        this.setState({ checked: e.target.checked });
    }
});

var DailySummary = React.createClass({
    render: function () {
        var rows = [];
        var i = 0;
        this.props.tasks.forEach(function (task) {
            rows.push(<DailyTask project={task.project} key={i} activity={task.activity} allocation={task.allocation}/>);
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
                    <tr><td colSpan="4"><input type="button" value="Effacer les tâches" onClick={this.deleteTask}/></td></tr>
                </tbody>
            </table>
        );
    },
    deleteTask: function () {
        console.log('delete task');
    }
});

var WeeklySummary = React.createClass({
    render: function () {
        var today = moment();
        var dow = today.weekday();
        var days = {};
        var projects = new Set();
        for (var i = 0; i < 5; i++) {
            var key = moment().add(i - dow + 1, 'day').format('YYYY-MM-DD');
            days[i] = {};
            if (key in this.props.tasks) {
                var dailyProject = this.props.tasks[key];

                for (var j = 0; j < dailyProject.length; j++) {
                    days[i][dailyProject[j].project.name] = dailyProject[j].allocation;
                    projects.add(dailyProject[j].project.name);
                }
            }
        }

        var rows = [];
        var total = 0;
        var sumDays = {}

        projects.forEach(function (p) {
            var projectdays = {};
            var projectTotal = 0;
            for (var i = 0; i < 5; i++) {
                if (!(p in days[i])) {
                    projectdays[i] = '';
                } else {
                    projectdays[i] = days[i][p];
                    projectTotal += days[i][p].value;
                    total += days[i][p].value;
                }
            }
            rows.push(<tr key={p}><td></td><td>{p}</td><td>{projectdays['0'].name}</td><td>{projectdays['1'].name}</td><td>{projectdays['2'].name}</td><td>{projectdays['3'].name}</td><td>{projectdays['4'].name}</td><td>{projectTotal}</td></tr>)
        }.bind(this));
        return (
            <table>
                <caption>Semaine en cours</caption>
                <tbody>
                    <tr>
                        <th>Volet</th><th>Projet</th><th>Lundi</th><th>Mardi</th><th>Mercredi</th><th>Jeudi</th><th>Vendredi</th><th>Total</th>
                    </tr>
                    {rows}
                    <tr><td><strong>Total</strong></td><td></td><td>{sumDays['0']}</td><td>{sumDays['1']}</td><td>{sumDays['2']}</td><td>{sumDays['3']}</td><td>{sumDays['4']}</td><td>{total}</td></tr>
                </tbody>
            </table>
        );
    },
    deleteTask: function () {
        console.log('delete task');
    }
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

var TASKS = {
    '2016-07-04': [{ id: 0, activity: { id: 0, name: 'Activity 1' }, project: { id: 0, name: 'Project A' }, allocation: { id: 0, name: '1', value: 1 }, date: '2016-07-04' }],
    '2016-07-05': [{ id: 0, activity: { id: 0, name: 'Activity 1' }, project: { id: 0, name: 'Project A' }, allocation: { id: 0, name: '1', value: 1 }, date: '2016-07-05' },
        { id: 0, activity: { id: 0, name: 'Activity 2' }, project: { id: 0, name: 'Project b' }, allocation: { id: 2, name: '1/2', value: 0.5 }, date: '2016-07-05' }]
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