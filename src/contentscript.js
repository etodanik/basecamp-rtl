function setDirectionRtl(item){
	$(item)
		.css({
			'direction': 'rtl',
			'text-align': 'right',
			// I'm not sure about the inline-block, but it seems to help with links without
			// ruining the intended content too much
			'display': 'inline-block'
		});
}

function detectDirection(){
	// we set up a couple of regular expressions to filter everything BUT
	// either English or Bidi (Arabic, Hebrew)...
	var nonBidi 	= 	/[^\u05D0-\u05FF]+/g,
		nonEnglish	=	/[^a-z]+/ig;

	// a list of elements we want to affect
	var targets = [
		'.document_page',
		'.document_body',
		'#document_title',
		'.topic .what a',
		'.content',
		'.formatted_content',
		'.in_project a',
		$('.wysihtml5-sandbox').contents().find('body')	//	this one is form wysihtml5 iFrame contents
	];

	$(targets).each(function(i, target){
		var $target = target;

		// if the target is a string, convert it to a jQuery object, if it isn't leave it be
		if(typeof target === 'string')
			$target = $(target);

		if($target == undefined)
			return;

		$target.each(function(i, item){
			// we check if we already messed with this element to avoid redundancy
			if($(item).data('basecamp-rtl') == true) return;

			var totalLength 	=	$(item).text().replace(nonEnglish, '').length,
				bidiLength		= 	$(item).text().replace(nonBidi, '').length,
				bidiRatio		=	bidiLength / totalLength;

				// if there is more than 25% bi-directional text, we assume we want it displayed RTL
				if(bidiRatio > 0.25){
					setDirectionRtl(item);
				}

				// make sure we don't do all the heavy regex-ing on this element again
				$(item).data('basecamp-rtl', true)
		});
	});
}

// this function injects a <script> element with code into the original document
function injectScript(func) {
    var injectedCode = '(' + func + ')();'
    var script = document.createElement('script');
	script.textContent = injectedCode;
	(document.head||document.documentElement).appendChild(script);
	script.parentNode.removeChild(script);
}

function init() {
	detectDirection();

	injectScript(function(){
		// we inject a prefilter that fetches any ajax activity
	    jQuery.ajaxPrefilter(function( options ) {
			var originalSuccess = options.success;
			// if the ajax call succeeded we assume content might change
			options.success = function (data, textStatus, jXHR) {
				// a message is sent from the injected script to be received by this contentscript.js
				window.postMessage("basecampRtlCheck", "https://basecamp.com/");
				if(originalSuccess != undefined){
					originalSuccess(data, textStatus, jXHR);
				}
			};
		});
	});
}

window.addEventListener("message", receiveMessage, false);

function receiveMessage(event) {
	// if the right message is received, we check the page for BIDI again
	if(event.data == 'basecampRtlCheck'){
		setTimeout(detectDirection, 750);
	}
}

init();
