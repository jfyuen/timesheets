const fs = require('fs');
const config = require('../config');
const file = config.dbPath + '/' + 'timesheets.db';
const exists = fs.existsSync(file);
const moment = require('moment');

if (!exists) {
    console.log('Creating DB file.');
    fs.openSync(file, 'w');
}

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(file);

// db.on('trace', function (q) {
//     console.log(q);
// });

const dbWrapper = {
    db: db,
    createEmpty: function () {
        db.serialize(function () {

            const users = [
                { id: 0, name: 'JFY', leave_date: null },
                { id: 1, name: 'PCN', leave_date: null  },
                { id: 2, name: 'BDS', leave_date: null  },
                { id: 3, name: 'NOT_DISPLAYED_AFTER_TODAY', leave_date: moment().format('YYYY-MM-DD') },
            ];

            this.db.run('CREATE TABLE USERS (ID INTEGER PRIMARY KEY, NAME TEXT NOT NULL, LEAVE_DATE DATE)');
            let stmt = db.prepare('INSERT INTO USERS(ID, NAME, LEAVE_DATE) VALUES (?, ?, strftime("%Y-%m-%d", ?))');
            for (let i = 0; i < users.length; i++) {
                const row = users[i];
                stmt.run(row.id, row.name, row.leave_date);
            }
            stmt.finalize();


            const categories = [
                { id: 0, name: 'Category 1' },
                { id: 1, name: 'Category 2' },
            ];

            this.db.run('CREATE TABLE CATEGORIES (ID INTEGER PRIMARY KEY, NAME TEXT NOT NULL)');
            stmt = db.prepare('INSERT INTO CATEGORIES(ID, NAME) VALUES (?, ?)');
            for (let i = 0; i < categories.length; i++) {
                const row = categories[i];
                stmt.run(row.id, row.name);
            }
            stmt.finalize();


            const projects = [
                { id: 0, name: 'Project 1 (aa baba)' , category_id: 0},
                { id: 1, name: 'Project 2', category_id: 0 },
                { id: 2, name: 'Project 3(eee)))', category_id: 1 }
            ];

            this.db.run('CREATE TABLE PROJECTS (ID INTEGER PRIMARY KEY, NAME TEXT NOT NULL, CATEGORY_ID INTEGER NOT NULL,\
                FOREIGN KEY (CATEGORY_ID) REFERENCES CATEGORIES(ID))');
            stmt = db.prepare('INSERT INTO PROJECTS(ID, NAME, CATEGORY_ID) VALUES (?, ?, ?)');
            for (let i = 0; i < projects.length; i++) {
                const row = projects[i];
                stmt.run(row.id, row.name, row.category_id);
            }
            stmt.finalize();


            const activities = [
                { id: 0, name: 'Activity 1', project_id: 0 },
                { id: 1, name: 'Activity 2', project_id: 0 },
                { id: 2, name: 'Activity 3', project_id: 1 },
                { id: 3, name: 'Activity 3', project_id: 2 },
            ];

            this.db.run('CREATE TABLE ACTIVITIES (ID INTEGER PRIMARY KEY, NAME TEXT NOT NULL, PROJECT_ID INTEGER NOT NULL,\
                FOREIGN KEY (PROJECT_ID) REFERENCES PROJECTS(ID))');
            stmt = db.prepare('INSERT INTO ACTIVITIES(ID, NAME, PROJECT_ID) VALUES (?, ?, ?)');
            for (let i = 0; i < activities.length; i++) {
                const row = activities[i];
                stmt.run(row.id, row.name, row.project_id);
            }
            stmt.finalize();

            const allocations = [
                { id: 0, name: '1', value: 1 },
                { id: 1, name: '3/4', value: 0.75 },
                { id: 2, name: '1/2', value: 0.5 },
                { id: 3, name: '1/4', value: 0.25 }
            ];
            this.db.run('CREATE TABLE TIME_ALLOCATION(ID INTEGER PRIMARY KEY, NAME TEXT NOT NULL, VALUE REAL NOT NULL)');
            stmt = db.prepare('INSERT INTO TIME_ALLOCATION(ID, NAME, VALUE) VALUES (?, ?, ?)');
            for (let i = 0; i < allocations.length; i++) {
                const row = allocations[i];
                stmt.run(row.id, row.name, row.value);
            }
            stmt.finalize();

            this.db.run('CREATE TABLE NON_WORKING_DAYS (DAY DATE PRIMARY KEY)');
            const nonWorkingDays = [
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
            stmt = this.db.prepare('INSERT INTO NON_WORKING_DAYS(DAY) VALUES (strftime("%Y-%m-%d", ?))');
            for (let i = 0; i < nonWorkingDays.length; i++) {
                stmt.run(nonWorkingDays[i]);
            }
            stmt.finalize();

            this.db.run('CREATE TABLE TASKS (\
                USER_ID INTEGER NOT NULL,\
                TIME_ALLOCATION_ID INTEGER NOT NULL,\
                ACTIVITY_ID INTEGER NOT NULL,\
                DAY DATE NOT NULL,\
                COMMENT TEXT,\
                FOREIGN KEY (USER_ID) REFERENCES USERS(ID),\
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
        let total = 0;
        let taskValue = 0.;
        let hasTask = false;
        let leaveDate = null;
        const that = this;
        this.db.each('SELECT TASKS.ACTIVITY_ID, t.VALUE from TASKS, TIME_ALLOCATION t where TASKS.TIME_ALLOCATION_ID = t.ID and TASKS.DAY = strftime("%Y-%m-%d", ?) and TASKS.USER_ID = ?',
            [day, user_id], function (err, row) {
                if (!err) {
                    total += row.VALUE;
                    hasTask |= row.ACTIVITY_ID == activity_id;
                }
            }, function (err, size) {
                if (!cb) {
                    return;
                }
                if (err) {
                    cb(err, null);
                    return;
                }
                if (hasTask) {
                    cb('Cette tâche existe déjà pour la journée.', null);
                    return;
                }
                that.db.each('SELECT VALUE from TIME_ALLOCATION where TIME_ALLOCATION.ID = ?',
                    [allocation_id], function (err, row) {
                        if (!err) {
                            taskValue = row.VALUE;
                        }
                    }, function (err, size) {
                        if (!cb) {
                            return;
                        }
                        if (err) {
                            cb(err, null);
                            return;
                        }

                        if (size != 1) {
                            cb('Got ' + parseInt(size) + ' tasks instead of 1', null);
                            return;
                        }
                        if (total + taskValue > 1.) {
                            cb("Vous ne pouvez pas travailler plus d'une journée le même jour.", null);
                            return;
                        }

                        that.db.each('SELECT LEAVE_DATE from USERS where ID = ?', [user_id], function (err, row) {
                                if (!err) {
                                    leaveDate = row.LEAVE_DATE;
                                }
                            }, function (err) {
                                if (!cb) {
                                    return;
                                }
                                if (err) {
                                    cb(err, null);
                                    return;
                                }
                                if (leaveDate && moment(leaveDate).startOf('day') < moment(day).startOf('day')) {
                                    cb("Vous ne pouvez pas rajouter d'activités à quelqu'un déjà parti.", null);
                                    return;
                                }
                                that.db.run('INSERT INTO TASKS(USER_ID, TIME_ALLOCATION_ID, ACTIVITY_ID, DAY, COMMENT) VALUES (?, ?, ?, strftime("%Y-%m-%d", ?), ?)',
                                    [user_id, allocation_id, activity_id, day, comment],
                                    function (err) {
                                        if (!cb) {
                                            return;
                                        }
                                        if (err) {
                                            cb(err, null);
                                            return
                                        }
                                        cb(null, { id: this.lastID });
                                    });
                            });
                    });
            });
    },
    getAllTasks: function (cb) {
        const results = [];
        this.db.each('SELECT p.NAME as PROJECT, a.NAME as ACTIVITY, t.VALUE as TIME, DAY, u.NAME as USER, COMMENT FROM TASKS, ACTIVITIES a, PROJECTS p, USERS u, TIME_ALLOCATION t WHERE TASKS.ACTIVITY_ID = a.ID AND a.PROJECT_ID = p.ID AND TASKS.USER_ID = u.ID AND TASKS.TIME_ALLOCATION_ID = t.ID ORDER BY DAY, USER', function (err, row) {
            if (!err) {
                const r = {
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
        let query = '';
        for (let i = 0; i < task_ids.length; i++) {
            query += '?';
            if (i < task_ids.length - 1) {
                query += ',';
            }
        }
        this.db.run('DELETE FROM TASKS where rowid in (' + query + ')',
            task_ids,
            function (err) {
                if (!cb) {
                    return;
                }
                if (err) {
                    cb(err, null);
                } else {
                    cb(null, { changes: this.changes });
                }
            });
    },
    getUserTasks: function (user_id, cb) {
        const results = [];
        this.db.each('SELECT TASKS.rowid as ID, PROJECT_ID, ACTIVITY_ID, TIME_ALLOCATION_ID, DAY, COMMENT FROM TASKS, ACTIVITIES WHERE USER_ID = ? AND TASKS.ACTIVITY_ID = ACTIVITIES.ID', [user_id], function (err, row) {
            if (!err) {
                const r = {
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
    getUsers: function (cb) {
        const results = [];
        this.db.each('SELECT ID, NAME, LEAVE_DATE FROM USERS order by NAME', function (err, row) {
            if (!err) {
                results.push({ id: row.ID, name: row.NAME, leave_date: row.LEAVE_DATE });
            }
        }, function (err, size) {
            cb(err, results);
        });
    },
    getAllocations: function (cb) {
        const results = [];
        this.db.each('SELECT ID, NAME, VALUE from TIME_ALLOCATION order by VALUE DESC', function (err, row) {
            if (!err) {
                results.push({ id: row.ID, name: row.NAME, value: row.VALUE });
            }
        }, function (err, size) {
            cb(err, results);
        });
    },
    getCategories: function (cb) {
        const results = [];
        this.db.each('SELECT ID, NAME FROM CATEGORIES order by NAME', function (err, row) {
            if (!err) {
                results.push({ id: row.ID, name: row.NAME });
            }
        }, function (err, size) {
            cb(err, results);
        });
    },
    getActivities: function (cb) {
        const results = [];
        this.db.each('SELECT ID, NAME, PROJECT_ID FROM ACTIVITIES order by NAME', function (err, row) {
            if (!err) {
                results.push({ id: row.ID, name: row.NAME, project_id: row.PROJECT_ID });
            }
        }, function (err, size) {
            cb(err, results);
        });
    },
    getProjects: function (cb) {
        const results = [];
        this.db.each('SELECT ID, NAME, CATEGORY_ID FROM PROJECTS order by NAME', function (err, row) {
            if (!err) {
                results.push({ id: row.ID, name: row.NAME, category_id: row.CATEGORY_ID });
            }
        }, function (err, size) {
            cb(err, results);
        });
    },
    getNonWorkingDays: function (cb) {
        const results = [];
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
