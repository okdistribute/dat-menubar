# Desktop Application for `dat`

This is a cross-platform desktop application for [dat](http://dat-data.com). PRs welcome.

Sharing a folder gives you a link. Give that link to someone else. They put the link in the app to download the data. The two apps find each other, and the data goes peer to peer, traveling through no centralized servers. The data will be available as long as at least one peer is seeding it.

![open](images/open.png)

## TODO

- [x] Create distribution tarball/.app
- [x] sends data over webrtc swarm as well as server
- [ ] windows .exe
- [ ] move loading responsibility to ui, not app
- [x] drag and drop to dat menu bar icon
- [x] Prompt to start downloading when the user clicks a link starting with `dat://`

## Developer Install

This app under active development and not production ready. If you want to test it out, you can get it set up locally.

Easy to install and run:

```
node_modules $  git clone http://github.com/karissa/dat-app
node_modules $ cd dat-app
dat-app $ npm install
dat-app $ npm start
```
