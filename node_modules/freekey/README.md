

# FreeKey

A key-value store that just can't get any cheaper or easier.

## Cost

FREE. Until it's not.

## Usage

	npm install freekey

## Node.js

Basically:

	fk = require("freekey");

	fk.put( key, value, callback ); // store something

	fk.get( key, callback ); // fetch something

	fk.del( key, callback ); // delete something


## Security

None.

This storage system is shared by EVERYONE.
There is no built in security.
If somene stores a value under the key "My important stuff", then
anyone else is free to fetch it or delete it at any time.


## Privacy

None.

Anyone can access any values under any key at any time.  
If you store data in human readable form, then any humans will be able to read it.


## Warranty

None. 

FreeKey is for prototyping, experimenting, or storing data that is not sensitive in any way.
We at Sleepless created this so that we could do research and development on software ideas
without having to always set up a proper database/datastore just for a short, quick 
experiment.

THIS SOFTWARE IS PROVIDED "AS IS" AND THE AUTHORS/PUBLISHERS DISCLAIM ALL WARRANTIES WITH
REGARD TO IT INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS.
IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL
DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN
AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.


## Details

	fk = require('freekey');

	// Set a key
	fk.put("hello", "world", () => { console.log("ALL DONE") );

	// Get a key
	// Callback contains optional res object which is the full httpResponse from the server
	fk.get('carsthatilike', (value) => { log(value, error) };

	// Delete a key
	// Simply returns the deleted key name that was passed in
	fk.del("hello", (key) => { console.log(key) };


Values passed into put() and received from get() can be any JS entity that can be passed through JSON.stringify/decode

	fk.put("mykey", { foo: [ 3, "bar", false ] }, () => { } );

	fk.get("mykey", ( obj ) => { console.log( obj.foo[ 0 ] ) );		// 3


## Easter Eggs


### Autoprefixing wrapper:

Allows you to transparently add a prefix to all your keys.

	fk_pre = fk.prefix("Weird.randum-UnlikLEE,arbitrarey PREfXIXXX");

	fk_pre.put("foo", 7, ... );		// auto-prefixes all keys to provide a little "personal space"

	fk_pre.get("foo", ... );		// 7


### Encrypting wrapper for values

	fk_crypt = fk.crypt("top.secret.password");

	fk_crypt.put("foo", "my secret stuff", ... );	// values are encrypted locally and stored encrypted

	fk_crypt.get("foo", ...);		// "my secret stuff"

	fk_crypt = fk.crypt("wrong.password");

	fk_crypt.get("foo", ...);		// error!


### This actually works

	fk_both = fk.crypt("top.secret.password").prefix("Weird.randum-UnlikLEE,arbitrarey PREfXIXXX");

	fk_both.put("foo", "my secret stuff", ... );	// Stored encrypted with wacky key

