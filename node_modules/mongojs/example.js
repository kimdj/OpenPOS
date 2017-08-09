var mongojs = require('./');
var db = mongojs('test', ['users', 'a']);

db.a.distinct('person.name', function(err, nms) {
  console.log(nms);
});
