express = require 'express'
dummyLogger = ->
	logger = {}
	for name in ['log','info','debug','warn','error','critical']
		logger[name] = ->
	return logger
class Server
	constructor : ->
		@app = express.createServer()
		@app.use express.static "#{__dirname}/static"
		@app.listen(7777)
		@io = require('socket.io').listen @app  
		@io.set 'logger', dummyLogger()
		
		@io.sockets.on 'connection', (socket)=>
			if @socket
				@socket.close()
			@socket = socket
			@socket.on 'log', (msg) => 
				console.log "[client]", msg
				@repl.displayPrompt()
				
			@socket.on 'disconnect', => @socket = null
		
	eval : (code, context, file, callback) ->
		return callback('NOT CONNECTED', null) unless @socket
		@socket.emit 'eval', code, (result) =>
			callback(null, result)
		null
	
	repl : ->
		@repl = require('repl').start '> ', null, => @eval.apply @, arguments
		
server = new Server
server.repl()


