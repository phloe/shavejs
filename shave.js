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
	
	var templates = {},
		helpers = {},
		isArray = Array.isArray || function (value) {
			return value.constructor === Array;
		};
	
	var Shave = function (options) {
		this.state = "empty";
		this.queue = [];
		this.context = {};
		return this;
	};
	
	var prototype = {
		
		template: function (url, template) {
			
			if (!url) {
				return this.context.template;
			}
			
			if (!template && url == this.context.template) {
				return this;
			}
			
			if (template && !(url in templates)) {
				templates[url] = template;
			}
			
			if (url in templates) {
				var definition = templates[url];
				this.context.template = definition.template;
				this.context.manifest = definition.manifest;
				this.context.helpers = definition.helpers;
				
			}
			else {
				
				// read template into cache
				// parse manifest from json header
				
				this.state = "waiting";
				
				var self = this,
					xhr = new XMLHttpRequest();
				xhr.open("GET", url, true);
				xhr.onload = function () {
					var manifest, template,
						match = xhr.responseText.match(/^(?:\{\{!([\s\S]*?|)!\}\})?([\s\S]*|)$/),
						_helpers = null;
						
					template = match[2];
					manifest = match[1] || null;
					
					if (manifest) {
						manifest = JSON.parse(manifest);
						
						_helpers = getHelperList(manifest);
					}
					
					templates[url] = {
						template: template,
						manifest: manifest,
						helpers: _helpers
					};
					
					self.context.template = template;
					self.context.manifest = manifest;
					self.context.helpers = _helpers;
					
					self.state = "ready";
					
					dequeue(self);
				};
				xhr.send(null);
				
			}
			
		},
		
		target: function (element) {
			
			if (!element) {
				return this.context.target || null;	
			}
			
			this.context.target = element;
			
		},
		
		data: function (data) {
			
			if (!data) {
				return this.context.data || null;
			}
			
			this.context.data = data;
			
		},
		
		helper: function (name, func) {
			
			if (!func) {
				return helpers[name];
			}
			
			helpers[name] = func;
			
		},
		
		helpers: function (_helpers) {
			
			if (!helpers) {
				return helpers;
			}
			
			for (var name in _helpers) {
				helpers[name] = _helpers[name];
			}
			
		},
		
		render: function (callback) {
			
			if (!this.context.template) {
				throw("Shave cannot render without a template!");
			}
	
			if (!this.context.data) {
				throw("Shave cannot render without data!");
			}
			
			var manifest = this.context.manifest,
				data = this.context.data,
				template = this.context.template,
				output = (manifest) ? preprocess(manifest, data) : data,
				html = mustache.to_html(template, output);
			
			
			if (this.context.target) {
				this.context.target.innerHTML = html;
			}
			
			if (typeof callback == "function") {
				callback(html);
			}
			
		},
		
		sort: function () {
			
			// todo
			
		}
		
	};
	
	function makeQueueable (method) {
	
		return function () {
			if (this.state != "waiting" && this.queue.length == 0) {
				var ret = method.apply(this, arguments);
				return (ret === undefined) ? this : ret;
			}
			else {
				this.queue.push([method, arguments]);
				return this;
			}
		};
		
	}
	
	for (var name in prototype) {
		prototype[name] = makeQueueable(prototype[name]);
	}
	
	Shave.prototype = prototype;
	
	function dequeue (shave) {
	
		if (shave.state != "waiting" && shave.queue.length > 0) {
			var item = shave.queue.shift();
			item[0].apply(shave, item[1]);
			if (shave.queue.length > 0) {
				setTimeout(function () {
					dequeue(shave);
				}, 1);
			}
		}
		
	}
	
	function getHelperList (manifest, deps) {
		
		deps = deps || []
		
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
						if (helper && helper in helpers && realKey in input) {
							output[key] = helpers[helper](input[realKey]);
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