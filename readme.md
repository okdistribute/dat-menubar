# Desktop Application for `dat`

This is a cross-platform desktop application for [dat](http://dat-data.com). PRs welcome.

Sharing a folder gives you a link. Give that link to someone else so they can download the data. Your data will be available as long as the app is running, traveling through no centralized servers. If the app is closed, the data will no longer be served.

![open](images/download.png)

## TODO

- [ ] Create distribution tarball/.app
- [ ] See info on each dat (e.g., number of peers)
- [ ] Write to a debug log which can be viewed from 'debug' option in settings
- [ ] Prompt to start downloading when the user clicks a link starting with `dat://`

## Developer Install

This app under active development and not production ready. If you want to test it out, you can get it set up locally.

### Have dat 1.0

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
