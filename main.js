/*
	AUXILIARY FXNS
*/

// input: string of length >= 1
// output: a string capitalized like: This :)
function toFirstCap(str) {
	if(str == "") {
		return str;
	} else {
		return str[0].toString().toUpperCase() + str.substring(1, str.length).toLowerCase();
	}
}


// input: a string
// output: string, with all undesired instances replaced as our database tells us it to do
function text_replace(data, str) {
	
	var keys = Object.keys(data);
	var changed = false;
	
	for(var i = 0; i < keys.length; i++ ) {
		
		if(keys[i][keys[i].length-1] == '0') {
			
			
			var keystr = keys[i].substring(0, keys[i].length-1);
			var rep = data[keys[i]].new_replace;

			var suffix = 'g';
			var enc = '';
			if(data[keys[i]].whole_name_only) {
				enc = '\\b';
			}
			
			if(data[keys[i]].case_sensitive) {
				var re = new RegExp(enc + keystr + enc, suffix); 
				if( str.match(re) != null ) {
					console.log('h');
					changed = true;
					str = str.replace(re, rep);
				}
			} else {
				var re1 = new RegExp(enc + keystr.toLowerCase() + enc, suffix);
				if( str.match(re1) != null ) {
					console.log('i');
					changed = true;
					str = str.replace(re1, rep.toLowerCase());
				}
				var re2 = new RegExp(enc + keystr.toUpperCase() + enc, suffix);
				if( str.match(re2) != null ) {
					console.log('j');
					changed = true;
					str = str.replace(re2, rep.toUpperCase());
					console.log(str);
				}
				var re3 = new RegExp(enc + toFirstCap(keystr) + enc, suffix);
				if( str.match(re3) != null ) {
					console.log('k');
					changed = true;
					str = str.replace(re3, toFirstCap(rep));
				}
				suffix += 'i';
				var re4 = new RegExp(enc + keystr + enc, suffix);
				if( str.match(re4) != null ) {
					console.log('l');
					changed = true;
					str = str.replace(re4, rep);
					console.log(str);
				}					
			}
		}
		
	}
	
	return [changed, str];
	
}


/*
 *
 *
 *
 * main functionality
 *
 *
 *
 */


// recurse over HTML nodes x
function recurse(data, x) {
	if(x.hasChildNodes()) {
			for(var i = 0; i < x.childNodes.length; i++) {
					// recurse over non-text nodes
					if(x.childNodes[i].nodeType != 3) {
						recurse(data, x.childNodes[i]);
					} 
					// treat text nodes
					else {
						tmp = text_replace(data, x.childNodes[i].textContent);
						if(tmp[0]) {
							console.log('n');
							console.log(tmp[1]);
							x.childNodes[i].textContent = tmp[1];
						}
					}
			}
	} 
	// x has no child nodes, so it is pure text
	else {
		y = x.textContent;
		if( y != null) {
			tmp = text_replace(data, y);
			if(tmp[0]) {
				console.log('m');
				console.log(tmp[1]);
				x.textContent = tmp[1];
			}
		}
	}
}

// only run if our rules tell us to run. If we're supposed to run, run the initialization
function init() {
	chrome.storage.local.get(null, function(data) { 
		if(data['allof'] == undefined) {
			chrome.storage.local.set({allof:true}, function(){
				console.log("a");
				init2(data, true);
			});
		} else {
			console.log("b");
			init2(data, data['allof']);
		}
	});
}

function init2(data, allof) {
	if(data['paused'] == undefined) {
		chrome.storage.local.set({paused:false}, function(){
			console.log("c");
			init3(false);
		});
	} else {
		console.log("d");
		init3(data, allof, data['paused']);
	}
}

function init3(data, allof, paused) {
	if(paused || (allof && data[window.location.hostname + '1'] == undefined) || (!allof && data[window.location.hostname + '1'] != undefined)) {
		console.log("replacement not running");
	} else {
		console.log("replacement running");
		init4(data);
	}
}

// initialize name replacement
function init4(data) {
	
	//console.log(data);
	
	// start recursion over HTML elements, the ones that are initially loaded
	var doc = document.getElementsByTagName("html")[0];
	recurse(data, doc);
	
	// mutation observer options
	config = { attributes: false, childList: true, subtree: true };

	// callback for mutation observer
	callback = function(mutations, obs) {
		for(var i = 0; i < mutations.length; i++) {
			if (mutations[i].type === 'childList') {
				for(var j = 0; j < mutations[i].addedNodes.length; j++) {
					recurse(data, mutations[i].addedNodes[j]);
				}
			}
		}
	};

	// start observations
	observer = new MutationObserver(callback);
	observer.observe(doc, config);
	
} 


init();
