var Maildir = require('./');

var Colors = require('colors');
var Util = require('util');

var maildir = new Maildir('/home/jmanero/Maildir');

maildir.on('folder', function(path) {
	console.log("Folder: ".magenta + path);
});

maildir.on('email', function(email) {
	console.log("Email: ".magenta + Util.inspect(email, false, null, true));
});

maildir.scan();
