
# runq

Run a queue of functions sequentially.


## Install

	npm install runq


## Usage

	runq = require("runq");

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


