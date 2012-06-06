define("shave", ["mustache"], function (_mustache) {

	var cache = {},
		helpers = {},
		isArray = Array.isArray || function (value) {
			return value.constructor === Array;
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
				var value;
				output = {};
				for (var key in manifest) {
					value = manifest[key];
					output[key] = preprocess(manifest[key], input[key]);
				}
			}
		}
		else {
			// non-iterable
			var split = manifest.split("|"),
				helper = (split.length > 1) ? split[1] : null;

			output = (helper && helper in helpers) ? helpers[helper](input) : input;
		}
		
		return output;
	}
	
	function returnHTML (callback, data, template, manifest) {
		
		// remap data?
		
		// preprocess data according to manifest
		
		var output = (manifest) ? preprocess(manifest, data) : data;
		
		callback(Mustache.to_html(template, output));
		
	}
	
	function render (url, data, callback) {
		
		if (url in cache) {
			var definition = cache[url];
			returnHTML(callback, data, definition.template, definition.manifest);
		}
		else {
			
			// read template into cache
			// parse manifest from json header
			
			require(["text!" + url], function (response) {	
				var manifest, template,
					match = response.match(/^(?:\{\{!([\s\S]*?|)!\}\})?([\s\S]*|)$/);
					
				template = match[2];
				manifest = match[1] || null;
				
				if (manifest) {
					manifest = JSON.parse(manifest);
				}
				
				cache[url] = {
					template: template,
					manifest: manifest
				};
				
				returnHTML(callback, data, template, manifest);
			});
		}
	}
	
	function addHelper (id, func) {
		helpers[id] = func;
	}

	return {
		
		render: render,
		
		addHelper: addHelper
		
	};
	
});