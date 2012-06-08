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
	
	// Mustache isn't an AMD - but exposes a global
	mustache = mustache || Mustache;
	
	var templates = {},
		helpers = {},
		isArray = Array.isArray || function (value) {
			return value.constructor === Array;
		};
	
	var Shave = function (options) {
		this.context = {};
		
		if (options) {
		
			var props = ["helpers", "data", "element", "ready", "template"],
				l = props.length,
				prop;
			
			for (var i = 0; i < l; i++) {
				prop = props[i];
				if (prop in options) {
					this[prop](options[prop]);
				}
			}
			
		}
		
		return this;
	};
	
	Shave.prototype = {
		
		template: function (url, template) {
			
			if (!url) {
				return this.context.template;
			}
			
			if (template && !(url in templates)) {
				templates[url] = template;
			}
			
			if (url in templates) {
				var definition = templates[url];
				this.context.template = definition.template;
				this.context.manifest = definition.manifest;
				
				if (this.context.ready) {
					this.context.ready.call(self);
				}
			}
			else {
				
				// read template into cache
				// parse manifest from json header
				
				var self = this,
					xhr = new XMLHttpRequest();
				xhr.open("GET", url, true);
				xhr.onload = function () {
					var manifest, template,
						match = xhr.responseText.match(/^(?:\{\{!([\s\S]*?|)!\}\})?([\s\S]*|)$/);
						
					template = match[2];
					manifest = match[1] || null;
					
					if (manifest) {
						manifest = JSON.parse(manifest);
					}
					
					templates[url] = {
						template: template,
						manifest: manifest
					};
					
					self.context.template = template;
					self.context.manifest = manifest;
					
					if (self.context.ready) {
						self.context.ready.call(self);
					}
					
				};
				xhr.send(null);
				
			}
			
			return this;
			
		},
		
		ready: function (callback) {
			
			if (!callback) {
				return this.context.ready || null;
			}
			
			this.context.ready = callback;
			
			return this;
			
		},
		
		element: function (element) {
			
			if (!element) {
				return this.context.element || null;	
			}
			
			this.context.element = element;
			
			return this;
			
		},
		
		data: function (data) {
			
			if (!data) {
				return this.context.data || null;
			}
			
			this.context.data = data;
			
			return this;
		},
		
		helper: function (name, func) {
			
			if (!func) {
				return helpers[name];
			}
			
			helpers[name] = func;
			
			return this;
		},
		
		helpers: function (_helpers) {
			
			if (!helpers) {
				return helpers;
			}
			
			for (var name in _helpers) {
				helpers[name] = _helpers[name];
			}
			
			return this;
			
		},
		
		render: function () {
			
			var manifest = this.context.manifest,
				data = this.context.data,
				template = this.context.template,
				output = (manifest) ? preprocess(manifest, data) : data,
				html = mustache.to_html(template, output);
			
			if (this.context.element) {
				this.context.element.innerHTML = html;
				return this;
			}
			
			return html;
			
		},
		
		sort: function () {
			
			// todo
			
		}
		
	};
	
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