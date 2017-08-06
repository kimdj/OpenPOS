# OpenPOS Project

Copyright (c) 2017 David Kim

This work is available under the "MIT License". Please see the file 'LICENSE' in this distribution for license terms.

## Week 4 Update

Basic framework for the POS and backend setup is complete.  Routed user authentication and login to the main page, which contains the POS browser interface.  I still need to complete the README.md and the database functionality which would allow each user to maintain their own POS system populated with their own saved settings.  I also need to re-setup gulp to automate installation procedures.  CSS also needs modifying to facilitate a better UI experience.

## Description
OpenPOS is an open source, cloud-based Point-Of-Sale System. OpenPOS uses the MEAN stack, a full-stack JavaScript framework:  

### MongoDB

MongoDB is an open source, cross-platform document-oriented NoSQL database program.  It uses JSON-like documents with dynamic schemas (BSON) to persist data.  MongoDB is built for scalability, high availability and performance from a single server deployment to large complex multi-site infrastructures.  

### Express.js

Express.js is an open source, JavaScript development framework that supplements the backend.  It essentially provides URL routing among other various functionalities.  In a nutshell, Express.js supplements the backend web framework.  

### AngularJS

AngularJS is an open source, JavaScript framework with the core goal of simplification.  It excels at building dynamic, single page applications (SPAs) while supporting the Model View Controller (MVC) programming paradigm.  In a nutshell, AngularJS takes care of the frontend framework.  

### Node.js

Node.js is an open source, JavaScript runtime environment for executing server-side JavaScript code.  The platform is built on Google Chrome's V8 JavaScript engine.  It is highly scalable and developer friendly nature.  In a nutshell, Node.js takes care of the backend platform / web framework.


Gulp is a command line task runner utilizing the Node.js platform.  It runs custom defined repetitious tasks and manages process automation.  

BrowserSync is an automation tool that synchronizes file changes and interactions across many devices.  This allows for faster development and better application testing procedures.  

## Prerequisites
### Node.js & NPM Installation

To install on Mac:
```
$ brew update
$ brew install node
$ node -v
$ npm -v
```

### Gulp.js Installation

To install on Mac:
```
$ sudo npm install --global gulp
```

## Quick Start

Clone the repo
```
$ git clone https://github.com/kimdj/OpenPOS.git
```

Change directory to the repo
```
$ cd OpenPOS
```

Install dependencies
```
$ npm install
```

Start the server
```
$ gulp
```


## License

[The MIT License](LICENSE.md)



