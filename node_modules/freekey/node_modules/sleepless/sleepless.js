/*
Copyright 2019 Sleepless Software Inc. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE. 
*/

if((typeof process) === 'undefined') {
	isBrowser = true;
	isNode = false;
	global = window;
}
else  {
	isNode = true;
	isBrowser = false;
}
global.isNode = isNode;
global.isBrowser = isBrowser;

// for convenience
global.log = function(m) {
	if(isBrowser && window["console"] === undefined) {
		return;		// console doesn't exist in IE unless in debug mode
	}
	if(typeof m === "object") {
		m = o2j(m);
	}
	return console.log(m);
}

// throw an error if a condition is true
global.throwIf = function(c, s) { if(c) { throw new Error(s || "FAILED ASSERTION"); } }

// a default no-op function for callbacks
global.nop = function(){}

// return json as object or null if error
global.j2o = function(j) { try { return JSON.parse(j) } catch(e) { return null } }

// return object as JSON or null if error  
global.o2j = function(o) { try { return JSON.stringify(o) } catch(e) { return null } }

// convert an arguments object to real array
// XXX DEPRECATE - suspect Firefox doesn't like this
global.args = function(a) { return Array.prototype.slice.call(a); } 

// iterate through an object's attributes
global.eachVal = function(o, cb) { for(var k in o) { cb(o[k], k); } };	// XXX Use Object.keys() or deprecate

// convert whatever to float
global.toFlt = function(v) { return parseFloat((""+v).replace(/[^-.0-9]/g, "")) || 0.0; }

// convert whatever to integer
global.toInt = function(v) {
	var n = toFlt(v);
	return Math[n < 0 ? 'ceil' : 'floor'](n);
};

// convert from cents to bucks
global.centsToBucks = function(cents) {
	return toFlt( toInt(cents) / 100 );
}
global.c2b = global.centsToBucks;

// convert bucks to cents
global.bucksToCents = function(bucks) {
	// return Math.round( toFlt(bucks) * 100 ); --> can't use this; It breaks on #'s like 0.285 - )-:
	return Math.round( (toFlt(bucks) * 1000) / 10 );
}
global.b2c = global.bucksToCents;

// format a number into a string with any # of decimal places, & alternative decimal & thousand-separation chars
global.numFmt = function(n, plcs, dot, sep) {
	n = toFlt(n);
    sep = typeof sep === "string" ? sep : ",";			// thousands separator char
    dot = typeof dot === "string" ? dot : ".";			// decimal point char
	plcs = toInt(plcs);
	var p = Math.pow(10, plcs);
    var n = Math.round( n * p ) / p;
    var sign = n < 0 ? '-' : '';
    n = Math.abs(+n || 0);
    var intPart = parseInt(n.toFixed(plcs), 10) + '';
    var j = intPart.length > 3 ? intPart.length % 3 : 0;
    return sign +
		(j ? intPart.substr(0, j) + sep : '') +
		intPart.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + sep) +
		(plcs ? dot + Math.abs(n - intPart).toFixed(plcs).slice(-plcs) : '');
}

// convert something like 1.234 to a string that looks like "123.4%" with optional decimal places
global.toPct = function(n, plcs, dot, sep) {
	return numFmt(n * 100, plcs, dot, sep);
}

// convert whatever to a string that looks like "1,234.56"
global.toMoney = function(n, dot, sep) {
	return numFmt(n, 2, dot, sep);
}

// return a human readable string that describes 'n' as a number of bytes; "1 KB", "21.5 MB", etc.
global.byteSize = function(sz) {
	if(typeof sz != "number")
		return sz;
	if(sz < 1024)
		return numFmt(sz, 0) + " B"
	sz = sz / 1024
	if(sz < 1024)
		return numFmt(sz, 1) + " KB"
	sz = sz / 1024
	if(sz < 1024)
		return numFmt(sz, 1) + " MB"
	sz = sz / 1024
	if(sz < 1024)
		return numFmt(sz, 1) + " GB"
	sz = sz / 1024
	return numFmt(sz, 1) + " TB"
}

// return "now" as Unix timestamp
global.time = function() { return toInt(new Date().getTime() / 1000); }

