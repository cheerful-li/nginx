var jwt = require("jsonwebtoken");
var token;
token = jwt.sign("lilieming",'hello');
console.log(token,'',jwt.verify(token,'hello'))