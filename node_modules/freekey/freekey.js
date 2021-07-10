// Copyright 2018 Sleepless Software Inc.  All Rights Reserved

const sleepless = require('sleepless'),
	request = require('request'),
	https = require('http');
	https.post = require('https-post');


let RESTPATH = "https://sleepless.com/api/v1/freekey/";

function get(key, cb){
	request.post({url: RESTPATH, form: { action: "get", key: key, }}, function(err, res, body) {
		var val = "";
		var error = "";
		if(!err && body) {
			body = j2o(body);
			val = body.value;
			error = body.error;
		} else {
			val = err;
		}
		cb(j2o(val), error, res);
	});	
}


function put(key, val, cb){
	request.post({url: RESTPATH, form: { action: "put", key: key, value: o2j(val)} }, (err) => { cb(err) }); 
}


function del(key, cb){
	request.post({url: RESTPATH, form: { action: "delete", key: key} }, (err, res, body) => {
		if(body.value !== undefined) {
			body.value = j2o(body).value;
		}
		cb(key, body.value);
	}); 
}


// Wrapper that encrypts the stored values.
// "alg" is optional encryption algorithm passed to node.js crypto module.
// default alg is "aes-256-cbc".
function crypt(password, alg) {
	const crypto = require("crypto");
	const o = this;
	alg = alg || "aes-256-cbc";
	return {
		get: function(k, cb) {
			return o.get(k, (enc)=> {
				const d = crypto.createDecipher(alg, password);
				let json = d.update(enc, "base64", "utf8") + d.final("utf8");;
				cb(j2o(json));
			});
		},
		put: function(k, v, cb) {
			let json = o2j(v);
			const c = crypto.createCipher(alg, password);
			let enc = c.update(json, "utf8", "base64") + c.final("base64");;
			return o.put(k, enc, cb);
		},
		del: o.del,
		crypt: o.crypt,
		prefix: o.prefix
	};
}


// This returns the existing api, wrapped so that keys will always be prefixed with a string,
// so you can do:
//      fk = require("fk").prefix("sleepless_");
//      fk.set("foo", "bar", ...)
//      fk.get("foo", ...)
// instead of:
//      fk = require("fk");
//      fk.set("sleepless_foo", "bar", ...)
//      fk.get("sleepless_foo", ...)
function prefix(pre) {
	const o = this;
	return {
		get: function(k, cb) { return o.get(pre+k, cb); },
		put: function(k, v, cb) { return o.put(pre+k, v, cb); },
		del: function(k, cb) { return o.del(pre+k, cb); },
		crypt: o.crypt,
		prefix: o.prefix
	};
}


module.exports = {
	get: get,
	put: put,
	del: del,
	crypt: crypt,
	prefix: prefix
}

