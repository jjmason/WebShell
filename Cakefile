{spawn} = require 'child_process'

#Find the coffee executable
findCoffee = (cb) ->
	proc = spawn '/bin/which', ['coffee']
	buf = ''
	proc.stdout.on 'data', (buffer) -> buf += buffer.toString()
	proc.on 'exit', (status) -> 
		cb(buf.trim()) if cb?
 
#Stolen from the Coffeescript cakefile.
compileCoffeeScript = (coffee, args, cb) ->
	console.log "spawn '#{coffee}', [#{args.join(',')}]"
	proc =         spawn coffee, args
	proc.stderr.on 'data', (buffer) -> console.log buffer.toString()
	proc.on        'exit', (status) ->
		process.exit(1) if status != 0
		cb() if typeof cb is 'function'

task 'build', 'Build WebShell', (cb) ->
	findCoffee (coffee)->
		compileCoffeeScript coffee, ['-c', '-o', 'lib', 'src/client.coffee', 'src/server.coffee'], cb
