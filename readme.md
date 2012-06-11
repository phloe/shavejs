# Shavejs
Grooming your Mustache.

Shavejs is a layer ontop of Mustache.

 

## Usage

	shave()
		.template("template.mustache")
		.data({
			
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
			alert("yeeeeeahaaaaWW!");
		});



## Methods

### `helper`
Add or get a helper function.
##### Arguments
* `name` - (String) The name to register the helper function by.
* `func` - (Function) The helper function.

### `helpers`
Add or get helper functions.
##### Arguments
* `_helpers` - (Object) Containing helper functions; keys for names, values for functions.

### `data`
Sets or gets the data to populate the template at render.
##### Arguments
* `data` - (Object) The data to populate the template.

### `target`
Sets or gets the target to recieve the rendered html.
##### Arguments
* `element` - (Element) The element that will get targeted by the `render` method.

### `template`
Sets or gets the template to be rendered.
##### Arguments
* `url` - (String) The url (or id) of the template.
* `template` - (String) Optional. A mustache template.

### `render`
Preprocesses the data if needed and passes it through the template.
If the `shave` instance has a target defined the resulting html is inserted into it and the instance is returned.
##### Arguments
* `callback` - (Function) A callback function to be called once rendering is done. The rendered html string is passed on as an argument.
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
