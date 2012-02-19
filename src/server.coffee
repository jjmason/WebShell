express = require 'express'
dummyLogger = ->
	logger = {}
	for name in ['log','info','debug','warn','error','critical']
		logger[name] = ->
	return logger
class Server
	constructor : (@port, @staticPath = "#{__dirname}/../lib", @staticUrl = '/')->
		@app = express.createServer()
		
		@app.use express.static @staticPath
		
		@app.get '/config.js', (req, res) =>
			res.send """
				var ws = window.Ws = ( window.WS || {} );
				ws.port = #{@port};
				ws.staticPath = "#{@staticPath}";
				if(ws.WebShellClient){
					console.log("Have web shell already");
					ws.ws = new ws.WebShellClient();
				}else{
					console.log("waiting for web shell");
					document.onload = function(){
						console.lot("got web shell!");
						ws.ws = new WS.WebShellClient();
					}
				} 
				
			""", {'content-type' : 'text/javascript'}
		
		
		
		@app.listen @port
		
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

exports.repl = ->
	global.server = new Server().repl()
	
exports.Server = Server
