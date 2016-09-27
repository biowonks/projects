$(function() {
	// Enclose all HTTP methods with spans for styling purposes
	$('code').each(function() {
		var self = $(this),
			text = self.text(),
			newHtml = text.replace(/(GET|POST|PUT|DELETE|PATCH|OPTIONS)/, function(verb) {
				return '<span class="http-method http-' + verb.toLowerCase() + '">' + verb + '</span>'
			})
		self.html(newHtml)
	})
});
