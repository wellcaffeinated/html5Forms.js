/**
 * Standalone loader using yepnope. Modified from original.
 * _NOT_ for use with requireJS.
 */
!function( me ) {

	var initWhitespaceRe = /^\s\s*/
		,endWhitespaceRe = /\s\s*$/
		,domloaded
		,windowLoad
		;

	if (!window.yepnope) return;

	if(document.addEventListener){
		document.addEventListener('DOMContentLoaded', function(){
			domloaded = true;
		});
	};

	function trim(str) {
		return str.replace(initWhitespaceRe, '')
			.replace(endWhitespaceRe, '');
	}
	
	function start() {

		var scriptNodes = document.getElementsByTagName('script')
			,scriptNode
			,scriptDir
			,split = navigator.userAgent.split('Firefox/')
			;

		function getScriptDir(node) {

			var arr = node.src.split('/');
			arr.pop();
			
			return arr.join('/') + '/';
		}

		for (var i = 0, l = scriptNodes.length; i < l; i++) {
			
			scriptNode = scriptNodes[i];
			
			if (scriptNode.src.match('html5Forms\.js$')) {
				scriptDir = getScriptDir(scriptNode);
				break;
			}
		}

		// load mixins and deps
		yepnope({
			load: [
				scriptDir + 'event-helpers.js',
				scriptDir + 'css.js',
				scriptDir + 'feature-tests.js',
				scriptDir + 'extra-features.js'
			],
			callback: function (url, result, key) {
				// check window.load event asap
				if(me.EventHelpers){
					me.EventHelpers.addEvent(window, 'load', function(){

						windowLoad = true;
					});
				}
			},
			//Firefox 3.6 gives a wierd error when using the Twitter API
			//unless you do this onload.
			complete: (!windowLoad && split.length>=1 && parseFloat(split[1]) <= 3.6)? 
				function () {
				
					me.EventHelpers.addEvent(window, 'load', function(){
						init(scriptNode, scriptDir);
					});

				} : function(){

					init(scriptNode, scriptDir);
				}
		});
	}
	
	function init(scriptNode, scriptDir) {

		if (!scriptNode) return;

		var inputSupport = Modernizr.inputtypes;
		/* let's load the supporting scripts according to what is in data-webforms2-support */
		var supportArray = scriptNode.getAttribute('data-webforms2-support');
		var forceJSValidation = (scriptNode.getAttribute('data-webforms2-force-js-validation') == 'true');
		var turnOffValidation = (scriptNode.getAttribute('data-webforms2-turn-off-validation') == 'true');
		if (!supportArray) {
			return;
		} else if (trim(supportArray) == 'all') {
			supportArray="validation,number,color,date,ouput,range,placeholder";
		}
		
		supportArray = supportArray.split(',');
		var toLoad = [];
		var toRunAfterLoad = [];
		var loadHTML5Widgets = false;
		
		
		for (var i=0, l = supportArray.length; i < l; i++) {

			var supportReq = trim(supportArray[i]);
			
			switch(supportReq) {
				
				case "validation":
				case "autofocus":
					if (turnOffValidation) {
						//me.turnOffNativeValidation();
						me.EventHelpers.addPageLoadEvent('html5Forms.turnOffNativeValidation')
					} else {
				
						if (!Modernizr.input.required || me.FeatureTests.badValidationImplementation || forceJSValidation) {
							
							toLoad = toLoad.push(scriptDir + 'webforms.js');
							
							if (supportReq == 'autofocus') {
								loadHTML5Widgets = true;
							}
							
						}
					}
					break;
				case "number":
					if (!inputSupport.number) {
						toLoad = toLoad.concat([
								scriptDir + '../../shared/css/number.css']);
						loadHTML5Widgets = true;
					}
					break;
				case "color":
					if (!inputSupport.color) {
						
						toLoad = toLoad.concat([  scriptDir + '../../shared/js/jscolor/jscolor.js']);
						
						loadHTML5Widgets = true;
					}	
					break;
				
				case "datetime":
				case "date":
					var lang = scriptNode.getAttribute('data-lang');
					
					
					/* If data-lang is not set, or is set to an unsupported language, use English by default. */
					if (!lang || 
						!lang.match(/^(af|al|bg|big5|br|ca|cn|cs|da|de|du|el|en|es|fi|fr|he|hr|hu|it|jp|ko|ko|lt|lt|lv|nl|no|pl|pl|pt|ro|ru|si|sk|sp|sv|tr|zh)$/)){

						lang = me.FeatureTests.browserLanguage.split('-')[0];
					}
					
					if (!inputSupport.date) {
						toLoad = toLoad.concat([  
								  scriptDir + '../../shared/js/jscalendar-1.0/calendar-win2k-1.css',
								  scriptDir + '../../shared/js/jscalendar-1.0/calendar.js', 
								  scriptDir + '../../shared/js/jscalendar-1.0/lang/calendar-' + lang + '.js', 
								  scriptDir + '../../shared/js/jscalendar-1.0/calendar-setup.js']);
						loadHTML5Widgets = true;
					}
					break;
					
				case "output":
					if(!me.FeatureTests.supportsOutput) {
						
						loadHTML5Widgets = true;
					}
					break;
				
				case "range":
				   /* yepnope({
				    	load: ['ie6!' + scriptDir + '../../shared/css/slider.css']
				   }); */
				    
					if(!inputSupport.range) {
						toLoad = toLoad.concat([  scriptDir + '../../shared/css/slider.css',
								  scriptDir + '../../shared/js/frequency-decoder.com/slider.js']);
					
								  
						loadHTML5Widgets = true;
						toRunAfterLoad.push('fdSliderController.redrawAll');
							 
					}
					break;
				case "placeholder":
				case "autofocus":
					if (!Modernizr.input[supportReq]) {
						loadHTML5Widgets = true;
					}
			}
		}
		
		
		if (toLoad.length == 0) {
			loadWidgets();
			
			if(!domloaded){

				// allow browsers that don't need webforms2 to handle custom error messages populated
				// in the data-errormessage attribute
				if (document.addEventListener) {
					document.addEventListener('DOMContentLoaded', function(){
						me.ExtraFeatures.init();
					}, false);
				}

			} else {

				me.ExtraFeatures.init();
			}
		} else {
			yepnope({
				load: toLoad,
				complete: function (){
					loadWidgets();
					me.ExtraFeatures.init();
				}
			});
		}
		
		function loadWidgets() {
			
			yepnope({
				test: loadHTML5Widgets,
				yep: scriptDir + '../../shared/js/html5Widgets.js',
				complete: function () {
					if (loadHTML5Widgets) {
						for (var i=0; i<toRunAfterLoad.length; i++)  {
							eval(toRunAfterLoad[i] + '()');
						}
						me.EventHelpers.init();
						html5Widgets.init();
						//toRunAfterLoad.push('html5Widgets.init');
					}
				}
			})
			
		}
		
	};
	
	me.turnOffNativeValidation = function () {
			
			var formNodes = document.getElementsByTagName('form');
			for (var i=0; i<formNodes.length; i++) {
				formNodes[i].setAttribute('novalidate', 'novalidate');
			}
	};

	// start loading things!
	start();

}( window.H5F = {} );