// convert "YYYY-MM-YY" or "YYYY-MM-YY HH:MM:SS" to Unix timestamp
global.my2ts = function(m) {
	if( m.length == 10 && /\d\d\d\d-\d\d-\d\d/.test(m) ) {
		m += " 00:00:00";
	}
	if(m === "0000-00-00 00:00:00") {
		return 0;
	}
	var a = m.split( /[^\d]+/ );
	if(a.length != 6) {
		return 0;
	}
	var year = toInt(a[0]);
	var month = toInt(a[1]);
	var day = toInt(a[2]);
	var hour = toInt(a[3]);
	var minute = toInt(a[4]);
	var second = toInt(a[5]);
	var d = new Date(year, month - 1, day, hour, minute, second, 0);
	return toInt(d.getTime() / 1000);
}

// convert Unix timestamp to "YYYY-MM-DD HH:MM:SS"
global.ts2my = function(ts) {
	var d = ts2dt(ts);
	if(!d) {
		return "";
	}
	return ""+
		d.getFullYear()+
		"-"+
		("0"+(d.getMonth() + 1)).substr(-2)+
		"-"+
		("0"+d.getDate()).substr(-2)+
		" "+ 
		("0"+d.getHours()).substr(-2)+
		":"+
		("0"+d.getMinutes()).substr(-2)+
		":"+
		("0"+d.getSeconds()).substr(-2)+
		"";
}

// convert Unix timestamp to Date 
global.ts2dt = function(ts) {
	ts = toInt(ts);
	return ts ? new Date(ts * 1000) : null;
};

// convert Date to Unix timestamp
global.dt2ts = function(dt) {
	if(! (dt instanceof Date) )
		return 0;
	return toInt(dt.getTime() / 1000);
};

// Convert "MM/DD/YYYY HH:MM:SS" to Date object or null if "s" can't be parsed
// If year is 2 digits, it will try guess what you meant
// Time part (HH:MM:SS) can be omitted and seconds is optional
// if utc argument is truthy, then return a UTC version
global.us2dt = function(us, utc) {

	if(!us) {
		return null;
	}

	var m = (""+us).split( /[^\d]+/ );

	if(m.length < 3) {
		return null;
	}
	while(m.length < 7) {
		m.push("0");
	}

	// try to convert 2 digit year to 4 digits (best guess)
	var year = toInt(m[2]);
	var nowyear = new Date().getFullYear();
	if(year <= ((nowyear + 10) - 2000))
		year = 2000 + year;
	if(year < 100)
		year = 1900 + year;

	var mon = toInt(m[0]) - 1;
	var date = toInt(m[1]);

	var hour = toInt(m[3]);
	var min = toInt(m[4]);
	var sec = toInt(m[5]);
	var ms = toInt(m[6]);

	if(utc) {
		return new Date(Date.UTC(year, mon, date, hour, min, sec, ms));
	}

	return new Date(year, mon, date, hour, min, sec, ms);
};


// Convert "MM/DD/YYYY HH:MM:SS" to Unix timestamp.
// If utc argument is truthy, then return a UTC version.
global.us2ts = function(us, utc) {
	return dt2ts(us2dt(us, utc));
};

// Convert Unix timestamp to "MM/DD/YYYY HH:MM:SS".
global.ts2us = function(ts) {
	var d = ts2dt(ts);
	if(!d) {
		return "";
	}
	return ""+
		("0"+(d.getMonth() + 1)).substr(-2)+
		"/"+
		("0"+d.getDate()).substr(-2)+
		"/"+
		d.getFullYear()+
		" "+ 
		("0"+d.getHours()).substr(-2)+
		":"+
		("0"+d.getMinutes()).substr(-2)+
		":"+
		("0"+d.getSeconds()).substr(-2)+
		"";
}

// Convert Unix timestamp to "MM/DD".
global.ts2us_md = function(ts) {
	return ts2us(ts).substr(0, 5);
}

// Convert Unix timestamp to "MM/DD/YYYY".
global.ts2us_mdy = function(ts) {
	return ts2us(ts).substr(0, 10);
}

// Convert Unix timestamp to "MM/DD/YY"
global.ts2us_mdy2 = function(ts) {
	var a = ts2us_mdy(ts).split("/");
	if(a.length != 3) {
		return a;
	}
	a[2] = a[2].substr(2);
	return a.join("/");
}

// Convert Unix timestamp to "HH:MM"
global.ts2us_hm = function(ts) {
	return ts2us(ts).substr(11, 5);
}

// Convert Unix timestamp to "MM/DD/YYYY HH:MM"
global.ts2us_mdyhm = function(ts) {
	return ts2us_mdy(ts) + " " + ts2us_hm(ts);
}

