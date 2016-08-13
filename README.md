# Timesheets

A small app to track user time by projects and activities.  
Hopefully to be used weekly.

## Run

Before anything, install dependencies with `npm install`.
If no database path (`${DB_PATH}`) is set, it will create one in the app root directory.

### Production

```bash
$ npm start
```

### Development

```bash
$ npm run dev
```

## Docker

Use the bundled `Dockerfile`, change `${DB_PATH}` and `${USER}` to suits your needs.

```bash
$ docker build -t ${USER}/timesheets
$ docker run -p 8080:8080 -v ${DB_PATH}:/data -d ${USER}/timesheets
```