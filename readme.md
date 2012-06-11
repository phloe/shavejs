# Shave.js
Grooming your Mustache.

Shave.js is a layer ontop of Mustache that makes it easier to:

* Sort the order of any array in the output data.
* Offset any array in the output data.
* Limit the number of items in any array in the output data.
* Load templates on the fly with no hassle.
* Handle formating of output data with helper functions. 

All without you having to contort your viewmodels to fit a template's needs.

With helpers your viewmodels can have more complex data structures reduced to Mustache friendly data;
eg, Date objects can be turned into a localized date string or a string representing the time of day - or both at the same time!

And all this in a tiny queueable and chainable api less than 1.5Kb gzipped! :)

* TODO: Remap your model to the data consumed by any given Mustache template. 


## Usage

	shave()
		.template("comments.mustache")
		.data({
				author: "Kanye West",
				comment: "Imma let u finish...",
				published: new Date("Sun Sep 13 2009 21:37:44")
			},
			{
				author: "Taylor Swift",
				comment: ".___.",
				published: new Date("Sun Sep 13 2009 21:38:15")
		})
		.target(element)
		.helpers({
			date: function (date) {
				return date.toLocaleDateString();
			},
			time: function (date) {
				return date.toLocaleTimeString();
			}
		})
		.render(function () {
			alert("Finished!");
		});



## Methods

### `shave#helper`
Add or get a helper function.
##### Arguments
* `name` - (String) The name to register the helper function by.
* `func` - (Function) Optional. The helper function.

### `shave#helpers`
Add or get helper functions.
##### Arguments
* `_helpers` - (Object) Optional. Containing helper functions; keys for names, values for functions.

### `shave#data`
Sets or gets the data to populate the template at render.
##### Arguments
* `data` - (Object) Optional. The data to populate the template.

### `shave#target`
Sets or gets the target to recieve the rendered html.
##### Arguments
* `element` - (Element) Optional. The element that will get targeted by the `render` method.

### `shave#template`
Sets or gets the current template.
##### Arguments
* `url` - (String) The url (or id) of the template.
* `template` - (String) Optional. A mustache template.

### `shave#manifest`
Sets or gets the current manifest.
##### Arguments
* `manifest` - (Object) Optional. A manifest object.

### `shave#sort`
Lets you define instructions on arrays in the output you want sort - and the functions used for sorting.
##### Arguments
* `key` - (String) A dot-separated string describing the path of the array in the output data.
* `func` - (Function) Optional. A function to use for sorting the addressed array.

### `shave#range`
Lets you define offset and  on arrays in the output.
##### Arguments
* `key` - (String) A dot-separated string describing the path of the array in the output data.
* `options` - (Object) Optional. An object with the following options:
	+ `offset` - (Number) Optional. Sets the index at which to start in the array.
	+ `limit` - (Number) Optional. Sets the number of items to be rendered from the array.

### `shave#render`
Preprocesses the data if needed and passes it through the template.
If the `shave` instance has a target defined the resulting html is inserted into it and the instance is returned.
##### Arguments
* `callback` - (Function) Optional. A callback function to be called once rendering is done. The rendered html string is passed on as an argument.
##### Returns
The current `shave` instance.

## Manifest

If you define a json manifest as a comment in your template shavejs will use that manifest to prepare your data:  

	{{!
		{
			"articles": [
				{
					"header": "string",
					"text": "string",
					"published|time": "date"
				}
			]
		}
	!}}
	{{#articles}}
	<article>
		{{#header}}<h1>{{header}}</h1>{{/header}}
		{{#published|time}}<time>{{published|time}}</time>{{/published|time}}
		{{#text}}<p>{{text}}</p>{{/text}}
	</article>
	{{/articles}}

In the above example `date|time` tells shavejs to parse the property `published` from the data object through a helper registered as `time` (if it exists).
