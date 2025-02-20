const finalhandler = require('finalhandler')
const http = require('http')
const serveStatic = require('serve-static')

// Serve the main folder
const serve = serveStatic('./', { index: ['output/pdf_output.html', 'index.htm'] })

// Create server
const server = http.createServer(function onRequest (req, res) {
  serve(req, res, finalhandler(req, res))
})

// Listen
server.listen(3000)