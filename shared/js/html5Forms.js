/**
 * Standalone loader using yepnope. Modified from original.
 * _NOT_ for use with requireJS.
 */

 /**
  * Can override the default paths of resources using (before script inclusion):
  * 
  * window.H5F = {
  		paths: {
			moduleDir: 'path/to/js/amd/', // relative to html5Forms.js
			cssDir: 'path/to/css/'        // relative to html5Forms.js
		}
  * };
  */
!function( me ) {

	var initWhitespaceRe = /^\s\s*/
		,endWhitespaceRe = /\s\s*$/
		,moduleDir = me.paths && normalizePath(me.paths.moduleDir) || 'amd/'
		,cssDir = me.paths && normalizePath(me.paths.cssDir) || '../css/'
		,domloaded
		,windowLoad
		;

	if (!window.yepnope) return;

	if(document.addEventListener){
		document.addEventListener('DOMContentLoaded', function(){
			domloaded = true;
		});
	};

	function normalizePath( path ){

		return path && path.replace(/\/$/,'') + '/';
	}

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
				scriptDir + moduleDir + 'event-helpers.js',
				scriptDir + moduleDir + 'css.js',
				scriptDir + moduleDir + 'feature-tests.js',
				scriptDir + moduleDir + 'extra-features.js'
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

		/* let's load the supporting scripts according to what is in data-webforms2-support */
		var supportArray = (scriptNode.getAttribute('data-webforms2-support') || 'validation,number,color,date,ouput,range,placeholder').split(',')
			,forceJSValidation = (scriptNode.getAttribute('data-webforms2-force-js-validation') == 'true')
			,turnOffValidation = (scriptNode.getAttribute('data-webforms2-turn-off-validation') == 'true')
			,inputSupport = Modernizr.inputtypes
			,toLoad
			,callback
			,loadHTML5Widgets = false
			;

		function loadScript(url, cb){

			toLoad = toLoad || {};
			callback = callback || {};

			toLoad[url] = url;
			if(cb){
				callback[url] = cb;
			}
		}
		
		// parse which resources to load
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
							
							loadScript(scriptDir + 'webforms.js', function(){

								me.$wf2.init();
							});
							
							if (supportReq == 'autofocus') {
								loadHTML5Widgets = true;
							}
							
						}
					}
					break;

				case "number":

					if (!inputSupport.number) {

						loadScript(scriptDir + cssDir + 'number.css');
						loadHTML5Widgets = true;
					}
					break;

				case "color":

					if (!inputSupport.color) {
						
						loadScript(scriptDir + 'jscolor/jscolor.js');
						
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
						// need to load in order
						yepnope({
							load: [
								scriptDir + 'jscalendar-1.0/calendar-win2k-1.css',
								scriptDir + 'jscalendar-1.0/calendar.js',
								scriptDir + 'jscalendar-1.0/lang/calendar-' + lang + '.js',
								scriptDir + 'jscalendar-1.0/calendar-setup.js'
							]
						});
						
						loadHTML5Widgets = true;
					}
					break;
					
				case "output":
					
					if(!me.FeatureTests.supportsOutput) {
						
						loadHTML5Widgets = true;
					}
					break;
				
				case "range":
				   
				   if(!inputSupport.range) {
						loadScript(scriptDir + cssDir + 'slider.css');
						loadScript(scriptDir + 'frequency-decoder.com/slider.js', function(){

							window.fdSliderController && fdSliderController.redrawAll();
						});
					
						loadHTML5Widgets = true;
					}
					break;
				
				case "placeholder":
				case "autofocus":
					
					if (!Modernizr.input[supportReq]) {
						
						loadHTML5Widgets = true;
					}
			}
		}

		// load the resources
		yepnope({
				load: toLoad,
				callback: callback,
				complete: function (){
					
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
				}
		},
		{
			test: loadHTML5Widgets,
			yep: scriptDir + 'html5Widgets.js',
			complete: function () {
				if (loadHTML5Widgets) {
					me.EventHelpers.init();
					html5Widgets.init();
				}
			}
		});
		
	};
	
	me.turnOffNativeValidation = function () {
			
			var formNodes = document.getElementsByTagName('form');
			for (var i=0; i<formNodes.length; i++) {
				formNodes[i].setAttribute('novalidate', 'novalidate');
			}
	};

	// start loading things!
	start();

}( window.H5F || (window.H5F = {}) );
