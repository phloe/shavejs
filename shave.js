(function (root, factory) {
	if (typeof exports === "object") {
		module.exports = factory(require("mustache"));
		root.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
	}
	else if (typeof define === "function" && define.amd) {
		define("shave", ["mustache"], factory);
	}
	else {
		root.shave = factory(root.Mustache);
	}
}(this, function (mustache) {
	
	// Mustache isn't really AMD - but exposes a global
	mustache = mustache || Mustache;
	
	var _templates = {},
		_helpers = {},
		isArray = Array.isArray || function (value) {
			return value.constructor === Array;
		};
	
	var Shave = function (options) {
		this._state = "empty";
		this._queue = [];
		this._sort = null;
		this._range = null;
		return this;
	};
	
	var prototype = {
		
		template: function (url, template) {
			
			if (!url) {
				return this._template;
			}
			
			if (template && !(url in _templates)) {
				_templates[url] = template;
			}
			
			if (template || (!template && url != this._url)) {
							
				if (url in _templates) {
					var definition = _templates[url];
					this._url = url;
					this._template = definition.template;
					this._manifest = definition.manifest;
					this._helpers = definition.helpers;
				}
				else {
					
					// read template into cache
					// parse manifest from json header
					
					this._state = "waiting";
					
					var self = this,
						xhr = new XMLHttpRequest();
					xhr.open("GET", url, true);
					xhr.onload = function () {
						var manifest, template,
							match = xhr.responseText.match(/^(?:\{\{!([\s\S]*?|)!\}\})?([\s\S]*|)$/),
							helpers = null;
							
						template = match[2];
						manifest = match[1] || null;
						
						if (manifest) {
							manifest = JSON.parse(manifest);
							
							helpers = getHelperList(manifest);
						}
						
						_templates[url] = {
							template: template,
							manifest: manifest,
							helpers: helpers
						};
						
						self._url = url;
						self._template = template;
						self._manifest = manifest;
						self._helpers = helpers;
						
						self._state = "ready";
						
						dequeue(self);
					};
					xhr.send(null);
					
				}
			}
			
		},
		
		manifest: function (manifest) {
			
			if (!manifest) {
				return this._manifest;
			}
			
			if (this.url && this.url in _templates) {
				_templates[this.url].manifest = manifest;
			}
			
			this._manifest = manifest;
			
		},
		
		target: function (element) {
			
			if (!element) {
				return this._target || null;	
			}
			
			this._target = element;
			
		},
		
		data: function (data) {
			
			if (!data) {
				return this._data || null;
			}
			
			this._data = data;
			
		},
		
		helper: function (name, func) {
			
			if (!func) {
				return _helpers[name];
			}
			
			_helpers[name] = func;
			
		},
		
		helpers: function (helpers) {
			
			if (!helpers) {
				return _helpers;
			}
			
			for (var name in helpers) {
				_helpers[name] = helpers[name];
			}
			
		},
		
		render: function (callback) {
			
			if (!this._template) {
				throw("Shave cannot render without a template!");
			}
	
			if (!this._data) {
				throw("Shave cannot render without data!");
			}
			
			var manifest = this._manifest,
				data = this._data,
				template = this._template,
				output = (manifest) ? preprocess(manifest, data) : data,
				target = this._target,
				sort = this._sort,
				range = this._range,
				html;
			
			if (sort) {
				var array;
				for (var key in sort) {
					array = resolvePath(key, output);
					if (!isArray(array)) {
						throw("You can only sort arrays");
					}
					array.sort(sort[key]);
				}
			}
			
			if (range) {
				var array, options;
				for (var key in range) {
					array = resolvePath(key, output);
					options = range[key];
					if (!isArray(array)) {
						throw("You can only set ranges on arrays");
					}
					if ("offset" in options) {
						array.splice(0, options.offset);
					}
					if ("limit" in options) {
						array.splice(options.limit, array.length);
					}
				}
			}
				
			html = mustache.to_html(template, output);
			
			if (target) {
				target.innerHTML = html;
			}
			
			if (typeof callback == "function") {
				callback(html);
			}
			
		},
		
		sort: function (key, func) {
			
			if (!key) {
				return this._sort;
			}
			
			if (!func) {
				return this._sort[key];
			}
			
			if (!this._sort) {
				this._sort = {};
			}
			this._sort[key] = func;
			
		},
		
		range: function (key, options) {
			
			var range = this._range;
			
			if (!key) {
				return range;
			}
			
			if (options === null) {
				delete range[key];
				if (isEmpty(range)) {
					this._range = null;
				}
			}
			else if (!options) {
				return range[key];
			}
			else {
				if (!range) {
					range = {};
					this._range = range;
				}
				if (!(key in range)) {
					range[key] = {};
				}
				for (var o in options) {
					range[key][o] = options[o];
				}
			}
		}
		
	};
	
	function makeQueueable (method) {
	
		return function () {
			if (this._state != "waiting" && this._queue.length == 0) {
				var ret = method.apply(this, arguments);
				return (ret === undefined) ? this : ret;
			}
			else {
				this._queue.push([method, arguments]);
				return this;
			}
		};
		
	}
	
	for (var name in prototype) {
		prototype[name] = makeQueueable(prototype[name]);
	}
	
	Shave.prototype = prototype;
	
	function dequeue (shave) {
	
		if (shave._state != "waiting" && shave._queue.length > 0) {
			var item = shave._queue.shift();
			item[0].apply(shave, item[1]);
			if (shave._queue.length > 0) {
				setTimeout(function () {
					dequeue(shave);
				}, 1);
			}
		}
		
	}
	
	function isEmpty (object) {
		var empty = true;
		for (var k in range) {
			empty = false;
			break;
		}
		return empty;
	}
	
	function resolvePath (path, object) {
		var keys = path.split("."),
			l = keys.length, i = 0, key,
			scope = object;
		while (i < l) {
			key = keys[i++];
			if (key in object) {
				scope = scope[key];
			}
			else {
				throw("The key does not exist in the object");
			}
		}
		return scope;
	}
	
	function getHelperList (manifest, deps) {
		
		deps = deps || [];
		
		var value, split, helper;
		
		for (var key in manifest) {
			split = key.split("|");
			helper = (split.length > 1) ? split[1] : null;
			if (helper && deps.indexOf(helper) == -1) {
				deps.push(helper);
			}
			value = manifest[key];
			if (typeof value == "object" && !isArray(value)) {
				getHelperList(value, deps);
			}
		}
		
		return deps;
		
	}
	
	function preprocess (manifest, input) {
		var output;
		
		if (typeof manifest == "object") {
			if (isArray(manifest)) {
				// array
				var array = [], itemManifest = manifest[0];
				for (var i = 0, l = input.length; i < l; i++) {
					array.push(preprocess(itemManifest, input[i]));
				}
				output = array;
			}
			else {
				// object
				var split, helper, realKey;
				output = {};
				for (var key in manifest) {
					if (!(key in input)) {
						split = key.split("|");
						helper = (split.length > 1) ? split[1] : null;
						realKey = split[0];
						if (helper && helper in _helpers && realKey in input) {
							output[key] = _helpers[helper](input[realKey]);
							continue;
						}
					}
					
					output[key] = preprocess(manifest[key], input[key]);
				}
			}
		}
		else {
			// non-iterable
			output = input;
		}
		
		return output;
	}
	
	return function (options) {
		return new Shave(options || null); 
	};
	
}));