// Convert Unix timestamp to "MM/DD/YY HH:MM"
global.ts2us_mdy2hm = function(ts) {
	return ts2us_mdy2(ts) + " " + ts2us_hm(ts);
}

// Convert Unix timestamp to something like "01-Jan-2016"
global.ts2us_dMy = function(ts) {
	var d = ts2dt(ts);
	if(!d) {
		return "";
	}
	var month_names = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");
	return ""+
		("0"+d.getDate()).substr(-2)+
		"-"+
		month_names[d.getMonth()]+
		"-"+
		d.getFullYear();
}



// Make all lowercase
String.prototype.lcase = function() { return this.toLowerCase() }

// Make all uppercase
String.prototype.ucase = function() { return this.toUpperCase() }

// Capitalize first word
String.prototype.ucfirst = function() {
	return this.substring(0,1).toUpperCase() + this.substring(1)
}

// Capitalize all words
String.prototype.ucwords = function( sep ) {
	sep = sep || /[\s]+/;
	var a = this.split( sep );
	for( var i = 0; i < a.length; i++ ) {
		a[ i ] = a[ i ].ucfirst();
	}
	return a.join( " " );
}

// Returns true if the string begins with the prefix string
if( String.prototype.startsWith === undefined ) {
	String.prototype.startsWith = function(prefix) {
		return this.substr(0, prefix.length) == prefix;
	}
}

// Returns true if the string ends with the suffix string
if( String.prototype.endsWith === undefined ) {
	String.prototype.endsWith = function(suffix) {
		return this.substr(-suffix.length) == suffix;
	}
}

// Abbreviate to l chars with ellipses
String.prototype.abbr = function(l) {
	l = toInt(l) || 5;
	if(this.length <= l) {
		return "" + this;	// Cuz ... some times this === a String object, not a literal
	}
	return this.substr(0, l - 4) + " ...";
}

// Convert a string from something like "prof_fees" to "Prof Fees"
String.prototype.toLabel = function() {
	var s = this.replace( /[_]+/g, " " );
	s = s.ucwords();
	return s;
}

// Convert a string from something like "Prof. Fees" to  "prof_fees"
String.prototype.toId = function() {
	var s = this.toLowerCase();
	s = s.replace( /[^a-z0-9]+/g, " " );
	s = s.trim();
	s = s.replace( /\s+/g, "_" );
	return s;
}

// Returns true if string contains all of the arguments
// "I,\nhave a lovely bunch of coconuts".looksLike("i have", "coconuts") == true
String.prototype.looksLike = function() {
    var a = Array.prototype.slice.call(arguments);        // convert arguments to true array
    var s = "_" + this.toLowerCase().toId() + "_"; //.split("_"); //toLowerCase();
    for(var i = 0; i < a.length; i++) {
        var t = "_" + (a[i].toLowerCase().toId()) + "_";
        if(s.indexOf(t) == -1)
            return false;
    }
    return true;
}

// Returns true if the string is a valid email address
String.prototype.is_email = function() {
    return /^[A-Za-z0-9_\+-]+(\.[A-Za-z0-9_\+-]+)*@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.([A-Za-z]{2,})$/.test(this);
}

// So I can use each() instead of forEach
Array.prototype.each = Array.prototype.forEach;


// Returns something like "3 minutes ago"
// Pass truthy value for no_suffix to suppress the " ago" at the end
global.agoStr = function(ts, no_suffix) {
	if(ts == 0)
		return "";

    var t = time() - ts;
	if(t < 1)
		return "Just now";

	var v = ""
	var round = Math.round
        
    if(t>31536000) v = round(t/31536000,0)+' year'; 
    else if(t>2419200) v = round(t/2419200,0)+' month'; 
    else if(t>604800) v = round(t/604800,0)+' week'; 
    else if(t>86400) v = round(t/86400,0)+' day'; 
    else if(t>3600) v = round(t/3600,0)+' hour'; 
    else if(t>60) v = round(t/60,0)+' minute'; 
    else v = t+' second'; 
        
    if(toInt(v) > 1)
		v += 's'; 

    return v + (no_suffix ? "" : " ago");
}

