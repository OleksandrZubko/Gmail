const { authorize } = require('./auth');
const { listMessages } = require('./emailProcessor');

authorize().then(listMessages).catch(console.error);