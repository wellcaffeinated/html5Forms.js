define(function(){
	
	var hasNativeBubbles = navigator.userAgent.indexOf('WebKit') < 0 || parseInt(navigator.userAgent.match(/AppleWebKit\/([^ ]*)/)[1].split('.')[0])  > 534
		;

	var Features = {

		nativeBubbles: hasNativeBubbles,
		badValidationImplementation: !hasNativeBubbles,  // making another var for this in case we have more criteria in the future.
		browserLanguage: (navigator.language || navigator.browserLanguage),
		supportsOutput: (function(){
				var outputEl = document.createElement('output');
				return (outputEl.value != undefined && (outputEl.onforminput !== undefined || outputEl.oninput !== undefined));
			})()
	};

	return Features;
});