if(isNode) {
	// We are in Node.js

	// XXX Might be nice if this could fetch URL's too.
	global.getFile = function(path, enc, cb) {
		var fs = require("fs");
		if(!cb) {
			return fs.readFileSync(path, enc);
		}
		fs.readFile(path, enc, cb);
	}

	global.sha1 = function(s) {
		var h = require("crypto").createHash("sha1");
		h.update(s);
		return h.digest("hex");
	}

	global.sha256 = function(s) {
		var h = require("crypto").createHash("sha256");
		h.update(s);
		return h.digest("hex");
	}

	global.EE = function(Ctr) {
		var EventEmitter = require("events");
		require("util").inherits(Ctr, EventEmitter);
		var o = new Ctr();
		EventEmitter.call(o);
		return o;
	};


}
else  {
	// We are in a browser.

	global.LS = {
		get: function(k) {
			try {
				return localStorage.getItem(k);
			} catch(e) { }
			return null;
		},
		set: function(k, v) {
			try {
				return localStorage.setItem(k, v);
			} catch(e) { }
			return null;
		},
	};

	// navigate to new url
	global.jmp = function(url) { document.location = url; }

	// reload page
	global.reload = function() { document.location.reload(); }

	// make an async HTTP GET request for a URL
	global.getFile = function(url, cb) {
		var x = new XMLHttpRequest();
		x.onload = function() { cb(x.responseText, x); };
		x.open("GET", url);
		x.send();
	};

	// Shows a browser notification if permission granted.
	// Ask permission if user hasn't yet been asked and honor their choice thereafter.
	// title = Title string to show in notice (name of app typically)
	// text = String message to display.
	// icon = String path to graphic 
	// onclick = function to call if notification is clicked
	global.showNotification = function(title, text, icon, onclick) {
		if("Notification" in window) {
			let do_notice = function() {
				let n = new Notification(title, {body: text, icon:icon});
				if(onclick) {
					n.addEventListener("click", onclick);
				}
			};
			if(Notification.permission === "granted") {
				do_notice();
			}
			else {
				if(Notification.permission !== "denied") {
					Notification.requestPermission(function(permission) {
						if(Notification.permission === "granted") {
							do_notice();
						}
					});
				}
			}
		}
	};

	global.getQueryData = function() {
		var o = {}
		var s = document.location.search
		if(s) {
			var kv = s.substr(1).split("&")
			for(var i = 0; i < kv.length; i++) {
				var aa = kv[i].split("=")
				o[aa[0]] = decodeURIComponent(aa[1])
			}
		}
		return o
	};

	global.getEl = function(id) {
		return document.getElementById(id);
	};

	HTMLCollection.prototype.toArray = function() {
		let arr = [];
		for(let i = 0; i < this.length; i++) {
			arr.push( this[ i ]);
		}
		return arr;
	};

	NodeList.prototype.toArray = HTMLCollection.prototype.toArray;

	HTMLElement.prototype.addClass = function(c) {
		let cl = this.classList;
		if( ! cl.contains( c ) )
			cl.add( c );
		return this;
	};

	HTMLElement.prototype.remClass = function(c) {
		let cl = this.classList;
		if( cl.contains( c ) )
			cl.remove( c );
		return this;
	};

	global.QS = function( qs ) {
		return document.querySelectorAll( qs ).toArray();
	};

	HTMLElement.prototype.attr = function(a, v) {
		if(v !== undefined) {
			this.setAttribute(a, v);
			return this;
		}
		else {
			return this.getAttribute(a);
		}
	};

	HTMLElement.prototype.val = function(v) {
		if(v !== undefined) {
			this.value = v;
			return this;
		}
		else {
			return (this.value || "").trim();
		}
	};

	HTMLElement.prototype.html = function(h) {
		if(h !== undefined) {
			this.innerHTML = h;
			return this;
		}
		else {
			return this.innerHTML;
		}
	};

/* --------- deprecate these -------------- */
	// return element with id
	I = function(id) { return document.getElementById(id); }

	// return value of element with id (generally an input type element)
	// if input is a checkbox, return true/false (checked/unchecked)
	V = function(id) {
		var e = I(id);
		return (e.type === "checkbox") ? (e.checked ? 1 : 0) : e.value.trim();
	}

	// return value of element with id as Unix timestamp
	V.ts = function(id) { return us2ts(V(id)); }

	// return value of element with id as integer
	V.int = function(id) { return toInt(V(id)); }

	// return value of element with id as float
	V.flt = function(id) { return toFlt(V(id)); }
/* --------- deprecate these -------------- */

}

