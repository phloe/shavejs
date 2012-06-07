# Shavejs
## Grooming your Mustache.

Shavejs is a layer ontop of Mustache.


### Constructor

`shave` accepts an `options` argument with the following options:

* `helpers` - (Object) An object containing helper functions for preprocessing data.
* `data` - (Object) An object containing the data to populate the template.
* `element` - (Element) An reference to an html element which will be the target of the `render` method.
* `template` - (String) The url (or id) of the template to be used.
* `ready` - (Function) A function that will be executed once the template is ready.  

Returns an instance of `shave`.

	shave({
		template: "template.mustache",
		data: {
			foo: "bar"
		},
		element: document.getElementById("container"),
		ready: function () {
			this.render();
		}
	});

### Methods

#### `helper`
###### Arguments
* `name` - (String) The name to register the helper function by.
* `func` - (Function) The helper function.

#### `helpers`
###### Arguments
* `_helpers` - (Object) Containing helper functions; keys for names, values for functions.

#### `data`
###### Arguments
* `data` - (Object) The data to populate the template.

#### `element`
###### Arguments
* `element` - (Element) The element that will get targeted by the `render` method.

#### `template`
###### Arguments
* `url` - (String) The url (or id) of the template.
* `template` - (String) Optional. A mustache template.

#### `ready`
###### Arguments
* `callback` - (Function) A function to be executed when the template is ready for use. Bound to `this`.
 

#### `render`
Preprocesses the data if needed and passes it through the template.
If the `shave` instance has an element defined the resulting html is inserted into it and the instance is returned.
Otherwise the html is returned. 
###### Returns
A `shave` instance or an html string.

### Manifest

If you define a json manifest as a comment in your template shavejs will use that manifest to prepare your data:  

	{{!
		{
			"articles": [
				{
					"header": "string",
					"text": "string",
					"date": "date|isodate"
				}
			]
		}
	!}}
	{{#articles}}
	<article>
		{{#header}}<h1>{{header}}</h1>{{/header}}
		{{#date}}<span>{{date}}</span>{{/date}}
		{{#text}}<p>{{text}}</p>{{/text}}
	</article>
	{{/articles}}

In the above example `date|isodate` tells shavejs to parse the property through a helper registered as `isodate` (if it exists).
