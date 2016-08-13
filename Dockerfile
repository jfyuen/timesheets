FROM node:latest

# Create app directory
RUN mkdir -p /usr/src/timesheets
WORKDIR /usr/src/timesheets

# Install app dependencies
COPY package.json /usr/src/timesheets/
RUN npm install

# Bundle app source
COPY . /usr/src/timesheets

ENV NODE_ENV=production PORT=8080 DB_PATH=/data
VOLUME [${DB_PATH}]

EXPOSE 8080
CMD [ "npm", "start" ]
