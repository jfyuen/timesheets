FROM node:latest

# Create app directory
RUN mkdir -p /usr/src/timesheets
WORKDIR /usr/src/timesheets

# Install app dependencies
COPY . /usr/src/timesheets
RUN npm ci

ENV NODE_ENV=production PORT=8080 DB_PATH=/data
VOLUME [${DB_PATH}]

EXPOSE 8080
CMD [ "npm", "run", "main"]
