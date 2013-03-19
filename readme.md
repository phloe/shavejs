![Shave.js](http://dev.phloe.net/shavejs/img/logotype.png)  

Grooming your Mustache.

Shave.js is a layer ontop of Mustache that makes it easier to:

* Sort the order of any array in the view data.
* Offset any array in the view data.
* Limit the number of items in any array in the view data.
* Load templates on the fly with no hassle.
* Handle formating of view data with helper functions. 

All without you having to contort your models to fit a template's needs.

With helpers your models can have more complex data structures reduced to Mustache friendly view data;
eg, Date objects can be turned into a localized date string or a string representing the time of day - or both at the same time!

And all this in a tiny queueable and chainable api less than 1.5Kb gzipped! :)

* TODO: Remap your model to the view data consumed by any given Mustache template. 


## Usage

Shave.js makes use of a manifest which is just an object describing the structure of the data needed in a Mustache template.
The manifest can be defined as a JSON snippet in a comment at the top of your template. This also serves as a convenient way of getting an overview of the data used in the template.  
**NB**: the comment containing the manifest **must** be the very first thing in the template and **must** have its closing tag preceded by a bang (!).

comments.mustache:
	
	{{!
		{
			"articles": [
				{
					"author": "string",
					"comment": "string",
					"published|date": "date",
					"published|time": "date"
				}
			]
		}
	!}}
	{{#articles}}
	<article>
		<h4>{{author}} said</h4>
		<p>{{comment}}</p>
		<time>at {{published|time}} on {{published|date}}</time>
	</article>
	{{/articles}}

Using the template like this:

	shave()
		.template("comments.mustache")
		.data({
			articles: [{
					author: "Kanye West",
					comment: "Imma let u finish...",
					published: new Date("Sun Sep 13 2009 21:37:44")
				},
				{
					author: "Taylor Swift",
					comment: ".___.",
					published: new Date("Sun Sep 13 2009 21:38:15")
			}]
		})
		.helpers({
			date: function (date) {
				return date.toLocaleDateString();
			},
			time: function (date) {
				return date.toLocaleTimeString();
			}
		})
		.render(function (html) {
			console.log(html);
		});

would result in the following being console.logged:

	<article>
		<h4>Kanye West said</h4>
		<p>Imma let u finish...</p>
		<time>at 9:37:44 PM GMT+02:00 on September 13, 2009</time>
	</article>
	<article>
		<h4>Taylor Swift said</h4>
		<p>.___.</p>
		<time>at 9:38:15 PM GMT+02:00 on September 13, 2009</time>
	</article>



## Methods



### helper

Add a helper function or return the helper function associated with supplied `name`.

##### Arguments

* `name` - (String) The name to register the helper function by.
* `func` - (Function) Optional. The helper function.

##### Returns

The current `shave` instance or a helper (Function).



### helpers

Add helper functions or get a hash of all registered helper functions.

##### Arguments

* `helpers` - (Object) Optional. Containing helper functions; keys for names, values for functions.

##### Returns

The current `shave` instance or a hash of helper functions (Object).



### data

Sets or gets the data to populate the template at render.

##### Arguments

* `data` - (Object) Optional. The data to populate the template.

##### Returns

The current `shave` instance or the current registered data (Object).



### target

Sets or gets the target to recieve the rendered html.

##### Arguments

* `element` - (Element) Optional. The element that will get targeted by the `render` method.

##### Returns

The current `shave` instance or the current target for the rendered output (HTMLElement).



### template

Sets or gets the current template.

##### Arguments

* `url` - (String) The url (or id) of the template.
* `template` - (String) Optional. A mustache template.

##### Returns

The current `shave` instance or the current template source (String).



### manifest

Sets or gets the current manifest.

##### Arguments

* `manifest` - (Object) Optional. A manifest object.

##### Returns

The current `shave` instance or the manifest for the current template (Object).



### sort

Lets you define instructions on arrays in the view you want sort - and the functions used for sorting.

##### Arguments

* `key` - (String) A dot-separated string describing the path of the array in the view data.
* `func` - (Function) Optional. A function to use for sorting the addressed array.

##### Returns

The current `shave` instance or a hash of sorting functions (Object).



### range

Lets you define offset and limit on arrays in the view.

##### Arguments

* `key` - (String) A dot-separated string describing the path of the array in the view data.
* `options` - (Object) Optional. An object with the following options:
	+ `offset` - (Number) Optional. Sets the index at which to start in the array.
	+ `limit` - (Number) Optional. Sets the number of items to be rendered from the array.

##### Returns

The current `shave` instance or a hash of ranges (Object).



### render

Preprocesses the data if needed and passes it through the template.
If the `shave` instance has a target defined the resulting html is inserted into it and the instance is returned.

##### Arguments

* `callback` - (Function) Optional. A callback function to be called once rendering is done. The rendered html string is passed on as an argument.

##### Returns

The current `shave` instance.