!function (name, deps, definition) {
    if (typeof define === 'function' && typeof define.amd === 'object') define(deps, definition);
    else this.H5F[name] = definition();
}('ExtraFeatures',
	[
		'./event-helpers',
		'./css'
	],
	function(
		EventHelpers,
		css
	){
		EventHelpers = EventHelpers || window.H5F.EventHelpers;
		css = css || window.H5F.CSSHelpers;

		var globalEvent = document.addEventListener?document.createEvent("HTMLEvents"):null;

		/*
		 * This should work even when webforms2 is not loaded.
		 * It sets up extra features for HTML5Forms like:
		 * 1) Setting custom error messages on form elements.
		 * 2) setting up isBlank and isBlurred classes.
		 * 3) settung up form.wf2_submitAttempted
		 */
		function setupExtraFeatures( options ) {

			options = options || {};

			parent = (options.scope || document.documentElement);

			var nodeNames = ["input", "select", "textarea"];
			for (var i=0; i<nodeNames.length; i++) {
				var nodes = parent.getElementsByTagName(nodeNames[i]);
				
				for (var j=0; j<nodes.length; j++) {
					var node = nodes[j];
					setErrorMessageEvents(node);
					setCustomClassesEvents(node);
					setNodeClasses(node, true);
				}
				
				if (i==0 && node.type=="submit") {
					EventHelpers.addEvent(node, 'click', submitClickEvent);
				}
			}
			
			var forms = parent.getElementsByTagName('form');
			for (var i=0; i<forms.length; i++) {
				EventHelpers.addEvent(forms[i], 'submit', submitEvent);
			}
		}
		
		function submitEvent(e) {
			var target = EventHelpers.getEventTarget(e);
			markSubmitAttempt(target);
		}
		
		function submitClickEvent(e) {
			var target = EventHelpers.getEventTarget(e);
			markSubmitAttempt(target.form);
		}
		
		function markSubmitAttempt(form) {
			css.addClass(form, 'wf2_submitAttempted');
		}
		
		function setCustomClassesEvents(node) {
			EventHelpers.addEvent(node, 'keyup', nodeChangeEvent);
			EventHelpers.addEvent(node, 'change', nodeChangeEvent);
			EventHelpers.addEvent(node, 'blur', nodeBlurEvent);
		}
		
		function nodeChangeEvent(e) {
			var node = EventHelpers.getEventTarget(e);
			setNodeClasses(node);
		}
		
		function setNodeClasses(node, isLoadEvent) {	
			if (node.value === '') {
				
				css.addClass(node, 'wf2_isBlank');
				css.removeClass(node, 'wf2_notBlank');
			} else {
				css.addClass(node, 'wf2_notBlank');
				css.removeClass(node, 'wf2_isBlank');
			}
			
			if (isLoadEvent && node.nodeName == 'SELECT') {
				node.setAttribute('data-wf2-initialvalue', node.value)
			}
			
			if ((node.nodeName == 'SELECT' && getAttributeValue(node, 'data-wf2-initialvalue') != node.value)
			    || (node.nodeName != 'SELECT' && getAttributeValue(node, 'value') != node.value)) {
				css.removeClass(node, 'wf2_defaultValue');
				css.addClass(node, 'wf2_notDefaultValue');
			} else {
				css.addClass(node, 'wf2_defaultValue');
				css.removeClass(node, 'wf2_notDefaultValue');
			}
		}
		
		function nodeBlurEvent(e) {
			var node = EventHelpers.getEventTarget(e);
			
			css.addClass(node, 'wf2_lostFocus');
		}
		
		function setErrorMessageEvents(node) {
			var message = getAttributeValue(node, 'data-errormessage');
			if (message) {
				if(document.addEventListener){
					node.addEventListener('invalid', showCustomMessageEvent, false);
					node.addEventListener('focus', showCustomMessageEvent, false);
					
					// Opera doesn't work well with this.
					if (!window.opera) {
						node.addEventListener('keypress', clearMessageIfValidEvent, false);
					}
					
					node.addEventListener('input', clearMessageIfValidEvent, false);
					
					if (node.nodeName == 'SELECT') {
						node.addEventListener('change', clearMessageIfValidEvent, false);
						node.addEventListener('click', clearMessageIfValidEvent, false);
					}
				} else {
					var invalidEvent = ' this.setCustomValidity("' + message + '");';
					if (node.oninvalid) {
						node.oninvalid += invalidEvent;
					} else {
						node.oninvalid = invalidEvent;
					}
					node.oninvalid = new Function('event', node.oninvalid);
					
					// IE freaks a little on keypress here, so change to keydown.
					node.attachEvent('onkeydown', clearMessageIfValidEvent);
					node.attachEvent('oninput', clearMessageIfValidEvent); 
					
					if (node.nodeName == 'SELECT') {
						node.attachEvent('change', clearMessageIfValidEvent, false);
						node.attachEvent('click', clearMessageIfValidEvent, false);
					}
				}
				
				
				clearMessageIfValid(node);
	
			}
		}
		
		function showCustomMessageEvent(event) {
			var node = event.currentTarget || event.srcElement;
			showCustomMessage(node);
		}
		
		function showCustomMessage(node) {
			if (node.validity.valid) {
				return;
			}
			var message = getAttributeValue(node, 'data-errormessage');
			node.setCustomValidity(message)
			//console.log('set custom validity')
		}
		
		function clearMessageIfValidEvent (event) {
			//console.log(event.type)
			var node = event.currentTarget || event.srcElement;
			clearMessageIfValid(node);
		}
		
		function clearMessageIfValid(node) {
			if (!node.setCustomValidity) {
				// this happens when webforms2 is not loaded yet.  Bail.
				return; 
			}
			
			node.setCustomValidity(''); 
			if (!node.checkValidity()) {
				showCustomMessage(node);
				//console.log('invalid')
				if (document.addEventListener) {
					globalEvent.initEvent('invalid', true, true); // event type,bubbling,cancelable
	        		node.dispatchEvent(globalEvent);
	        	}
			} else {
				//console.log('valid')
			}
		}
	
		function getAttributeByName(obj, attrName) {
			var i;
			
			var attributes = obj.attributes;
			for (var i=0; i<attributes.length; i++) {
				var attr = attributes[i]
				if (attr.nodeName == attrName && attr.specified) {
				  	return attr;
				}
			}
			return null;
		}
		
		function getAttributeValue(obj, attrName) {
			var attr = getAttributeByName(obj, attrName);
			
			if (attr != null) {
				return attr.nodeValue;
			} else {
				return null;
			}
		}

		// API
		return {

			init: setupExtraFeatures
		};
	}
);