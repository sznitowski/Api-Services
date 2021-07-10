# https-post

This utility is a fork of the original [http-post](https://github.com/samt/http-post) to support HTTPS.
This extends the functionality of the `https` library in stock node.js
providing a post request function in the same fashion of node's [https.get()](https://nodejs.org/api/https.html#https_https_get_options_callback).

In the same style as `https.get()`, this function calls `req.end()` automatically

## Installing

	npm install https-post

## Usage and parameters

	https-post(options, data[, files[, callback]])

or

	https-post(options, data[, callback])

### options

Options are the same as the ones for [https.request()](https://nodejs.org/api/https.html#https_https_get_options_callback)
except `method` will always be forced to `POST`. Note that `options` can be
replaced with the full URI of the request similar to `https.get` allowing for
even greater flexibility in your post requests.

### data

Data should be key/value pairs of form data. This does not handle file data,
see the `files` option below for more information on uploading files.

	var data = {
		name: "Sam",
		email: "sam@emberlabs.org",
		gender: "m",
		languages: [
			"C",
			"C++",
			"Java",
			"JavaScript",
			"PHP",
			"Python"
		]
	}

Pass it an empty array if you do not need to send any form data.

### files

This param is another JavaScript object that can contain many files to be posted

	var files = [
		{
			param: "img",
			path: "./assets/mycoolimage.png"
		},
		{
			param: "somefile",
			name: "mydata.txt",
			path: "C:\\Users\\Sam\\Documents\\asdf.txt"
		}
	]

You may chose to specify an optional `name` in your array. It will override the
file name as it exists in the filesystem and name it the name you specified for
the request.

### callback

Callback is the same from [https.request()](https://nodejs.org/api/https.html#https_https_get_options_callback).
It accepts an instance of [https.ClientResponce](http://nodejs.org/api/http.html#http_http_clientresponse)
that has been created during the time of the request.

## Return

Returns an instance of [http.ClientRequest](http://nodejs.org/api/http.html#http_class_http_clientrequest)

## Examples

Setting up

	var https = require('https');
	https.post = require('https-post');

Posting data

	https.post('https://localhost/postscript.php', { name: 'Bruce Wayne', email: 'batman@example.org' }, function(res){
		res.setEncoding('utf8');
		res.on('data', function(chunk) {
			console.log(chunk);
		});
	});

Posting a file

	var files = [
		{
			param: "file",
			path: "./assets/img/something.png"
		}
	];
	
	https.post('https://localhost/postscript.php', [], files, function(res){
		//...
	});

Posting multiple files

	var files = [
		{
			param: "file",
			path: "./assets/img/something.png"
		},
		{
			param: "junk",
			path: "/home/sam/hello.txt"
		}
	];
	
	https.post('https://localhost/postscript.php', [], files, function(res){
		// ...
	});

Posting data and files

	var data = {
		name: 'Sam',
		drink: 'coffee'
	};
	
	var files = [
		{
			param: "file",
			path: "./assets/img/something.png"
		},
		{
			param: "junk",
			path: "/home/sam/hello.txt"
		}
	];
	
	https.post('https://localhost/postscript.php', data, files, function(res){
		// ...
	});

## License

[The MIT License](http://opensource.org/licenses/mit-license.php)
