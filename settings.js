/* todo: 
	- not allow duplicates, or underscore in domain name
	- require: entries in data be at least 3 characters long
*/

/*
	Key things here
	---------------
	- display tables: HTML elements in settings.html 
	referred to by the variables table[0], table[1], and table[2] in this file.
	These record the rules the user has saved.
	- "allof" key in Chrome local storage:
		specifies whether replacement runs by default or not

*/

// implements the logical not-xor operator. it's useful later on
function xor(a, b) {
	return (a || b) && !(a && b);
}

// makes input row in display tables
function make_input_row(num, domain) {
	
	if(num == 0 ) {
		var node = document.createElement("tr");
		
		var text01 = document.createElement("input");
		text01.type = "text";
		text01.className = "textinput";
		var text02 = document.createElement("input");
		text02.type = "text";
		text02.className = "textinput";
		
		// whole_name_only checkbox
		var check01 = document.createElement("input");
		check01.type = "checkbox";
		check01.checked = true;

		// case_sensitive checkbox
		var check02 = document.createElement("input");
		check02.type = "checkbox";
		check02.checked = false;
		
		// match_caps checkbox
		var check03 = document.createElement("input");
		check03.type = "checkbox";
		check03.checked = true;
		
		// check02 and check03 are incompatible.
		// if check02 is checked, disable check03
		check02.onclick = function() {
			if(check02.checked) {
				check03.checked = false;
				check03.onclick = function() { return false; };
				check03.style.opacity = 0.7;
			} else {
				check03.onclick = null;
				check03.style.opacity = 1.0;
			}
		};
		
		var button01 = document.createElement("input");
		button01.type = "button";
		button01.value = "Submit";
		
		
		var node01 = document.createElement("td");
		node01.className = "col1";
		var node02 = document.createElement("td");
		node02.className = "col1";
		var node03 = document.createElement("td");
		node03.className = "col2";
		var node04 = document.createElement("td");
		node04.className = "col2";
		var node05 = document.createElement("td");
		node05.className = "col2";
		var node06 = document.createElement("td");
		node06.className = "col2";
		
		node01.appendChild(text01);
		node02.appendChild(text02);
		node03.appendChild(check01);
		node04.appendChild(check02);
		node05.appendChild(check03);
		node06.appendChild(button01);
		
		node.appendChild(node01);
		node.appendChild(node02);
		node.appendChild(node03);
		node.appendChild(node04);
		node.appendChild(node05);
		node.appendChild(node06);
		
		table[0].appendChild(node);
		
		
		// todo: legal input check
		button01.onclick = function() {
			table_data_lookup(num, text01.value, function(a,b) {});
			var entry = {no:num, time_added:(new Date()).getTime(), new_replace:text02.value, whole_name_only:check01.checked, case_sensitive:check02.checked, match:check03.checked}; 
			create_table_entry(text01.value + num.toString(), entry); 
			var obj = {};
			obj[text01.value + num.toString()] = entry;
				chrome.storage.local.set(obj, function(){
					table[num].removeChild(node); 
					add_entry[num].style.visibility = "";
				});
		}	
		
	}	
	
	else if(num == 1) {
		
		var node = document.createElement("tr");
		
		var text01 = document.createElement("input");
		text01.type = "text";
		text01.className = "textinputdomain";
		if(domain != undefined) {
			text01.value = domain;
		} else {
			text01.value = "";
		}
		
		var button01 = document.createElement("input");
		button01.type = "button";
		button01.value = "Submit";
		
		
		var node01 = document.createElement("td");
		node01.className = "col1monospace";
		var node03 = document.createElement("td");
		node03.className = "col2";
		
		node01.appendChild(text01);
		node03.appendChild(button01);
		
		node.appendChild(node01);
		node.appendChild(node03);
		
		table[num].appendChild(node);
		
		button01.onclick = function() { 
			var entry = {no: num, time_added:(new Date()).getTime(), main:text01.value}; 
			create_table_entry(text01.value + num.toString(), entry); 
			var obj = {};
			obj[text01.value + num.toString()] = entry;
			chrome.storage.local.set(obj, function(){
				table[num].removeChild(node); 
				add_entry[num].style.visibility = "";
			});
		};
	} 
	
	else {
		console.log("this number you passed is not good: " + num);
	}
}

// look up element in settings.html from num + str ID
function table_lookup(num, str) {     
	for(var i = 0; i < table[num].childNodes.length; i++) {
			if( table[num].childNodes[i].tagName == "TR") {
					if( table[num].childNodes[i].childNodes[0].innerText == str ) {
						return(table[num].childNodes[i]);
					}
			}
	}
	return null;
}

// look up whether num + str ID is in chrome local data.
// passes on: [key, lookedup-object] to callback function
function table_data_lookup(num, str, callback) {  
	chrome.storage.local.get(str + num.toString(), function(res) {
		keys = Object.keys(res);
		i = keys.indexOf(str + num.toString());
		if(i == -1) {
			callback(null, null);
		} else {
			callback(keys[i], res[keys[i]]);
		}
	});
}

// removes num + str ID from chrome local data
function remove(num, str) {
	table_data_lookup(num, str, function(a, b) {
		if(!(a==null & b==null)) {
			chrome.storage.local.remove(a, function(){});
		}
	});
}

