# OpenPOS Project

Copyright (c) 2017 David Kim

This work is available under the "MIT License". Please see the file 'LICENSE' in this distribution for license terms.

## Week 4 Update

Basic framework for the POS and backend setup is complete.  Routed user authentication and login to the main page, which contains the POS browser interface.  I still need to complete the README.md and the database functionality which would allow each user to maintain their own POS system populated with their own saved settings.  I also need to re-setup gulp to automate installation procedures.  CSS also needs modifying to facilitate a better UI experience.

## Description
OpenPOS is an open source, cloud-based Point-Of-Sale System. OpenPOS uses the MEAN stack, a full-stack JavaScript framework:  

### [Node.js](https://nodejs.org/)

Node.js is an open source, JavaScript runtime environment for executing server-side JavaScript code.  The platform is built on Google Chrome's V8 JavaScript engine.  It is highly scalable and developer friendly nature.  In a nutshell, Node.js is the core backend platform / web framework.  

### [Express.js](http://expressjs.com/)

Express.js is an open source, JavaScript development framework that provides a robust set of web and mobile application features for Node.js.  It provides URL routing among other various functionalities.  In a nutshell, Express.js supplements the backend web framework.  

### [AngularJS](https://angularjs.org/)

AngularJS is an open source, JavaScript framework with the core goal of simplification.  It excels at building dynamic, single page applications (SPAs) while supporting the Model View Controller (MVC) programming paradigm.  In a nutshell, AngularJS takes care of the frontend framework.  

### [MongoDB](https://www.mongodb.com/)

MongoDB is an open source, cross-platform document-oriented NoSQL database program.  It uses JSON-like documents with dynamic schemas (BSON) to persist data.  MongoDB is built for scalability, high availability and performance from a single server deployment to large complex multi-site infrastructures.  

### [Mongoose](http://mongoosejs.com)

Mongoose provides a straight-forward, schema-based solution to model your application data. It includes built-in type casting, validation, query building, business logic hooks and more, out of the box.  

### [Passport](http://passportjs.org)

Passport is authentication middleware for Node.js. Extremely flexible and modular, Passport can be unobtrusively dropped in to any Express-based web application. A comprehensive set of strategies support authentication using a username and password, Facebook, Twitter, and more.  

### [Gulp.js](https://gulpjs.com/)

Gulp is a command line task runner utilizing the Node.js platform.  It runs custom defined repetitious tasks and manages process automation.  

### [Browsersync](https://www.browsersync.io/)

Browsersync is an automation tool that synchronizes file changes and interactions across many devices.  This allows for faster development and better application testing procedures.  

### [Handlebars.js](https://www.npmjs.com/package/handlebars)

Handlebars.js is an extension to the Mustache templating language created by Chris Wanstrath. Handlebars.js and Mustache are both logicless templating languages that keep the view and the code separated like we all know they should be.  

## Prerequisites
### Node.js & NPM Installation

[Debian and Ubuntu based Linux distributions](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions)

[macOS](https://nodejs.org/en/download/package-manager/#macos)

[Windows](https://nodejs.org/en/download/package-manager/#windows)


### MongoDB Installation

https://docs.mongodb.com/manual/installation/

### MongoDB Atlas Setup (Optional)

[Create a free sandbox](https://www.mongodb.com/cloud/atlas)

## Quick Start

Clone the repo
```
$ git clone https://github.com/kimdj/OpenPOS.git
```

Change directory to the repo
```
$ cd ./OpenPOS
```

Install dependencies
```
$ npm install
```

If you're using a local MongoDB instance, start the service:
```
$ mongod --dbpath /data/db
```

Or, if you're using MongoDB Atlas, connect to the database:
```
$ mongo "mongodb://openposcluster-shard-00-00-zb2uf.mongodb.net:27017, openposcluster-shard-00-01-zb2uf.mongodb.net:27017, openposcluster-shard-00-02-zb2uf.mongodb.net:27017/test?replicaSet=OpenPOSCluster-shard-0" --authenticationDatabase admin --ssl --username <USERNAME> --password
```

Start the server
```
$ gulp
```

Or, start the web app
```
$ node server.js
```

## Contribute

If you'd like to contribute to this project, please refer to https://github.com/kimdj/OpenPOS/issues/.

## Credits

[AngularJS POS Demo](http://embed.plnkr.co/I6XAHz/)  
[loginapp](https://github.com/bradtraversy/loginapp)

## Contact

E-mail: kim.david.j@gmail.com


## License

[The MIT License](LICENSE.md)
