
var l = console.log
require("./sleepless.js")

o = { a:[1,2,3], t:true, f:false, o:{key:'val'}, pi:3.1415, n:null };
j = JSON.stringify(o);

throwIf( typeof nop !== "function" );

throwIf( o2j(o) !== j );
throwIf( o2j(j2o(j)) !== j );

throwIf( toInt(3) !== 3 );
throwIf( toInt(3.0) !== 3 );
throwIf( toInt("3") !== 3 );
throwIf( toInt("1,234") !== 1234 );
throwIf( toInt("1,234.56") !== 1234 );
throwIf( toInt("-1,234.56") !== -1234 );
throwIf( toInt(-1234.56) !== -1234 );

throwIf( toFlt(3) !== 3 );
throwIf( toFlt(3.0) !== 3 );
throwIf( toFlt("3") !== 3 );
throwIf( toFlt("1,234") !== 1234 );
throwIf( toFlt("1,234.56") !== 1234.56 );
throwIf( toFlt("-1,234.56") !== -1234.56 );
throwIf( toFlt(-1234.56) !== -1234.56 );

throwIf( c2b("10") !== 0.1 );
throwIf( c2b("12345") !== 123.45 );
throwIf( c2b(12345) !== 123.45 );
throwIf( c2b(1) !== 0.01 );
throwIf( b2c("100") !== 10000 );
throwIf( b2c("1.23") !== 123 );
throwIf( b2c("1,234.56") !== 123456 );
throwIf( b2c("1,234.5") !== 123450 );
throwIf( b2c("1,234") !== 123400 );
throwIf( b2c("0.01") !== 1 );
throwIf( b2c("0.01") !== 1 );

throwIf( numFmt(0) !== "0" );
throwIf( numFmt(0, 1) !== "0.0" );
throwIf( numFmt(0, 4) !== "0.0000" );
throwIf( numFmt(1, 4) !== "1.0000" );
throwIf( numFmt(1.1, 3) !== "1.100" );
throwIf( numFmt(-1.1, 3) !== "-1.100" );
throwIf( numFmt(-1.104, 2) !== "-1.10" );
throwIf( numFmt(1.105, 2) !== "1.11" );
throwIf( numFmt(-1.105, 2) !== "-1.10" );
throwIf( numFmt(1234) !== "1,234" );
throwIf( numFmt(123456) !== "123,456" );
throwIf( numFmt(1234567) !== "1,234,567" );
throwIf( numFmt(1234, 1) !== "1,234.0" );
throwIf( numFmt(1234, 3) !== "1,234.000" );
throwIf( numFmt(1234, 3, ".", "") !== "1234.000" );
throwIf( numFmt(-0.0001, 4, ":") !== "-0:0001" );
throwIf( numFmt(1234, 3, ":", "!") !== "1!234:000" );

throwIf( byteSize(123) !== "123 B" );
throwIf( byteSize(1234) !== "1.2 KB" );
throwIf( byteSize(1234567) !== "1.2 MB" );
throwIf( byteSize(1234567890) !== "1.1 GB" );
throwIf( byteSize(1234567890123) !== "1.1 TB" );

throwIf( toMoney("0.01") !== "0.01" );
throwIf( toMoney("31415.015") !== "31,415.02" );
throwIf( toMoney("31415.01") !== "31,415.01" );
throwIf( toMoney("31415.99") !== "31,415.99" );
throwIf( toMoney(0.01) !== "0.01");
throwIf( toMoney(31415.015) !== "31,415.02");
throwIf( toMoney(31415.01) !== "31,415.01" );
throwIf( toMoney(31415.99) !== "31,415.99" );
throwIf( toMoney(-0.01) !== "-0.01" );
throwIf( toMoney(-31415.016) !== "-31,415.02" );
throwIf( toMoney(-31415.01) !== "-31,415.01" );
throwIf( toMoney(-31415.99) !== "-31,415.99" );
throwIf( toMoney("1,000.00") !== "1,000.00" );

throwIf( toPct(1) !== "100", toPct(1) );
throwIf( toPct(1.013, 0) !== "101" );
throwIf( toPct(1.016, 0) !== "102" );
throwIf( toPct(0.01, 0) !== "1" );
throwIf( toPct(2.3, 3) !== "230.000" );
throwIf( toPct(-314.15, 2) !== "-31,415.00" );

throwIf( my2ts("") !== 0 );
throwIf( my2ts("2014-01-02 12:13:14") !== 1388693594 );
throwIf( my2ts(ts2my(1388693594)) !== 1388693594 );

throwIf( dt2ts() !== 0 );
throwIf( ts2us(1384565221) !== "11/15/2013 17:27:01" );
throwIf( ts2us_md(1384565221) !== "11/15" );
throwIf( ts2us_mdy(1384565221) !== "11/15/2013" );
throwIf( ts2us_mdy2(1384565221) !== "11/15/13" );
throwIf( ts2us_hm(1384565221) !== "17:27" );
throwIf( ts2us_mdyhm(1384565221) !== "11/15/2013 17:27" );
throwIf( ts2us_mdy2hm(1384565221) !== "11/15/13 17:27" );
throwIf( ts2us_dMy(1384565221) !== "15-Nov-2013" );

throwIf( !( us2dt("11/15/2013 17:27:01") instanceof Date) );
throwIf( dt2ts( us2dt("11/15/2013 17:27:01") ) !== 1384565221 );

throwIf( "foO".lcase() !== "foo" );
throwIf( "foO".ucase() !== "FOO" );
throwIf( "foO".ucfirst() !== "FoO" );
throwIf( "foo baR".ucwords() !== "Foo BaR" );
throwIf( "foo bar baz".abbr(7) !== "foo ..." );
throwIf( "foo".abbr(7) != "foo" );		// XXX why doesn't this work with !== ?
throwIf( " \tfoo bar \n".trim() !== "foo bar" );

throwIf( "Foo Bar".toId() !== "foo_bar" );
throwIf( "Foo_Bar".toId() !== "foo_bar" );
throwIf( " Foo_Bar ! ".toId() !== "foo_bar" );
throwIf( "foo_bar".toLabel() !== "Foo Bar" );
throwIf( "foo_bar".toLabel() !== "Foo Bar" );
throwIf( "foo_bar!".toLabel() !== "Foo Bar!" );

getFile("test.js", "utf8", function(err, data) {
	throwIf( err, err );
	throwIf( getFile("test.js").toString() !== data.toString() );
});

throwIf( sha1("I have a lovely bunch of coconuts.") !== "9fd0f467384256f02560d0694316b6d9bdfe7c68");
throwIf( sha256("I have a lovely bunch of coconuts.") !== "1a983ac204ea2bc92d8871d53111e021483c12a3e1ccb8ec59b0d62f3167cb13");

throwIf( "I,\nhave a lovely bunch of coconuts.".looksLike("i have", "coconuts") !== true)

throwIf( "joe@sleepless.com".is_email() !== true );
throwIf( "a@b.cd".is_email() !== true );
throwIf( "aaaaaaaaaaaaaaaaaaaa-_12.aaaa@bbbbbb.cccccccc.dddddddddddddddd".is_email() !== true );
throwIf( "joe.sleepless.com".is_email() !== false );

Thing = function() {
	this.name = "Mr. Thing";
}

t = new EE(Thing);
t.on("foo", function(n) {
	throwIf(n != "Mr. Thing");
})
t.emit("foo", t.name);

if(isBrowser) {
}


