
elementString = (e) ->
	if e.attributes?
		attrs = ("#{a.name}='#{a.value}'" for a in e.attributes).join(" ")
	else
		attrs = ""
	return "<#{e.nodeName.toLowerCase()}#{attrs}>" 

upgrade = (object, depth = 0, max = 5) ->
	return "..." if depth > max 
	if (typeof object in ['undefined','string', 'number', 'boolean'] or object == null)
		return object
	(return String object) if _.isRegExp(object)
	(return "Date{#{String object}}") if _.isDate(object)
	(object = _.toArray object) if _.isArguments object
	if _.isArray object
		return _.map object, (elt) ->
			upgrade elt, depth + 1, max
		
	return "[Function#{if object.name then ' ' + object.name else ''}]" if _.isFunction object
	if object.selector and object.context and object.length isnt undefined
		#jQuery object
		return _.map object, elementString
	if object.nodeName
		return elementString object
	#Finally, a plain old object
	nobject = {}
	for key, value of object
		nobject[key] = upgrade(value, depth+1, max)
	return nobject
 
class WebShellClient
	constructor :  -> 
		@context = {}
		@socket = io.connect "#{document.location.protocol}//#{document.location.hostname}:#{WEB_SHELL_PORT}"
		@socket.on 'eval', (code, callback) =>
			fcode = """
				with(__ctx){
					return __ctx._ = #{code};
				}
			"""
			func = new Function("__ctx", fcode)
			try
				rv = func(@context)
			catch e
				rv = e
			callback upgrade rv
			
		@log "Hello from the client!"
		
		for name in ['log', 'info', 'warn', 'error']
			do (name) =>
				old = console[name]
				console[name] = =>
					old.apply console, arguments
					@log.apply @, arguments
		
	log : (m)-> 
		@socket.emit 'log', m
	
window.webShellClient = new WebShellClient 
	
