# Timesheets

A small app to track user time by projects and activities.  
Hopefully to be used weekly.

Work is hierarchied by categories, projects and then tasks. If a project has only one task, it is autoselected and the task field is hidden. 
Therefore to restrict the work to a category and a project, a single tasks must be added in the database with the same name as the project.

A yearly calendar view allows the user to check he misses some time period.

## Run

Before anything, install dependencies with `npm install`.
If no database path (`${DB_PATH}`) is set, it will create one in the app root directory.

### Production

```bash
$ npm start
```

The app starts on port 8080 by default.

### Development

```bash
$ npm run dev
```
The app starts on port 8081 by default.


## Docker

Use the bundled `Dockerfile`, change `${DB_PATH}` and `${USER}` to suits your needs.

```bash
$ docker build -t ${USER}/timesheets .
$ docker run -p 8080:8080 -v ${DB_PATH}:/data -d ${USER}/timesheets
```