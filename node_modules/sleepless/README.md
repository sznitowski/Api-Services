
# sleepless

Sleepless Inc.'s handy Javascript stuff.

## Install

	npm install sleepless

## Usage

### Browser
	
	<script src="sleepless.js"></script>

### Node.js

	sleepless = require( "sleepless" )

### Globals

Note that in both cases of Node.js and brower, pulling in this library
will create a bunch of global functions and/or add things to the prototypes
of existing objects.
In other words, importing this library is done for its side effects;
It is not a neatly encapsulated library that doesn't pollute the global
or other namespaces.  It's a heavy polluter and probably always will be.

As such, this library is not intended for major software projects or
high security environments, etc.



