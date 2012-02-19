(function() {
  var WebShellClient, elementString, upgrade;

  elementString = function(e) {
    var a, attrs;
    if (e.attributes != null) {
      attrs = ((function() {
        var _i, _len, _ref, _results;
        _ref = e.attributes;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          a = _ref[_i];
          _results.push("" + a.name + "='" + a.value + "'");
        }
        return _results;
      })()).join(" ");
    } else {
      attrs = "";
    }
    return "<" + (e.nodeName.toLowerCase()) + attrs + ">";
  };

  upgrade = function(object, depth, max) {
    var key, nobject, value, _ref;
    if (depth == null) depth = 0;
    if (max == null) max = 5;
    if (depth > max) return "...";
    if (((_ref = typeof object) === 'undefined' || _ref === 'string' || _ref === 'number' || _ref === 'boolean') || object === null) {
      return object;
    }
    if (_.isRegExp(object)) return String(object);
    if (_.isDate(object)) return "Date{" + (String(object)) + "}";
    if (_.isArguments(object)) object = _.toArray(object);
    if (_.isArray(object)) {
      return _.map(object, function(elt) {
        return upgrade(elt, depth + 1, max);
      });
    }
    if (_.isFunction(object)) {
      return "[Function" + (object.name ? ' ' + object.name : '') + "]";
    }
    if (object.selector && object.context && object.length !== void 0) {
      return _.map(object, elementString);
    }
    if (object.nodeName) return elementString(object);
    nobject = {};
    for (key in object) {
      value = object[key];
      nobject[key] = upgrade(value, depth + 1, max);
    }
    return nobject;
  };

  WebShellClient = (function() {

    function WebShellClient() {
      var name, _fn, _i, _len, _ref;
      var _this = this;
      this.context = {};
      this.socket = io.connect("" + document.location.protocol + "//" + document.location.hostname + ":" + WS.port);
      this.socket.on('eval', function(code, callback) {
        var fcode, func, rv;
        fcode = "with(__ctx){\n	return __ctx._ = " + code + ";\n}";
        func = new Function("__ctx", fcode);
        try {
          rv = func(_this.context);
        } catch (e) {
          rv = e;
        }
        return callback(upgrade(rv));
      });
      this.log("Hello from the client!");
      _ref = ['log', 'info', 'warn', 'error'];
      _fn = function(name) {
        var old;
        old = console[name];
        return console[name] = function() {
          old.apply(console, arguments);
          return _this.log.apply(_this, arguments);
        };
      };
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        name = _ref[_i];
        _fn(name);
      }
    }

    WebShellClient.prototype.log = function(m) {
      return this.socket.emit('log', m);
    };

    return WebShellClient;

  })();

  (window.WS || (window.WS = {})).WebShellClient = WebShellClient;

}).call(this);
