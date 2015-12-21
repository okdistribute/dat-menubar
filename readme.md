# Desktop Application for `dat`

Version and sync data over peer to peer network.  Simply click to share a folder and you are given a static link. Someone else can use that link to download the data, directly onto their machine. Your data travels through no centralized servers.

![open](images/open.png)

## Developer Install

It is currently in development, and not production ready. Here's how you can get it installed locally to test it out.

### have dat 1.0

Make sure you install and link dat's 1.0 branch:

```
dev $ mkdir node_modules
dev $ cd node_modules
node_modules $ git clone http://github.com/maxogden/dat
node_modules $ cd dat
dat $ git fetch
dat $ git checkout 1.0
dat $ npm link
```

Then install dat-app:

```
node_modules $  git clone http://github.com/karissa/dat-app
node_modules $ cd dat-app
dat-app $ npm install
dat-app $ npm start
```

## About

This is a cross-platform desktop application for [dat](http://github.com/maxogden/dat).
