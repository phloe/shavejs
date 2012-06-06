# Shavejs
#### Grooming your Mustache.

Shavejs is a layer ontop of Mustache that you can add helpers to.

Shavejs exposes 2 methods; `shave.addHelper` and `shave.render`.

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

	shave.addHelper("isodate", function (date) {
		return date.toISOString(); 
	})