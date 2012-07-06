define(
	[
		'html5forms/webforms',
		'html5forms/event-helpers',
		'html5forms/extra-features'
	],
	function(
		wf,
		eh,
		extra
	){

		eh.addPageLoadEvent(function(){
		
			wf.init( {scope: document.documentElement} );
			extra.init( {scope: document.documentElement} );

		}, true);
	}
);