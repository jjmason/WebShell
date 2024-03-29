(function() {
  var Server, dummyLogger, express;

  express = require('express');

  dummyLogger = function() {
    var logger, name, _i, _len, _ref;
    logger = {};
    _ref = ['log', 'info', 'debug', 'warn', 'error', 'critical'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      name = _ref[_i];
      logger[name] = function() {};
    }
    return logger;
  };

  Server = (function() {

    function Server(port, staticPath, staticUrl) {
      var _this = this;
      this.port = port;
      this.staticPath = staticPath != null ? staticPath : "" + __dirname + "/../lib";
      this.staticUrl = staticUrl != null ? staticUrl : '/';
      this.app = express.createServer();
      this.app.use(express.static(this.staticPath));
      this.app.get('/config.js', function(req, res) {
        return res.send("var ws = ( window.WS ||= {} );\nws.port = " + _this.port + ";\nws.staticPath = " + _this.staticPath + ";\nif(ws.WebShellClient){\n	console.log(\"Have web shell already\");\n	new ws.WebShellClient();\n}else{\n	console.log(\"waiting for web shell\");\n	document.onload = function(){\n		console.lot(\"got web shell!\");\n		new WS.WebShellClient();\n	}\n} \n", {
          'content-type': 'text/javascript'
        });
      });
      this.app.listen(this.port);
      this.io = require('socket.io').listen(this.app);
      this.io.set('logger', dummyLogger());
      this.io.sockets.on('connection', function(socket) {
        if (_this.socket) _this.socket.close();
        _this.socket = socket;
        _this.socket.on('log', function(msg) {
          console.log("[client]", msg);
          return _this.repl.displayPrompt();
        });
        return _this.socket.on('disconnect', function() {
          return _this.socket = null;
        });
      });
    }

    Server.prototype.eval = function(code, context, file, callback) {
      var _this = this;
      if (!this.socket) return callback('NOT CONNECTED', null);
      this.socket.emit('eval', code, function(result) {
        return callback(null, result);
      });
      return null;
    };

    Server.prototype.repl = function() {
      var _this = this;
      return this.repl = require('repl').start('> ', null, function() {
        return _this.eval.apply(_this, arguments);
      });
    };

    return Server;

  })();

  exports.repl = function() {
    return global.server = new Server().repl();
  };

  exports.Server = Server;

}).call(this);
