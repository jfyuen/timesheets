var fs = require('fs');
var config = require('../config');
var file = config.dbPath + '/' + 'timesheets.db';
var exists = fs.existsSync(file);
var moment = require('moment');

if (!exists) {
    console.log('Creating DB file.');
    fs.openSync(file, 'w');
}

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(file);

// db.on('trace', function (q) {
//     console.log(q);
// });

var dbWrapper = {
    db: db,
    addToTable: function (table, data) {
        var stmt = db.prepare('INSERT INTO ' + table + '(ID, NAME) VALUES (?, ?)');
        for (var i = 0; i < data.length; i++) {
            var row = data[i];
            stmt.run(row.id, row.name);
        }
        stmt.finalize();
    },
    createEmpty: function () {
        db.serialize(function () {

            var users = [
                { id: 0, name: 'JFY' },
                { id: 1, name: 'PCN' },
                { id: 2, name: 'BDS' }
            ];


            var projects = [
                { id: 0, name: 'Project 1' },
                { id: 1, name: 'Project 2' },
                { id: 2, name: 'Project 3' }
            ];

            var tablesData = [{ table: 'PROJECTS', data: projects }, { table: 'USERS', data: users }]
            for (var i = 0; i < tablesData.length; i++) {
                var t = tablesData[i];
                this.db.run('CREATE TABLE ' + t.table + ' (ID INTEGER PRIMARY KEY, NAME TEXT NOT NULL)');
                this.addToTable(t.table, t.data);
            }

            var activities = [
                { id: 0, name: 'Activity 1', project_id: 0 },
                { id: 1, name: 'Activity 2', project_id: 0 },
                { id: 2, name: 'Activity 3', project_id: 1 },
                { id: 3, name: 'Activity 3', project_id: 2 },
            ];

            this.db.run('CREATE TABLE ACTIVITIES (ID INTEGER PRIMARY KEY, NAME TEXT NOT NULL, PROJECT_ID INTEGER NOT NULL,\
                FOREIGN KEY (PROJECT_ID) REFERENCES PROJECTS(ID))');
            var stmt = db.prepare('INSERT INTO ACTIVITIES(ID, NAME, PROJECT_ID) VALUES (?, ?, ?)');
            for (var i = 0; i < activities.length; i++) {
                var row = activities[i];
                stmt.run(row.id, row.name, row.project_id);
            }
            stmt.finalize();

            var allocations = [
                { id: 0, name: '1', value: 1 },
                { id: 1, name: '3/4', value: 0.75 },
                { id: 2, name: '1/2', value: 0.5 },
                { id: 3, name: '1/4', value: 0.25 }
            ];
            this.db.run('CREATE TABLE TIME_ALLOCATION(ID INTEGER PRIMARY KEY, NAME TEXT NOT NULL, VALUE REAL NOT NULL)');
            stmt = db.prepare('INSERT INTO TIME_ALLOCATION(ID, NAME, VALUE) VALUES (?, ?, ?)');
            for (var i = 0; i < allocations.length; i++) {
                var row = allocations[i];
                stmt.run(row.id, row.name, row.value);
            }
            stmt.finalize();

            this.db.run('CREATE TABLE NON_WORKING_DAYS (DAY DATE PRIMARY KEY)');
            var nonWorkingDays = [
                '2016-01-01',
                '2016-01-29',
                '2016-02-26',
                '2016-03-25',
                '2016-03-28',
                '2016-04-15',
                '2016-05-05',
                '2016-05-06',
                '2016-05-16',
                '2016-07-14',
                '2016-07-15',
                '2016-08-15',
                '2016-08-26',
                '2016-10-31',
                '2016-11-01',
                '2016-11-11',
                '2016-12-26',
                '2016-12-27',
            ];
            var stmt = this.db.prepare('INSERT INTO NON_WORKING_DAYS(DAY) VALUES (strftime("%Y-%m-%d", ?))');
            for (var i = 0; i < nonWorkingDays.length; i++) {
                stmt.run(nonWorkingDays[i]);
            }
            stmt.finalize();

            this.db.run('CREATE TABLE TASKS (\
                USER_ID INTEGER NOT NULL,\
                TIME_ALLOCATION_ID INTEGER NOT NULL,\
                ACTIVITY_ID INTEGER NOT NULL,\
                DAY DATE NOT NULL,\
                COMMENT TEXT,\
                FOREIGN KEY (USER_ID) REFERENCES USER(ID),\
                FOREIGN KEY (TIME_ALLOCATION_ID) REFERENCES TIME_ALLOCATION(ID),\
                FOREIGN KEY (ACTIVITY_ID) REFERENCES ACTIVITIES(ID))');
            this.addTask(0, 0, 0, '2016-07-25', '', null);
            this.addTask(0, 0, 0, '2016-07-28', '', null);
            this.addTask(0, 1, 2, '2016-07-28', '', null);
        }.bind(this));
    },
    close: function () {
        this.db.close();
    },
    addTask: function (user_id, activity_id, allocation_id, day, comment, cb) {
        this.db.run('INSERT INTO TASKS(USER_ID, TIME_ALLOCATION_ID, ACTIVITY_ID, DAY, COMMENT) VALUES (?, ?, ?, strftime("%Y-%m-%d", ?), ?)',
            [user_id, allocation_id, activity_id, day, comment],
            function (err) {
                if (cb) {
                    if (err) {
                        cb(err, null);
                    } else {
                        cb(null, { id: this.lastID });
                    }
                }
            });
    },
    getAllTasks: function (cb) {
        var results = [];
        this.db.each('SELECT p.NAME as PROJECT, a.NAME as ACTIVITY, t.VALUE as TIME, DAY, u.NAME as USER, COMMENT FROM TASKS, ACTIVITIES a, PROJECTS p, USERS u, TIME_ALLOCATION t WHERE TASKS.ACTIVITY_ID = a.ID AND a.PROJECT_ID = p.ID AND TASKS.USER_ID = u.ID AND TASKS.TIME_ALLOCATION_ID = t.ID ORDER BY DAY, USER', function (err, row) {
            if (!err) {
                var r = {
                    project: row.PROJECT,
                    activity: row.ACTIVITY,
                    time: row.TIME,
                    date: row.DAY,
                    user: row.USER,
                    comment: row.COMMENT,
                };
                results.push(r);
            }
        }, function (err, size) {
            cb(err, results);
        });
    },
    deleteTasks: function (task_ids, cb) {
        this.db.run('DELETE FROM TASKS where rowid in (?)',
            task_ids,
            function (err) {
                if (cb) {
                    if (err) {
                        cb(err, null);
                    } else {
                        cb(null, { changes: this.changes });
                    }
                }
            });
    },
    getUserTasks: function (user_id, cb) {
        var results = [];
        this.db.each('SELECT TASKS.rowid as ID, PROJECT_ID, ACTIVITY_ID, TIME_ALLOCATION_ID, DAY, COMMENT FROM TASKS, ACTIVITIES WHERE USER_ID = ? AND TASKS.ACTIVITY_ID = ACTIVITIES.ID', [user_id], function (err, row) {
            if (!err) {
                var r = {
                    id: row.ID,
                    activity_id: row.ACTIVITY_ID,
                    project_id: row.PROJECT_ID,
                    allocation_id: row.TIME_ALLOCATION_ID,
                    comment: row.COMMENT,
                    date: row.DAY
                };
                results.push(r);
            }
        }, function (err, size) {
            cb(err, results);
        });
    },
    queryTable: function (table, cb) {
        var results = [];
        this.db.each('SELECT ID, NAME FROM ' + table + ' order by NAME', function (err, row) {
            if (!err) {
                results.push({ id: row.ID, name: row.NAME });
            }
        }, function (err, size) {
            cb(err, results);
        });
    },
    getUsers: function (cb) {
        this.queryTable('USERS', cb);
    },
    getAllocations: function (cb) {
        var results = [];
        this.db.each('SELECT ID, NAME, VALUE from TIME_ALLOCATION order by VALUE DESC', function (err, row) {
            if (!err) {
                results.push({ id: row.ID, name: row.NAME, value: row.VALUE });
            }
        }, function (err, size) {
            cb(err, results);
        });
    },
    getProjects: function (cb) {
        this.queryTable('PROJECTS', cb);
    },
    getActivities: function (cb) {
        var results = [];
        this.db.each('SELECT ID, NAME, PROJECT_ID FROM ACTIVITIES order by NAME', function (err, row) {
            if (!err) {
                results.push({ id: row.ID, name: row.NAME, project_id: row.PROJECT_ID });
            }
        }, function (err, size) {
            cb(err, results);
        });
    },
    getNonWorkingDays: function (cb) {
        var results = [];
        this.db.each("SELECT DAY FROM NON_WORKING_DAYS order by DAY", function (err, row) {
            if (!err) {
                results.push(row.DAY);
            }
        }, function (err, size) {
            cb(err, results);
        });
    },
}

if (!exists) {
    dbWrapper.createEmpty();
} else {
    console.log('Using database file ', file);
}

module.exports = dbWrapper;
