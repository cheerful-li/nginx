var u = require('underscore');
var mongo = require("mongodb");
var ObjectId = mongo.ObjectId;
var Server = mongo.Server;
var Db = mongo.Db;
var server = new Server('localhost', 27017, {
	auto_reconnect: true
});
var db = new Db('whereMyMoney', server);
//三个集合
/*var labelGroup;
var moneyDetail;
var account;*/
db.open(function(err, db) {
	/*labelGroup = db.collection("labelGroup");
	moneyDetail = db.collection("moneyDetail");
	account = db.collection("account");
	monthHistory = db.collection("monthHistory");*/
});

function $find(collection, filter, config, cb) {
	db.collection(collection, function(err, collection) {
		if (err) {
			return console.log(err.message);
		}
		if (u.isFunction(config)) {
			cb = config;
			config = {};
		}
		collection.find(filter, config).toArray(function(err, result) {
			if (!err && cb){
				cb(result);
			} else{
				console.log(err);
			} 
		});

	});

};

function $insert(collection, data, cb) {
	db.collection(collection, function(err, collection) {
		if (err) {
			return console.log(err.message);
		}
		collection.insert(data, function(err, result) {
			if (!err && cb){
				cb(result);
			} else{
				console.log(err);
			} 
		});

	});

};

function $update(collection, filter, data, cb) {
	db.collection(collection, function(err, collection) {
		if (err) {
			return console.log(err.message);
		}

		collection.update(filter, {
			$set: data
		}, function(err, result) {
			if(!err && cb){
				cb(result);
			} else {
				console.log(err);
			}
		});
	});

};

function $remove(collection, filter, cb) {
	db.collection(collection, function(err, collection) {
		if (err) {
			return console.log(err.message, err.stack);
		}
		collection.remove(filter, function(err, result) {
			if (!err && cb){
				cb(result);
			} else {
				console.log(err);
			}
		});

	});

};
//出口
module.exports = {
	db: db,
	// collections: {
	// 	labelGroup: labelGroup,
	// 	account: account,
	// 	moneyDetail: moneyDetail
	// },
	crud: {
		$find: $find,
		$insert: $insert,
		$update: $update,
		$remove: $remove
	},
	ObjectId: ObjectId,
	$find: $find,
	$insert: $insert,
	$update: $update,
	$remove: $remove
};