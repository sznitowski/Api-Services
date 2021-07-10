/*
Copyright 2020 Sleepless Software Inc. All rights reserved.

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
(function() {

	let M = {};

	let isBrowser = typeof global === "undefined";
	let isNode = ! isBrowser;

	// for convenience
	M.log = function(m) {
		if(isBrowser && window["console"] === undefined) {
			return;		// console doesn't exist in IE unless in debug mode
		}
		if(typeof m === "object") {
			m = M.o2j(m);
		}
		return console.log(m);
	}

	// throw an error if a condition is true
	M.throwIf = function(c, s) { if(c) { throw new Error(s || "FAILED ASSERTION"); } }

	// convert and return json as object or null if exception
	M.j2o = function(j) { try { return JSON.parse(j) } catch(e) { return null } }

	// convert and return object as JSON or null if exception
	M.o2j = function(o) { try { return JSON.stringify(o) } catch(e) { return null } }

	// convert an arguments object to real array
	// XXX DEPRECATE - or investigate ... suspect Firefox doesn't like this
	M.args = function(a) { return Array.prototype.slice.call(a); } 

	// convert whatever to float or 0 if not at all numberlike
	// E.g. "123.9" --> 123.9, null --> 0.0, undefined --> 0.0, NaN --> 0.0, 123.9 --> 123.9
	M.toFlt = function(v) {
		return parseFloat((""+v).replace(/[^-.0-9]/g, "")) || 0.0;
	}

	// convert whatever to integer or 0 if not at all numberlike
	// E.g. "123" --> 123, null --> 0, undefined --> 0, NaN --> 0, 123 --> 123, -123.9 --> -124
	M.toInt = function(v) {
		var n = M.toFlt(v);
		return Math[n < 0 ? 'ceil' : 'floor'](n);
	};

	// convert from pennies to dollars
	// E.g.  123456 --> 1234.56
	M.centsToBucks = function(cents) {
		return M.toFlt( M.toInt(cents) / 100 );
	}
	M.c2b = M.centsToBucks;

	// convert dollars to pennies
	// E.g.  1234.56 --> 123456
	M.bucksToCents = function(bucks) {
		return Math.round( (M.toFlt(bucks) * 1000) / 10 );
	}
	M.b2c = M.bucksToCents;

	// format a number into a string with any # of decimal places,
	// and optional alternative decimal & thousand-separation chars
	// numFmt( 1234.56 )	// "1,235"
	// numFmt( 1234.56, 1 )	// "1,234.6"
	// numFmt( 1234.56, 1, "," )	// "1,234,6"
	// numFmt( 1234.56, 1, "_" )	// "1,234_6"
	// numFmt( 1234.56, 1, ",", "." )	// "1.234,6"
	// numFmt( 1234.56, 1, ".", "" )	// "1234.6"
	M.numFmt = function(n, plcs, dot, sep) {
		n = M.toFlt(n);
		sep = typeof sep === "string" ? sep : ",";			// thousands separator char
		dot = typeof dot === "string" ? dot : ".";			// decimal point char
		plcs = M.toInt(plcs);
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

	// fraction to percent.
	// convert something like 0.12 to a string that looks like "12" with
	// optional alternate decimal and thousands-seperator chars
	// NOTE: there is no "%" added, you have to do that yourself if you want it.
	// toPct( 0.4 ) + "%"		// "40%"
	// toPct( 123.4,",", "." )	// "12,340"
	M.toPct = function(n, plcs, dot, sep) {
		return M.numFmt(n * 100, plcs, dot, sep);
	}

	// Convert whatever to a string that looks like "1,234.56"
	// Add the $ symbol yourself.
	// E.g. toMoney( 1234.56 )				// "1,234.56"
	// E.g. toMoney( 1234.56, 1, ".", "" )	// "1.234,56"
	M.toMoney = function(n, dot, sep) {
		return M.numFmt(n, 2, dot, sep);
	}

	// Returns a human readable string that describes 'n' as a number of bytes,
	// e.g., "1 KB", "21.5 MB", etc.
	M.byteSize = function(sz) {
		if(typeof sz != "number")
			return sz;
		if(sz < 1024)
			return M.numFmt(sz, 0) + " B"
		sz = sz / 1024
		if(sz < 1024)
			return M.numFmt(sz, 1) + " KB"
		sz = sz / 1024
		if(sz < 1024)
			return M.numFmt(sz, 1) + " MB"
		sz = sz / 1024
		if(sz < 1024)
			return M.numFmt(sz, 1) + " GB"
		sz = sz / 1024
		return M.numFmt(sz, 1) + " TB"
	}

	// Return a Unix timestamp for current time, or for a Date object if provided
	M.time = function( dt ) {
		if( ! dt ) dt = new Date();
		return M.toInt( dt.getTime() / 1000 );
	}

	// Convert "YYYY-MM-YY" or "YYYY-MM-YY HH:MM:SS" to Unix timestamp
	M.my2ts = function(m) {
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
		var year = M.toInt(a[0]);
		var month = M.toInt(a[1]);
		var day = M.toInt(a[2]);
		var hour = M.toInt(a[3]);
		var minute = M.toInt(a[4]);
		var second = M.toInt(a[5]);
		var d = new Date(year, month - 1, day, hour, minute, second, 0);
		return M.toInt(d.getTime() / 1000);
	}

	// Convert Unix timestamp to "YYYY-MM-DD HH:MM:SS"
	M.ts2my = function(ts) {
		var d = M.ts2dt(ts);
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

	// Convert Unix timestamp to Date object
	// Returns null (NOT a date object for "now" as you might expect) if ts is falsey.
	M.ts2dt = function(ts) {
		ts = M.toInt(ts);
		return ts ? new Date(ts * 1000) : null;
	};

	// Convert Date object to Unix timestamp
	M.dt2ts = function(dt) {
		if(! (dt instanceof Date) )
			return 0;
		return M.toInt(dt.getTime() / 1000);
	};

	// Convert "MM/DD/YYYY HH:MM:SS" to Date object or null if string can't be parsed
	// If year is 2 digits, it will try guess the century (not recommended).
	// Time part (HH:MM:SS) can be omitted and seconds is optional
	// if utc argument is truthy, then return a UTC version
	M.us2dt = function(us, utc) {

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
		var year = M.toInt(m[2]);
		var nowyear = new Date().getFullYear();
		if(year <= ((nowyear + 10) - 2000))
			year = 2000 + year;
		if(year < 100)
			year = 1900 + year;

		var mon = M.toInt(m[0]) - 1;
		var date = M.toInt(m[1]);

		var hour = M.toInt(m[3]);
		var min = M.toInt(m[4]);
		var sec = M.toInt(m[5]);
		var ms = M.toInt(m[6]);

		if(utc) {
			return new Date(Date.UTC(year, mon, date, hour, min, sec, ms));
		}

		return new Date(year, mon, date, hour, min, sec, ms);
	}

	// Convert "MM/DD/YYYY HH:MM:SS" to Unix timestamp.
	// If utc argument is truthy, then return a UTC version.
	M.us2ts = function(us, utc) {
		return M.dt2ts(M.us2dt(us, utc));
	}

	// Convert Unix timestamp to "MM/DD/YYYY HH:MM:SS".
	M.ts2us = function(ts) {
		var d = M.ts2dt(ts);
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
	M.ts2us_md = function(ts) {
		return M.ts2us(ts).substr(0, 5);
	}

	// Convert Unix timestamp to "MM/DD/YYYY".
	M.ts2us_mdy = function(ts) {
		return M.ts2us(ts).substr(0, 10);
	}

	// Convert Unix timestamp to "MM/DD/YY"
	M.ts2us_mdy2 = function(ts) {
		var a = M.ts2us_mdy(ts).split("/");
		if(a.length != 3) {
			return a;
		}
		a[2] = a[2].substr(2);
		return a.join("/");
	}

	// Convert Unix timestamp to "HH:MM"
	M.ts2us_hm = function(ts) {
		return M.ts2us(ts).substr(11, 5);
	}

	// Convert Unix timestamp to "MM/DD/YYYY HH:MM"
	M.ts2us_mdyhm = function(ts) {
		return M.ts2us_mdy(ts) + " " + M.ts2us_hm(ts);
	}

	// Convert Unix timestamp to "MM/DD/YY HH:MM"
	M.ts2us_mdy2hm = function(ts) {
		return M.ts2us_mdy2(ts) + " " + M.ts2us_hm(ts);
	}

	// Convert Unix timestamp to something like "01-Jan-2016"
	M.ts2us_dMy = function(ts) {
		var d = M.ts2dt(ts);
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


	// return an array containing only distinct values.
	// E.g.  [ 1,2,2 ].distinct()		// [1,2]
	Array.prototype.distinct = function( cb ) {
		let hash = {};
		for( let el of this ) {
			hash[ cb ? cb( el ) : (""+el) ] = true;
		}
		return Object.keys( hash );
	}


	// Make all lowercase
	// E.g.  "Foo".lcase()		// "foo"
	String.prototype.lcase = function() { return this.toLowerCase() }

	// Make all uppercase
	// E.g.  "Foo".ucase()		// "FOO"
	String.prototype.ucase = function() { return this.toUpperCase() }

	// Capitalize first word
	// E.g.  "foo bar".ucfirst()		// "Foo bar"
	String.prototype.ucfirst = function() {
		return this.substring(0,1).toUpperCase() + this.substring(1)
	}

	// Capitalize all words
	// E.g.  "foo bar".ucwords()		// "Foo Bar"
	String.prototype.ucwords = function( sep ) {
		sep = sep || /[\s]+/;
		var a = this.split( sep );
		for( var i = 0; i < a.length; i++ ) {
			a[ i ] = a[ i ].ucfirst();
		}
		return a.join( " " );
	}

	// Returns true if the string begins with the prefix string
	// E.g.	"Foobar".startsWith( "Foo" ) 		// true
	// E.g.	"foobar".startsWith( "Foo" ) 		// false
	// TODO: support regexp arg
	if( String.prototype.startsWith === undefined ) {
		String.prototype.startsWith = function(prefix) {
			return this.substr(0, prefix.length) == prefix;
		}
	}

	// Returns true if the string ends with the suffix string
	// E.g.	"Foobar".endsWith( "bar" ) 		// true
	// E.g.	"foobar".endsWith( "Bar" ) 		// false
	// TODO: support regexp arg
	if( String.prototype.endsWith === undefined ) {
		String.prototype.endsWith = function(suffix) {
			return this.substr(-suffix.length) == suffix;
		}
	}

	// Abbreviate to 'l' chars with ellipses
	// E.g. "Foo bar baz".abbr(6)  // "Fo ..."
	String.prototype.abbr = function(l) {
		l = M.toInt(l) || 5;
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

	// Returns true if string contains all of the arguments irrespective of case
	// "I,\nhave a lovely bunch of coconuts".looksLike("i have", "coconuts") == true
	String.prototype.looksLike = function() {
		var a = Array.prototype.slice.call(arguments);        // convert arguments to true array
		var s = "_" + this.toId() + "_"; //.split("_"); //toLowerCase();
		for(var i = 0; i < a.length; i++) {
			var t = "_" + (a[i].toId()) + "_";
			if(s.indexOf(t) == -1)
				return false;
		}
		return true;
	}

	// Returns true if the string looks like a valid email address
	String.prototype.is_email = function() {
		return /^[A-Za-z0-9_\+-]+(\.[A-Za-z0-9_\+-]+)*@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.([A-Za-z]{2,})$/.test(this);
	}

	// Returns a human readable relative time description for a Unix timestmap versus "now"
	// E.M. agoStr( time() - 60 ) 	// "60 seconds ago"
	// E.M. agoStr( time() - 63 ) 	// "1 minute ago"
	// Pass a truthy value for argument 'no_suffix' to suppress the " ago" at the end
	M.agoStr = function(ts, no_suffix) {
		if(ts == 0)
			return "";

		var t = M.time() - ts;
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
			
		if(M.toInt(v) > 1)
			v += 's'; 

		return v + (no_suffix ? "" : " ago");
	}

	
	/*
	Run some functions in parallel, e.g:

		runp()						// create a runner object

		.add(function(cb) {			// add a simple function that does something
			// do something.
			cb();	// call this when it's done
		})

		.add(function(cb, str) {	// pass in an argument and also return an error
			// str == "foo"
			cb("error "+str);
		}, "foo")

		.add(function(cb, str1, str2) {		// pass in multiple args
			// str1 == "bar", str2 = "baz"
			cb(null, "okay "+str1+" "+str2);
		}, "bar", "baz")

		.add( [ 7, 11 ], function( cb, num, str ) {		// call the func once for each item in an array
			// this function called twice once with num = 7 and once with num = 11
			// both times str = "qux"
			cb(null, "okay "+num+" "+str);
		}, "qux")

		// All the calls are set up but nothing happens until
		// I call run() on the runner object, at which point all the functions
		// will be fired off in parallel.  When they're all completed (okay or fail)
		// the the call back calls you with an array of errors and results.

		.run(function(errors, results) {
			// all the functions have completed
			// errors = [null, "error foo", null, null, null ];
			// results = [null, null, "okay bar baz", "okay 7 qux", "okay 11 qux" ];
		})
	*/
	M.runp = function() {
		var o = {};
		var q = [];

		// Adds a function to the runp object
		var add = function add() {
			let args = Array.prototype.slice.call(arguments);
			if( typeof args[ 0 ] === "function" ) {
				q.push( args );
				return o;
			}
			// assume it's an array and and 2nd arg is function
			let arr = args.shift();
			let fun = args.shift();
			arr.forEach( x => {
				q.push( [ fun, x ].concat( args ) );
			});
			return o;
		};

		// Starts all the functions at once
		var run = function(cb) {
			var errors = [];
			var results = [];
			var num_done = 0;
			if( q.length == 0 ) {
				if(cb) {
					cb(errors, results);
				}
				return;
			}
			q.forEach(function(args, i) {
				let fun = args.shift();
				// Call each function with a callback and an index # (0-based)
				// The callback expect err, and result arguments.
				args.unshift( function(e, r) {
					// One of the functions is finished
					errors[i] = e || null;
					results[i] = r || null;
					num_done += 1;
					// when all finished, call the cb that was passed into run() with 
					// a list of errors and results.
					if(num_done == q.length) {
						if(cb) {
							cb(errors, results);
						}
					}
				} );
				fun.apply( null, args );
			});
		};

		o.add = add;
		o.run = run;
		return o;
	}

	/*
	Run a queue of functions sequentially, e.g:
		runq()
		.add(function(cb, a) {
			cb(null, a + 1);
		})
		.add(function(cb, a) {
			cb(null, a + 1);
		})
		.run(function(err, r) {
			// all done
			if(err) {
				// ...
			}
			else {
				console.log(a);		// 3
			}
		}, 1)
	*/
	M.runq = function() {
		var o = {};
		var q = []
		var add = function(f) {
			q.push(f);
			return o;
		};
		var run = function(cb, arg) {
			if(q.length == 0) {
				cb(null, arg);
				return;
			}
			var f = q.shift();
			f(function(e, arg) {
				if(e) {
					q = [];
					cb(e, arg);
				}
				else {
					run(cb, arg);
				}
			}, arg);
		};
		o.add = add
		o.run = run
		return o
	}


	// Sort of like Markdown, but not really.
	M.markup = function( t ) {

		// nuke CRs
		t = t.replace(/\r/gi, "\n")

		// remove leading/trailing whitespace on all lines
		t = t.split( /\n/ ).map( l => l.trim() ).join( "\n" );

		// append/prepend a couple newlines so that regexps below will match at beginning and end
		t = "\n\n" + t + "\n\n";		// note: will cause a <p> to always appear at start of output

		// one or more blank lines mark a paragraph
		t = t.replace(/\n\n+/gi, "\n\n<p>\n");
		
		// headings h1 and h2
		// Heading 1
		// =========
		// Heading 2
		// ---------
		// Heading 3
		// - - - - -
		// Heading 4
		// -  -  -  -  -
		// Heading 5
		// -   -   -   -   -
		t = t.replace(/\n([^\s\n][^\n]+)\n(-\s\s\s){4,}-\n/gi, "\n<h5>$1</h5>\n" );
		t = t.replace(/\n([^\s\n][^\n]+)\n(-\s\s){4,}-\n/gi, "\n<h4>$1</h4>\n" );
		t = t.replace(/\n([^\s\n][^\n]+)\n(-\s){4,}-\n/gi, "\n<h3>$1</h3>\n" );
		t = t.replace(/\n([^\s\n][^\n]+)\n-{5,}\n/gi, "\n<h2>$1</h2>\n" );
		t = t.replace(/\n([^\s\n][^\n]+)\n={5,}\n/gi, "\n<h1>$1</h1>\n" );

		// hyper link/anchor
		// (link url)
		// (link url alt_display_text)
		t = t.replace(/\(\s*link\s+([^\s\)]+)\s*\)/gi, "(link $1 $1)");
		t = t.replace(/\(\s*link\s+([^\s\)]+)\s*([^\)]+)\)/gi, "<a href=\"$1\">$2</a>");

		// hyper link/anchor that opens in new window/tab
		// (xlink url)
		// (xlink url alt_display_text)
		t = t.replace(/\(\s*xlink\s+([^\s\)]+)\s*\)/gi, "(xlink $1 $1)");
		t = t.replace(/\(\s*xlink\s+([^\s\)]+)\s*([^\)]+)\)/gi, "<a target=_blank href=\"$1\">$2</a>");

		// image
		// (image src title)
		t = t.replace(/\(\s*image\s+([^\s\)]+)\s*\)/gi, "(image $1 $1)");
		t = t.replace(/\(\s*image\s+([^\s\)]+)\s*([^\)]+)\)/gi, "<img src=\"$1\" title=\"$2\">");

		// figure
		// (figure src caption)
		t = t.replace(/\(\s*figure\s+([^\s\)]+)\s*\)/gi, "(figure $1 $1)");
		t = t.replace(/\(\s*figure\s+([^\s\)]+)\s*([^\)]+)\)/gi, "<figure><img src=\"$1\" title=\"$2\"><figcaption>$2</figcaption></figure>");

		// styles
		// __underline__
		// **bold**
		// //italic//
		t = t.replace(/\/\/(.*)\/\//gi, "<i>$1</i>");
		t = t.replace(/\*\*(.*)\*\*/gi, "<b>$1</b>");
		t = t.replace(/__(.*)__/gi, "<u>$1</u>");

		// "
		// block quote text
		// "
		t = t.replace(/\n\s*"\s*\n([^"]+)"\s*\n/gi, "\n<blockquote>$1</blockquote>\n");	// blockquote

		// {
		// code
		// }
		// foo { code } bar
		t = t.replace(/\n\s*{\s*\n([^"]+)}\s*\n/gi, "\n<blockquote><code>$1</code></blockquote>\n");
		t = t.replace(/{([^}]+)}/gi, "<code>$1</code>");	// code

		// symbols
		// (tm)	
		// (r)
		// (c)
		// (cy)				"(C) 2021"
		// (cm Foocorp)		"(C) 2021 Foocorp All Rights Reserved"
		t = t.replace(/\(tm\)/gi, "&trade;");	
		t = t.replace(/\(r\)/gi, "&reg;");	
		t = t.replace(/\(c\)/gi, "&copy;");
		t = t.replace(/\(cy\)/gi, "&copy;&nbsp;"+(new Date().getFullYear()));
		t = t.replace(/\(cm\s([^)]+)\)/gi, "&copy;&nbsp;"+(new Date().getFullYear())+"&nbsp;$1&nbsp;&ndash;&nbsp;All&nbsp;Rights&nbsp;Reserved" )

		// Unordered list
		// - item 
		// - item
		t = t.replace(/\n((\s*-\s+[^\n]+\n)+)/gi, "\n<ul>\n$1\n</ul>");
		t = t.replace(/\n\s*-\s+/gi, "\n<li>");

		// Ordered list 
		// 1. item 1
		// # item 2
		// 1. item 3
		t = t.replace(/\n((\s*(\d+|#)\.?\s+[^\n]+\n)+)/gi, "\n<ol>\n$1\n</ol>");
		t = t.replace(/\n(\d+|#)\.?\s+([^\n]+)/gi, "\n<li>$2</li>");

		// Horiz. rule
		// ---- (4 or more dashes)
		t = t.replace(/\n\s*-{4,}\s*\n/gi, "\n<hr>\n");		// horizontal rule

		// Dashes
		// --  (n-dash)
		// ---  (m-dash)
		t = t.replace(/-{3}/gi, "&mdash;");		// mdash
		t = t.replace(/-{2}/gi, "&ndash;");		// ndash

		if( typeof navigator !== "undefined" ) {
			// Only supported if running in browser

			// (lastModified)		// last modified data of document.
			t = t.replace(/\(\s*lastModified\s*\)/gi, document.lastModified);
		}

		return t;
	};
	M.t2h = M.markup;		// alternate name for markup


	// The inimitable Log5 ...
	(function() {
		var util = null;
		var style = null;
		if( isNode ) {
			util = require( "util" );
			style = require( "./ansi-styles.js" );
		}
		const n0 = function(n) {
			if(n >= 0 && n < 10)
				return "0"+n
			return n
		}
		const ts = function() {
			var d = new Date()
			return d.getFullYear() + "-" +
				n0(d.getMonth()+1) + "-" +
				n0(d.getDate()) + "_" +
				n0(d.getHours()) + ":" +
				n0(d.getMinutes()) + ":" +
				n0(d.getSeconds())

		}
		const mkLog = function(prefix) {
			prefix = " " + (prefix || "")
			var o = {}
			o.logLevel = 0
			var f = function logFunc( l ) {
				var n = 0, ll = l
				if( typeof l === "number" ) {	// if first arg is a number ...
					if(arguments.length == 1) {	// and it's the only arg ...
						o.logLevel = l			// set logLevel to l
						return logFunc			// and return
					}
					// there are more args after the number
					n = 1	// remove the number from arguments array
				}
				else {
					ll = 0	// first arg is not number, log level for this call is 0
				}
				if( o.logLevel < ll )	// if log level is below the one given in this call ...
					return logFunc;		// just do nothing and return 
				let s = ts() + prefix;
				for( var i = n; i < arguments.length; i++ ) {	// step through args
					let x = arguments[ i ];
					if( x === undefined ) {
						x = "undefined";
					}
					if( typeof x === "object" ) {	// if arg is an object ...
						if( isNode ) {				// and we're in node ...
							x = util.inspect( x, { depth: 10 } );	// convert obj to formatted JSON
						} else {					// otherwise ...
							x = o2j( x );			// just convert obj to JSON
						}
					}
					s += x;					// append to the growing string
				}
				if( isNode ) {
					if( process.stdout.isTTY ) {
						switch( ll ) {
						case 1:
							s = `${style.red.open}${s}${style.red.close}`;
							break;
						case 2:
							s = `${style.yellow.open}${s}${style.yellow.close}`;
							break;
						case 3:
							break;
						case 4:
							s = `${style.cyan.open}${s}${style.cyan.close}`;
							break;
						case 5:
							s = `${style.magenta.open}${s}${style.magenta.close}`;
							break;
						}
					}
					process.stdout.write( s + "\n" );	// write string to stdout
				} else {
					switch( ll ) {
					case 1: console.error( s ); break;
					case 2: console.warn( s ); break;
					default: console.log( s ); break;
					}
				}
				return logFunc
			}
			f.E = function( s ) { f( 1, "******* " + s ); }    // error
			f.W = function( s ) { f( 2, "- - - - " + s ); }    // warning
			f.I = function( s ) { f( 3, s ); }                 // info
			f.V = function( s ) { f( 4, s ); }                 // verbose
			f.D = function( s ) { f( 5, s ); }                 // debug
			return f;
		}

		const defLog = mkLog("")(3);
		defLog.mkLog = mkLog;

		M.log5 = defLog;

	})();


	if(isNode) {

		// Node.js only stuff

		// Read a file from disk
		// Reads async if callback cb is provided,
		// otherwise reads and returns contents synchronously.
		M.getFile = function(path, enc, cb) {
			var fs = require("fs");
			if(!cb) {
				return fs.readFileSync(path, enc);
			}
			fs.readFile(path, enc, cb);
		}

		// Return ASCII sha1 for a string
		M.sha1 = function(s) {
			var h = require("crypto").createHash("sha1");
			h.update(s);
			return h.digest("hex");
		}

		// Return ASCII sha256 for a string
		M.sha256 = function(s) {
			var h = require("crypto").createHash("sha256");
			h.update(s);
			return h.digest("hex");
		}

		// Convert Ctr object into an event emitter (?)
		M.EE = function( Ctr ) {
			var EventEmitter = require("events");
			require("util").inherits( Ctr, EventEmitter );
			var o = new Ctr();
			EventEmitter.call( o );
			return o;
		};


		// DS (datastore)
		// XXX Make a version of this for browser that uses localStorage or something?
		(function() {
			const fs = require( "fs" );
			const load = function( f ) {
				const self = this;
				f = f || self.file;
				self.__proto__.file = f;
				try {
					const ds = JSON.parse( fs.readFileSync( f ) );
					for( let key in ds ) 
						self[ key ] = ds[ key ];
				} catch( e ) {
					self.clear();
				} 
			}
			// this may throw exception, but it's up to caller to deal with it.
			const save = function( f ) {
				const self = this;
				f = f || self.file;
				self.__proto__.file = f;
				fs.writeFileSync( f, JSON.stringify( self ) );
			}
			const clear = function() {
				const self = this;
				for( let key in self ) 
					delete self[ key ];
			}
			const ldsv = { load:load, save:save, clear:clear }
			const F = function( file, opts ) {
				var self = this;
				self.file = file;
				self.opts = opts || {};
			}
			F.prototype = ldsv;
			const D = function( f, opts ) {
				const self = this;
				self.__proto__ = new F( "ds.json", opts );
				self.load( f );
			}
			D.prototype = new F();
			M.DS = D
		})();


		// Other modules
		//M.db = require( "db" );	// need to remove dependency on old sleepless



		// XXX Deprecate in favor of M.rpc() 
		M.get_json = function( url, data, cb_okay, cb_fail, num_redirects ) {
			let okay = cb_okay || function(){};
			let fail = cb_fail || function(){};
			let arr = [];
			for( let k in data ) {
				arr.push( encodeURIComponent( k ) + "=" + encodeURIComponent( data[ k ] ) );
			}
			if( arr.length > 0 ) {
				url += "?" + arr.join( "&" );
			}
			num_redirects = M.toInt( num_redirects );
			if( num_redirects > 5 ) {
				fail( "Too many redirects" ); // we appear to be looping
				return;
			}
			let opts = {
				method: "GET",
				headers: {
					"Content-Type": "application/json",	// will always send this, and ...
					"Accept": "application/json",		// will accept this in response
				}
			};
			let json = "";	// collected response
			let req = require( "https" ).request( url, opts, res => {
				res.setEncoding( "utf8" );
				res.on( "data", chunk => { json += chunk; } );
				res.on( "end", () => {
					let { statusCode, headers } = res;
					if( statusCode >= 200  && statusCode < 300 ) {	// if it's an "okay" ...
						okay( M.j2o( json ), res );		// done!
					} else {
						if( statusCode >= 300 && statusCode < 400 ) {	// if it's a redirect ...
							let url = headers[ "location" ] || headers[ "Location" ];
							get_json( url, okay, fail, num_redirects + 1 );	// recursively try the new location
						} else {	// otherwise ...
							fail( "HTTP Error "+statusCode, json, req );	// just give up.
						}
					}
				});
			});
			req.on( "error", fail );
			req.write("");
			req.end();
		};


		// XXX Deprecate in favor of M.rpc()
		// post_json( { url: "...", data: { ... }, ... }, okay, fail )
		// url is required 
		M.post_json = function( options, cb_okay, cb_fail ) {
			let opts = M.j2o( M.o2j( options ) );	// clone it so I'm modifying my own copy
			let okay = cb_okay || function(){};
			let fail = cb_fail || function(){};
			opts.method = "POST";
			opts.headers = {
				"Content-Type": "application/json",	// will always send this, and ...
				"Accept": "application/json",		// will accept this in response
			}
			let json = "";	// collected response
			let req = require( "https" ).request( opts.url, opts, res => {
				res.setEncoding( "utf8" );
				res.on( "data", chunk => { json += chunk; } );
				res.on( "end", () => {
					let { statusCode, headers } = res;
					if( statusCode >= 200  && statusCode < 300 ) {	// if it's an "okay" ...
						okay( M.j2o( json ), res );
					} else {
						if( statusCode >= 300  && statusCode < 400 ) {	// if it's a redirect ...
							opts.redirects = toInt( opts.redirects ) + 1;
							if( opts.redirects > 10 ) {	// if we appear to be looping endlessly ...
								fail( "TOO MANY REDIRECTS", res );
							} else {	// otherwise ...
								opts.url = headers[ "location" ] || headers[ "Location" ];
								M.post_json( opts, okay, fail );	// try the new location
							}
						} else {	// otherwise ...
							fail( "HTTP ERROR "+statusCode, json, req );	// just give up.
						}
					}
				});
			});
			req.on( "error", fail );
			req.write( M.o2j( opts.data || {} ) );
			req.end();
		};

		// XXX make a version of this for browser with identical signature
		M.rpc = function( url, data, okay = ()=>{}, fail = ()=>{}, _get = false, _redirects = 0 ) {
			if( _get ) {	// if using GET ...
				// add the data to the URL as query args
				let arr = [];
				for( let k in data ) {
					arr.push( encodeURIComponent( k ) + "=" + encodeURIComponent( data[ k ] ) );
				}
				if( arr.length > 0 ) {
					url += "?" + arr.join( "&" );
				}
			}
			// check for looping
			_redirects = M.toInt( _redirects );
			if( _redirects > 10 ) {
				fail( "Too many redirects" ); // methinks we loopeth
				return;
			}
			const method = _get ? "GET" : "POST";
			let opts = {
				method: method,
				headers: {
					"Content-Type": "application/json",	// will always send this, and ...
					"Accept": "application/json",		// will accept this in response
				}
			};
			let json = "";	// collected response
			let req = require( "https" ).request( url, opts, res => {
				res.setEncoding( "utf8" );
				res.on( "data", chunk => { json += chunk; } );
				res.on( "end", () => {
					let { statusCode, headers } = res;
					if( statusCode >= 200  && statusCode < 300 ) {	// if it's an "okay" ...
						okay( M.j2o( json ), res );		// done!
					} else {
						if( statusCode >= 300 && statusCode < 400 ) {	// if it's a redirect ...
							let url = headers[ "location" ] || headers[ "Location" ];	// get new url
							M.rpc( url, okay, fail, _get, _redirects + 1 );	// recursively try the new location
						} else {	// otherwise ...
							fail( "HTTP Error "+statusCode, json, req );	// just give up.
						}
					}
				});
			});
			req.on( "error", fail );
			req.write( _get ? "" : o2j( data ) );
			req.end();
		}


		// This is a connect/express middleware that creates okay()/fail() functions on the response
		// object for responding to an HTTP request with a JSON payload.
		M.mw_fin_json = function( req, res, next ) {
			res.done = ( error, data ) => {
				let json = JSON.stringify( { error, data } );
				res.writeHead( 200, { "Content-Type": "application/json", });
				res.write( json );
				res.end();
			};
			res.fail = ( error, body ) => { res.done( error, body ); };
			res.okay = ( data ) => { res.done( null, data ); };
			next();
		};

	} else {

		// Browser only stuff

		M.LS = {
			// XXX Add ttl feature
			get: function( k ) {
				try {
					return j2o( localStorage.getItem( k ) );
				} catch( e ) { }
				return null;
			},
			set: function( k, v ) {
				try {
					return localStorage.setItem( k, o2j( v ) );
				} catch( e ) { }
				return null;
			},
			clear: function() {
				return localStorage.clear();
			}
		};

		// Navigate to new url
		M.jmp = function(url) { document.location = url; }

		// Reload current page
		M.reload = function() { document.location.reload(); }

		// Make an async HTTP GET request for a URL
		M.getFile = function(url, cb) {
			var x = new XMLHttpRequest();
			x.onload = function() { cb(x.responseText, x); };
			x.open("GET", url);
			x.send();
		};

		// XXX Deprecate in favor of browser version of rpc();
		M.postJSON = function( url, data, okay, fail ) {
			let xhr = new XMLHttpRequest();
			xhr.onload = function() {
				let r = M.j2o( xhr.responseText );
				if( ! r ) {
					fail( "Error processing response from server." );
					return;
				}
				if( r.error ) {
					fail( r.error );
					return;
				}
				okay( r.data, xhr );
			};
			xhr.onerror = fail;
			xhr.open( "POST", url );
			xhr.setRequestHeader( "Content-Type", "application/json" );
			xhr.setRequestHeader( "Accept", "application/json" );
			xhr.send( M.o2j( data ) );
		}


		// Shows a browser notification if permission granted.
		// Ask permission if user hasn't yet been asked and honor their choice thereafter.
		// title = Title string to show in notice (name of app typically)
		// text = String message to display.
		// icon = String path to graphic 
		// onclick = function to call if notification is clicked
		M.showNotification = function(title, text, icon, onclick) {
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
			} else {
				// alert()?
			}
		};

		// Returns an object constructed from the current page's query args.
		M.getQueryData = function() {
			var o = {};
			var s = document.location.search;
			if(s) {
				var kv = s.substr(1).split("&")
				for(var i = 0; i < kv.length; i++) {
					var aa = kv[i].split("=");
					o[aa[0]] = decodeURIComponent(aa[1]);
				}
			}
			return o
		};

		// Deprecate in favor of QS1("#id");
		// Get an element by its id
		// XXX Never liked this name of this thing.
		M.getEl = function(id) {
			return document.getElementById(id);
		};

		// Convert HTMLCollection to normal array
		HTMLCollection.prototype.toArray = function() {
			let arr = [];
			for(let i = 0; i < this.length; i++) {
				arr.push( this[ i ]);
			}
			return arr;
		};

		// Convert NodeList to normal array
		NodeList.prototype.toArray = HTMLCollection.prototype.toArray;

		// Add a class to an element
		HTMLElement.prototype.addClass = function(c) {
			let cl = this.classList;
			if( ! cl.contains( c ) )
				cl.add( c );
			return this;
		};

		// Remove a class from an element
		HTMLElement.prototype.remClass = function(c) {
			let cl = this.classList;
			if( cl.contains( c ) )
				cl.remove( c );
			return this;
		};

		// Return all elements matching query selector as an array
		M.QS = function( qs ) {
			return document.querySelectorAll( qs ).toArray();
		};

		// Return first element matching query selector
		M.QS1 = function( qs ) {
			return M.QS( qs )[ 0 ];
		};

		// Find all child elements matching query selector
		HTMLElement.prototype.find = function( qs ) {
			return this.querySelectorAll( qs ).toArray();
		}

		// Find first child element matching query selector
		HTMLElement.prototype.find1 = function( qs ) {
			return this.find( qs )[ 0 ];
		}

		// Get (or set if v is provided) an attribute's value
		HTMLElement.prototype.attr = function(a, v) {
			if(v !== undefined) {
				this.setAttribute(a, v);
				return this;
			}
			else {
				return this.getAttribute(a);
			}
		};

		// Get (or set if v is provided) an element's value
		HTMLElement.prototype.val = function(v) {
			if(v !== undefined) {
				this.value = v;
				return this;
			}
			else {
				return (this.value || "").trim();
			}
		};

		// Get (or set if h is provided) an element's innerHTML
		HTMLElement.prototype.html = function(h) {
			if(h !== undefined) {
				this.innerHTML = h;
				return this;
			}
			else {
				return this.innerHTML;
			}
		};

		// handy thing to grab the data out of a form
		HTMLFormElement.prototype.getData = function() {
			const types = "input select textarea".toUpperCase().split( " " );
			let data = {};
			for( let i = 0 ; i < this.elements.length ; i++ ) {
				const e = this.elements[ i ];
				if( types.includes( e.tagName ) ) {
					data[ e.name ] = e.value;
				}
			}
			return data;
		};


		// ---------------------------------------
		// The world renowned rplc8()!
		// ---------------------------------------
		(function() {

			// Replaces instances of "__key__" in string s,
			// with the values from corresponding key in data.
			let substitute = function( s, data ) {
				for( let key in data ) {
					let re = new RegExp( "__" + key + "__", "g" );
					s = s.replace( re, ""+(data[ key ]) );
				}
				return s;
			}

			// Injects data values into a single DOM element
			let inject = function( e, data ) {

				// Inject into the body of the element
				e.innerHTML = substitute( e.innerHTML, data );

				// Inject into the attributes of the actual tag of the element.
				// Do this slightly differently for IE because IE is stupid.
				// XXX Do I still have to do this? Isn't IE dead yet?
				let attrs = e.attributes;
				if( navigator.appName == "Microsoft Internet Explorer" ) {
					for( let k in attrs ) {
						let val = e.getAttribute( k );
						if( val ) {
							if( typeof val === "string" ) {
								if( val.match( /__/ ) ) {
									val = substitute( val, data );
									e.setAttribute( k, val );
								}
							}
						}
					}
				}
				else {
					for( let i = 0 ; i < attrs.length ; i++ ) {
						let attr = attrs[ i ];
						let val = attr.value;
						if( val ) {
							if( typeof val === "string" ) {
								if( val.match( /__/ ) ) {
									attr.value = substitute( val, data );
								}
							}
						}
					}
				}
			}

			// The main function
			M.rplc8 = function( elem, data, cb ) {

				// If elem isn't a DOM element, then it has to be query selector string
				if( ! ( elem instanceof HTMLElement ) ) {
					if( typeof elem !== "string" ) {
						throw new Error( "rplc8: invalid selector string" );
					}
					let coll = document.querySelectorAll( elem );
					if( coll.length !== 1 ) {
						throw new Error( "rplc8: selector doesn't match exactly 1 element" );
					}
					elem = coll[ 0 ];
				}

				let sib = elem.nextSibling;		// Might be null.
				let mom = elem.parentNode;		// Almost certainly not null.
				let clones = [];

				mom.removeChild( elem );		// Take template out of the DOM.

				let validate_data = function( data ) {
					// Ensure that data is an array or object
					if( ! ( data instanceof Array ) ) {
						// If it's a single object, put it into an array.
						if( typeof data === "object" ) {
							data = [ data ];
						}
						else {
							data = [];
							//throw new Error( "rplc8: Replication is neither array nor object." );
						}
					}

					// Ensure that the first element in the array is an object.
					if( data.length > 0 && typeof data[ 0 ] !== "object" ) {
						throw new Error( "rplc8: Replication data array does not contain objects." );
					}

					return data;
				}

				let obj = { };

				let splice = function( index, remove_count, new_data, cb ) {

					if( index < 0 ) {
						index = clones.length + index;
					}
					if( index > clones.length) {
						index = clones.length;
					}

					let sib = clones[ index ] || null;

					if( index < clones.length ) {
						// remove the old clones
						let n = 0;
						while( n < remove_count && index < clones.length ) {
							let clone = clones.splice( index, 1 )[ 0 ];
							sib = clone.nextSibling;
							mom.removeChild( clone );
							n += 1;
						}
					}

					// insert new clones if data provided
					if( new_data ) {
						data = validate_data( new_data );
						let n = 0
						while( n < data.length ) {
							let d = data[ n ];						// Get data object from array.
							let clone = elem.cloneNode( true );		// Clone template element and
							inject( clone, d );						// inject the data.
							mom.insertBefore( clone, sib );			// Insert it into the DOM
							let i = index + n;
							clones.splice( i, 0, clone );	// insert clone into array
							if( cb ) {								// If call back function provided,
								// then call it with a refreshing function
								cb( clone, d, i, function( new_data, cb ) {
									splice( i, 1, new_data, cb );
								});	
							}
							n += 1;
						}
					}

					return obj;
				}

				let append = function( data, cb ) {
					return splice( clones.length, 0, data, cb );
				}

				let prepend = function( data, cb ) {
					return splice( 0, 0, data, cb );
				}

				let update = function( data, cb ) {
					return splice( 0, clones.length, data, cb );
				}

				let clear = function( index, count ) {
					return splice( index || 0, count || clones.length );
				}

				update( data, cb );

				obj.splice = splice;
				obj.append = append;
				obj.prepend = prepend;
				obj.update = update;
				obj.clear = clear;

				return obj;
			};

		})();


		// Lets you navigate through pseudo-pages within an actual page
		// without any actual document fetching from the server.
		M.Nav = function(data, new_show) {

			if(typeof data === "function") {
				new_show = data;
				data = null;
			}

			if(!data) {
				// no data object passed in use current query data 
				var data = {}		// XXX hoisting??
				var a = document.location.search.split(/[?&]/)
				a.shift()
				a.forEach(function(kv) {
					var p = kv.split("=")
					data[p[0]] = (p.length > 1) ? decodeURIComponent(p[1]) : ""
				})
			}

			var state = { pageYOffset: 0, data: data }

			// build URL + query-string from current path and contents of 'data'
			var qs = ""
			for(var k in data) {
				qs += (qs ? "&" : "?") + k + "=" + encodeURIComponent(data[k])
			}
			var url = document.location.pathname + qs

			// if browser doesn't support pushstate, just redirect to the url
			if(history.pushState === undefined) {
				document.location = url;
				return;
			}

			if(!Nav.current_show) {
				// 1st time Nav() has been called

				// set current show func to a simple default 
				Nav.current_show = function(data) {
					if(data["page"] !== undefined) {
						// hide all elements with class "page" by setting css display to "none"
						var pages = document.getElementsByClassName('page')
						for(var i = 0; i < pages.length; i++ ) {
							pages[ i ].style.display = "none";
						}
						// jump to top of document
						document.body.scrollIntoView()
						// show the new page
						var p = document.getElementById( "page_"+data.page ).style.display = "inherit"
					}
				}

				if(history.replaceState !== undefined) {
					// set state for the current/initial location
					history.replaceState(state, "", url)
					// wire in the pop handler
					window.onpopstate = function(evt) {
						if(evt.state) {
							var data = evt.state
							Nav.current_show(evt.state.data)
						}
					}
				}
			}
			else {
				// this is 2nd or later call to Nav()
				state.pageYOffset = window.pageYOffset;
				history.pushState(state, "", url);
			}

			// if new show func supplied, start using that one
			if(new_show) {
				Nav.current_show = new_show
			}

			Nav.current_show(data)
		}


		// Ties a Javascript object to some user interface elements in the browser DOM.
		M.MXU = function( base, data ) {

			const form_types = "input select textarea".toUpperCase().split( " " );

			let named_element = function( name ) {
				return base.querySelector( "[name="+name+"]" );
			}
			
			let proxy = new Proxy( data, {

				get: function( tgt, prop ) {
					let e = named_element( prop );
					if( e ) {
						let v;
						if( form_types.includes( e.tagName ) ) {
							if( e.type == "checkbox" ) {
								v = e.checked;
							}
							else {
								v = e.value;
							}
						}
						else {
							v = e.innerHTML;
						}
						tgt[ prop ] = v;
					}
					return tgt[ prop ];
				},

				set: function( tgt, prop, v ) {
					tgt[ prop ] = v;
					let e = named_element( prop );
					if( e ) {
						if( form_types.includes( e.tagName ) ) {
							if( e.type == "checkbox" ) {
								e.checked = !! v;
							}
							else {
								e.value = v;
							}
						}
						else {
							e.innerHTML = v;
						}
					}
				},

			});

			for(let key in data ) {
				proxy[ key ] = data[ key ];
				let e = named_element( key );
				if( e && form_types.includes( e.tagName ) ) {
					e.onchange = evt => {
						proxy[ key ] = e.value;
					}
				}
			}

			return proxy;
		};


		// FDrop
		/*
		var dt = elem("droptarget");
		FDrop.attach(dt, function(files, evt) {
			files = files;
			var f = files[0];
			FDrop.mk_data_url(f, function(u) {
				dt.innerHTML = "<img height=100 src='"+u+"'><br>name="+f.name+"<br>type="+f.type+"<br>size="+f.size+"<p>data url:<p>"+u;
			});

		});
		*/
		(function() {

			let attach = function(element, cb) {

				let style = element.style
				let old_opacity = style.opacity

				element.ondragenter = function(evt) {
					style.opacity = "0.5";
				}
				element.ondragleave = function(evt) {
					if(evt.target === element)
						style.opacity = old_opacity;
				}

				// for drag/drop to work, element MUST have ondragover AND ondrop defined 
				element.ondragover = function(evt) {
					evt.preventDefault();			// required: ondragover MUST call this.
				}
				element.ondrop = function(evt) {
					evt.preventDefault();			// required
					style.opacity = old_opacity;	// because ondragleave not called on drop (chrome at least)
					let files = evt.dataTransfer.files
					cb(files, evt);
				}

			};

			let mk_data_url = function(f, cb) {
				let reader = new FileReader();
				reader.onload = function() {
					let data = reader.result;
					cb(data);
				};
				reader.readAsDataURL(f);
			};

			M.FDrop = {
				attach: attach,
				mk_data_url: mk_data_url,
			}
			
		})();

	}

	// Load an image asyncrhonously, scale it to a specific width/height, convert
	// the image to a "data:" url, and return it via callback.
	M.scale_data_image = function( image_data_url, new_width, new_height, cb ) {
		let img = new Image();
		img.onload = function() {
			let cnv = document.createElement( "canvas" );
			cnv.width = new_width;
			cnv.height = new_height;
			var ctx = cnv.getContext("2d");
			ctx.drawImage(img, 0, 0, new_width, new_height);
			let new_data_url = cnv.toDataURL( "image/jpeg", 0.5 );
			cb( new_data_url );
		}
		img.src = image_data_url;
	}


	// XXX Deprecated - leaving her for a while so stuff doesn't break
	// Make all the module sleepless functions global
	M.globalize = function() { }

	// Tire of constantly calling this ... just globalizing everything
	let g = isBrowser ? window : global;
	for( let k in M ) {
		g[ k ] = M[ k ];
	}

	if(isNode) {

		module.exports = M;

	} else {

		// XXX can't combine other modules in browser unless we adopt the browser import/module stuff

		window.sleepless = M;

	}


})();
