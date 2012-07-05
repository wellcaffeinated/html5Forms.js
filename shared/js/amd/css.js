/*
 * Part of HTML5Forms.js
 *
 * released under the MIT License:
 *   http://www.opensource.org/licenses/mit-license.php
 */
!function (name, definition) {
    if (typeof define === 'function' && typeof define.amd === 'object') define(definition);
    else this.H5F[name] = definition();
}('CSSHelpers', function(){

	var css = {};
	
	var blankRe = new RegExp('\\s');

	/**
	 * Generates a regular expression string that can be used to detect a class name
	 * in a tag's class attribute.  It is used by a few methods, so I 
	 * centralized it.
	 * 
	 * @param {String} className - a name of a CSS class.
	 */
	
	function getClassReString(className) {
		return '\\s'+className+'\\s|^' + className + '\\s|\\s' + className + '$|' + '^' + className +'$';
	}
	
	function getClassPrefixReString(className) {
		return '\\s'+className+'-[0-9a-zA-Z_]+\\s|^' + className + '[0-9a-zA-Z_]+\\s|\\s' + className + '[0-9a-zA-Z_]+$|' + '^' + className +'[0-9a-zA-Z_]+$';
	}
	
	
	/**
	 * Make an HTML object be a member of a certain class.
	 * 
	 * @param {Object} obj - an HTML object
	 * @param {String} className - a CSS class name.
	 */
	css.addClass = function (obj, className) {
		
		if (blankRe.test(className)) {
			return;
		}
		
		// only add class if the object is not a member of it yet.
		if (!css.isMemberOfClass(obj, className)) {
			obj.className += " " + className;
		}
		
	};
	
	/**
	 * Make an HTML object *not* be a member of a certain class.
	 * 
	 * @param {Object} obj - an HTML object
	 * @param {Object} className - a CSS class name.
	 */
	css.removeClass = function (obj, className) {
		
		if (blankRe.test(className)) {
			return; 
		}
		
		
		var re = new RegExp(getClassReString(className) , "g");
		
		var oldClassName = obj.className;
	
	
		if (obj.className) {
			obj.className = oldClassName.replace(re, ' ');
		}
	
		
	};
	
	/**
	 * Determines if an HTML object is a member of a specific class.
	 * @param {Object} obj - an HTML object.
	 * @param {Object} className - the CSS class name.
	 */
	css.isMemberOfClass = function (obj, className) {
		
		if (blankRe.test(className))
			return false;
		
		var re = new RegExp(getClassReString(className) , "g");
	
		return (re.test(obj.className));
	};

	css.getAbsoluteCoords = function(obj) {
	
		var curleft = obj.offsetLeft;
		var curtop = obj.offsetTop;
		
		/*
		 * IE and Gecko
		 */
		if (obj.getBoundingClientRect) {
			var temp = obj.getBoundingClientRect();
			
			curleft = temp.left + css.getScrollX();
			curtop = temp.top + css.getScrollY();
		} else {
		
			/* Everything else must do the quirkmode.org way */
		
			if (obj.offsetParent) {
			
				while (obj = obj.offsetParent) {
					curleft += obj.offsetLeft - obj.scrollLeft;
					curtop += obj.offsetTop - obj.scrollTop;
				}
			}
		}
		return {
			x: curleft,
			y: curtop
		};
	};
	
	/**
	 * Get the the amount of pixels the window has been scrolled from the top.  If there is no
	 * vertical scrollbar, this function return 0.
	 *
	 * @return {int} - the amount of pixels the window has been scrolled to the right, in pixels.
	 */
	css.getScrollX = function (myWindow)
	{
		var myDocument;
		
		if (myWindow) {
			myDocument = myWindow.document;
		} else {
			myWindow = window;
			myDocument = document;
		}
		
		// All except that I know of except IE
		if (myWindow.pageXOffset != null) {
			return myWindow.pageXOffset;
		// IE 6.x strict
		} else if (myDocument.documentElement != null 
				&& myDocument.documentElement.scrollLeft !="0px" 
					&& myDocument.documentElement.scrollLeft !=0)  {
			return myDocument.documentElement.scrollLeft;
		// all other IE
		} else if (myDocument.body != null && 
			myDocument.body.scrollLeft != null) {
			return myDocument.body.scrollLeft;
		// if for some reason none of the above work, this should.
		} else if (myWindow.scrollX != null) {
			return myWindow.scrollX;
		} else {
			return null;
		}
	};
	
	/**
	 * Get the the amount of pixels the window has been scrolled to the right.  If there is no
	 * horizontal scrollbar, this function return 0.
	 * 
	 * @return {int} - the amount of pixels the window has been scrolled to the right, in pixels.
	 */
	css.getScrollY = function(myWindow)
	{
		var myDocument;
		
		if (myWindow) {
			myDocument = myWindow.document;
		} else {
			myWindow = window;
			myDocument = document;
		}
		
		// All except that I know of except IE
		if (myWindow.pageYOffset != null) {
			return myWindow.pageYOffset;
		// IE 6.x strict
		} else if (myDocument.documentElement != null
				&& myDocument.documentElement.scrollTop !="0px" 
					&& myDocument.documentElement.scrollTop !=0) {
			return myDocument.documentElement.scrollTop;
		// all other IE
		} else if (myDocument.body && myDocument.body.scrollTop != null) { 
			return myDocument.body.scrollTop;
		// if for some reason none of the above work, this should.
		} else if (myWindow.scrollY != null) { 
			return myWindow.scrollY;
		} else {
			return null;
		}
	};
	
	/**
	 * gets the current window's width.  
	 * 
	 * @author Peter-Paul Koch - http://www.quirksmode.org
	 * @license see http://www.quirksmode.org/about/copyright.html
	 * @return {int} - the window's width, in pixels.
	 */
	css.getWindowWidth = function (theWindow)
	{
		if (!theWindow) {
			theWindow = window;
		}
		
		var theDocument = theWindow.document;
		
		// all except IE
		if (theWindow.innerWidth != null)  {
			return theWindow.innerWidth;
		// IE6 Strict mode
		} else if (theDocument.documentElement && 
				theDocument.documentElement.clientWidth ) {
			return theDocument.documentElement.clientWidth;	
		// IE strictly less than 6
		} else if (theDocument.body != null) {
			return theDocument.body.clientWidth;
		} else {	
			return null;
		}
	};
	
	/**
	 * gets the current window's height.  
	 * 
	 * @author Peter-Paul Koch - http://www.quirksmode.org
	 * @license see http://www.quirksmode.org/about/copyright.html
	 * @return {int} - the window's height in pixels.
	 */
	css.getWindowHeight = function  (theWindow)
	{
		if (!theWindow) {
			theWindow = window;
		}
			
		var theDocument = theWindow.document;
		
		// all except IE
		if (theWindow.innerHeight != null) {
			return theWindow.innerHeight;
		// IE6 Strict mode
		} else if (theDocument.documentElement && 
				theDocument.documentElement.clientHeight ) {
			return theDocument.documentElement.clientHeight;
		// IE strictly less than 6
		} else if (theDocument.body != null) {
			return theDocument.body.clientHeight;
		} else {
			return null;
		}
	};
	
	css.getMouseCoords = function (e) {
		if (!e) {
			return;
		}
		// IE
		if (e.clientX != null) {
			return {
				x: e.clientX,
				y: e.clientY
			}
		
		}
		// NS4
		else if (e.pageX != null) {
			return {
				x: e.pageX,
				y: e.pageY
			}
		// W3C
		}  else if (window.event != null && window.event.clientX != null 
				&& document.body != null && 
				document.body.scrollLeft != null) {
			return {
				x: window.event.clientX + document.body.scrollLeft,
				y: window.event.clientY + document.body.scrollTop
			}
					
		} else { 
			return null;
		}
	};

	return css;
});