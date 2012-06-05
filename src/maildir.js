var EventEmitter = require('events').EventEmitter;
var FS = require('fs');
var Path = require('path');
var Util = require('util');

var Search = require('fs-watcher').search;
var MailParser = require('mailparser').MailParser;

var Maildir = module.exports = function(path) {
	var self = this;
	EventEmitter.call(this);
	this.root = path || '~/Maildir';

	this.search = new Search({
		root : this.root
	});
	
	this.search.on('folder', function(path) {
		var canPath = Path.join(self.root, path);
		
		if(self.isMaildir(path))
			self.emit('folder', path, canPath);
	});

	this.search.on('file', function(path) {
		var canPath = Path.join(self.root, path);
		console.log("DEBUG ".red + "File: ".magenta + path);
		
		if(self.isEmail(path)) {
			console.log("DEBUG ".red + "  Email!".green);
			var rs = FS.createReadStream(canPath);
			var parser = new MailParser();
			
			parser.on('end', function(email) {
				self.emit(email);
			});
			
			rs.pipe(parser);
			
		}
	});

};

Util.inherits(Maildir, EventEmitter);

Maildir.prototype.scan = function() {
	this.search.start();

};

Maildir.prototype.isMaildir = function(path) {
	var baseName = Path.basename(path);
	var canPath = Path.join(this.root, path);
	
	var stat = FS.statSync(canPath);
	var children = [];

	if (baseName[0] === '.' && stat.isDirectory()) {
		children = FS.readdirSync(canPath);
		if (children.indexOf('new') >= 0 && children.indexOf('cur') >= 0
				&& children.indexOf('tmp') >= 0)
			return true;
	}

	return false;
};

Maildir.prototype.isEmail = function(path) {
	var baseName = Path.basename(path);

	if (!(/^courierimap/i.test(baseName))) {
		return true;
	}

	return false;
};
