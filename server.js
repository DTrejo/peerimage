var http = require('http')
var path = require('path')

var ErrorPage = require('error-page')
var ecstatic = require('ecstatic')

var PUBLIC = path.join(__dirname + '/' + 'public')
var PORT = 8080
// var IS_PROD = process.env.NODE_ENV === 'production'

var static = ecstatic({ root: PUBLIC, autoIndex: true })

// recompile js bundles on change
var jsfiles = [ path.join(PUBLIC, 'index.js') ]
require('browserify-watcher')(jsfiles)

http.createServer(function(req, res) {
  res.error = ErrorPage(req, res, { debug: true })
  return static(req, res)
}).listen(PORT)

console.log('serving peerimage on http://localhost:' + PORT
  + ' with ecstatic@' + ecstatic.version + ' & node@' + process.version
)


//
// peer! no api key needed
//
var PeerServer = require('peer').PeerServer;
var server = new PeerServer({ port: 9000 });
