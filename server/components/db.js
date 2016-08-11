var fs = require('fs');
var file = process.cwd() + '/' + 'timesheets.db';
var exists = fs.existsSync(file);
var moment = require('moment');

if (!exists) {
    console.log('Creating DB file.');
    fs.openSync(file, 'w');
}

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(file);

// db.on('trace', function(q) {
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

        var users = [
            { id: 0, name: 'JFY' },
            { id: 1, name: 'PCN' },
            { id: 2, name: 'BDS' }
        ];

        var allocations = [
            { id: 0, name: '1', value: 1 },
            { id: 1, name: '3/4', value: 0.75 },
            { id: 2, name: '1/2', value: 0.5 },
            { id: 3, name: '1/4', value: 0.25 }
        ];

        var activities = [
            { id: 0, name: 'Activity 1' },
            { id: 1, name: 'Activity 2' },
            { id: 2, name: 'Activity 3' }
        ];

        var projects = [
            { id: 0, name: 'Project 1' },
            { id: 1, name: 'Project 2' },
            { id: 2, name: 'Project 3' }
        ];

        var tablesData = [{ table: 'ACTIVITIES', data: activities }, { table: 'PROJECTS', data: projects }, { table: 'USERS', data: users }]
        for (var i = 0; i < tablesData.length; i++) {
            var t = tablesData[i];
            this.db.run('CREATE TABLE ' + t.table + ' (ID INTEGER PRIMARY KEY, NAME TEXT NOT NULL)');
            this.addToTable(t.table, t.data);
        }

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
    },
    close: function () {
        this.db.close();
    },
    queryTable: function (table, cb) {
        this.db.serialize(function () {
            var results = [];
            this.db.each('SELECT ID, NAME FROM ' + table + ' order by NAME', function (err, row) {
                if (!err) {
                    results.push({ id: row.ID, name: row.NAME });
                }
            }, function (err, size) {
                cb(err, results);
            });
        }.bind(this));
    },
    getUsers: function (cb) {
        this.queryTable('USERS', cb);
    },
    getAllocations: function (cb) {
        this.db.serialize(function () {
            var results = [];
            this.db.each('SELECT ID, NAME, VALUE from TIME_ALLOCATION order by VALUE DESC', function (err, row) {
                if (!err) {
                    results.push({ id: row.ID, name: row.NAME, value: row.VALUE });
                }
            }, function (err, size) {
                cb(err, results);
            });
        }.bind(this));
    },
    getProjects: function (cb) {
        this.queryTable('PROJECTS', cb);
    },
    getActivities: function (cb) {
        this.queryTable('ACTIVITIES', cb);
    },
    getNonWorkingDays: function (cb) {
        this.db.serialize(function () {
            var results = [];
            this.db.each("SELECT DAY FROM NON_WORKING_DAYS order by DAY", function (err, row) {
                if (!err) {
                    results.push(row.DAY);
                }
            }, function (err, size) {
                cb(err, results);
            });
        }.bind(this));
    },
}

db.serialize(function () {
    if (!exists) {
        dbWrapper.createEmpty();
    } else {
        console.log('Using database file ', file);
    }
});

module.exports = dbWrapper;
