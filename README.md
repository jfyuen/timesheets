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

## Administration

For any operation below, it is needed to modify the sqlite database.
To connect to the database: `sqlite3 ${DB_PATH}`. After a database update, it is best to restart the docker.  
For every command below, replace variables in `${...}` with what is to be added.

### Add a new user

To add a new user:

```sql
INSERT INTO USERS(NAME, ARRIVAL_DATE, COMMENTS, LASTNAME, FIRSTNAME) VALUES('${NAME}', '${DATE}', '${COMMENT}', '${LAST_NAME}', '${FIRST_NAME}');
```

### Hide a user from the list

A user is hidden from the list when his `leave_date` is after the current date:

```sql
UPDATE USERS SET LEAVE_DATE=${LEAVE_DATE}' WHERE NAME = '${NAME}';
```

### Add non working days

```sql
INSERT INTO NON_WORKING_DAYS(DAY) VALUES('${DATE_TO_HIDE}');
```

### Add a new entry

Entries are stored by `Categories` / `Projects` / `Activities`.

To add everything:

```sql
INSERT INTO CATEGORIES(ID, NAME) VALUES(${NEW_CATEGORY_ID}, '${CATEGORY_NAME}');
INSERT INTO PROJECTS(ID, NAME, CATEGORY_ID) VALUES(${NEW_PROJECT_ID}, '${PROJECT_NAME}', ${NEW_CATEGORY_ID});
INSERT INTO ACTIVITIES(ID, NAME, PROJECT_ID) VALUES(${NEW_ACTIVITY_ID}, '${ACTIVITY_NAME}', ${NEW_PROJECT_ID});
```