// creates entry in the HTML table.
// inputs:
//	- main = string ID
//  - data_pt = object stored for string ID in local data
function create_table_entry(main, data_pt) {
	num = data_pt.no;
	
	if(num == 0) {
		var node = document.createElement("tr");
		
		check01 = document.createElement("input");
		check01.type = "checkbox";
		check01.onclick = function() { return false; };
		check01.style.opacity = 0.7;
		
		check02 = document.createElement("input");
		check02.type = "checkbox";
		check02.onclick = function() { return false; };
		check02.style.opacity = 0.7;
		
		check03 = document.createElement("input");
		check03.type = "checkbox";
		check03.onclick = function() { return false; };
		check03.style.opacity = 0.7;
		
		check01.checked = data_pt.whole_name_only;
		check02.checked = data_pt.case_sensitive;
		check03.checked = data_pt.match;
		
		var button01 = document.createElement("input");
		button01.type = "button";
		button01.value = "Remove";
		button01.onclick = function() { 
			table[0].removeChild(node); 
			remove(0, main.substring(0, main.length-1)); };
		
		var nodes = [];
		for(var i = 0; i < 6; i++) {
			nodes.push(document.createElement("td"));
			node.appendChild(nodes[i]);
		}
		
		nodes[0].innerText = main.substring(0, main.length-1);
		nodes[0].className = nodes[1].className  = "col1";
		nodes[1].innerText = data_pt.new_replace;
		nodes[2].appendChild(check01);
		nodes[3].appendChild(check02);
		nodes[4].appendChild(check03);
		nodes[5].appendChild(button01);
		nodes[2].className = nodes[3].className = nodes[4].className = nodes[5].className = "col2";
		
		table[0].appendChild(node);
	}
	
	// todo - this is acting really weird compared to the num == 0 case
	else if(num == 1) {
		var node = document.createElement("tr");	

		var button01 = document.createElement("input");
		button01.type = "button";
		button01.value = "Remove";
		
		var node01 = document.createElement("td");
		node01.className = "col1monospace";
		var node03 = document.createElement("td");
		node03.className = "col2";
		
		node01.innerText = main.substring(0, main.length-1);
		node03.appendChild(button01);
			
		node.appendChild(node01);
		node.appendChild(node03);
		
		table[num].appendChild(node);
		
		button01.onclick = function() { 
			table[1].removeChild(node); 
			remove(1, main.substring(0, main.length-1)); };
	} 
	
	else {
		
	}
	
}

// toggle whether runs by default or not
// input: toggle: whether or not to flip
function toggle_allof(loading) {
	chrome.storage.local.get('allof', function(res) {
		if(res.allof == undefined) {
			chrome.storage.local.set({allof:true}, function() {});
			select.value = "allof";
		} else if(loading) {
			if(res.allof) {
				select.value = "allof";
			} else {
				select.value = "allexcept";
			}
		} else {
			tf = (select.value == "allof");
			chrome.storage.local.set({allof:tf}, function() {});
		}
	});	
}


// display tables
table = [ document.getElementById("table00"), document.getElementById("table01")];

// buttons for refernece
add_entry = [ document.getElementById("add_entry00"), document.getElementById("add_entry01")];
add_entry[0].onclick = function() { make_input_row(0); add_entry[0].style.visibility = "hidden"; };
add_entry[1].onclick = function() { make_input_row(1); add_entry[1].style.visibility = "hidden"; };
select = document.getElementById("select");
select.onchange = function() { toggle_allof(false); };


// pausing
pausebutton = document.getElementById("pausebutton");
function toggle_pause(toggle) {
	chrome.storage.local.get('paused', function(res) {
		if(res == undefined	) {
			chrome.storage.local.set({paused:false}, function(){});
			pausebutton.value = "Pause name replacement";
			return;
		} 
		if((res.paused && !toggle) || (!res.paused && toggle)) {
			pausebutton.value = "Unpause name replacement";
		} else {
			pausebutton.value = "Pause name replacement";
		}
		
		chrome.storage.local.set({paused:xor(res.paused, toggle)}, function(){});

	});
}
pausebutton.onclick = function() { toggle_pause(true); };


// clear all saved rules and refresh page
function clear() {
	chrome.storage.local.clear();
	location.reload();
}
document.getElementById("clearbutton").onclick = clear;

/*
 *
 *
 * 			INITIALIZATION SEQUENCE
 *
 *
 *
 */
 
 
// load data and populate display tables
function init() {
		
	toggle_pause(false);
	toggle_allof(true);
	
	chrome.storage.local.get(null, function(res) {
			keys = Object.keys(res);
			for(var i = 0; i < keys.length; i++) {
				create_table_entry(keys[i], res[keys[i]]);
			}
			init2();
		}); 
}

/*
 *
 * Process commands passed into URL by popup.html
 * Uses URL search params, with same action codes
 * as detailed in popup.html
 * URL search params: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
 */

function init2() {
	u = new URLSearchParams(window.location.search);
	// need to remove table node. fold that into
	if(u.get('h') != null) {
		var num = u.get('num');
		if(num == '2') {
			make_input_row(1, u.get('h'));
		} else if(num == '3') {
			remove(1, u.get('h'));
			table[1].removeChild(table_lookup(1, u.get('h')));
		} else if(num == '4') {
			remove(1, u.get('h'));
			table[1].removeChild(table_lookup(1, u.get('h')));
		} else if(num == '5') {
			make_input_row(1, u.get('h'));
		} else {}
	} else {
		
	}

}

init();