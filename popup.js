// implements the logical xor operator. It's useful later on
function xor(a, b) {
	return (a || b) && !(a && b);
}


/* 
 *				CONSTS
 *
 *
 * All possible reasons for running or not running, and the corresponding actions
 * to take in each case.
 * The "explanation" and "action" HTML elements are updated with these strings
 * Clicking the action element passes a number code 1 through 6 to settings.html
 * Number code i is stored in array index i-1 in each of these.
 * 
 */

explanations = [
	"Currently paused for all tabs.",
	"Name replacement is not set to run on this tab's domain.",
	"Name replacement is set to run on all sites by default, but this tab's domain is an exception.",
	"Name replacement is set to run on this tab's domain.",
	"Name replacement is set to run on all sites by default.",
	"This is a special tab."];
	
actions = [
	"Un-pause name replacement.",
	"Run name replacement on this domain",
	"Remove this exception: run name replacement on this domain.",
	"Remove this rule: do not run name replacement on this domain.",
	"Add an exception: do not run name replacement on this site."];

// Elements in popup.html
var runnotrun = document.getElementById("runnotrun");
var action = document.getElementById("action");
var explanation = document.getElementById("explanation");
var settings = document.getElementById("settings");
var pauselink = document.getElementById("pauselink");

// Name replacement does not run in tabs with these protocols 
var special = ["extension:", "about:", "edge:", "chrome:", "chrome-extension:"];


/* 
 *
 *				UI UPDATE FUNCTIONALITY
 *
 *
 */
 
 
/* 
 * Updates the "Pause" or "Unpause" button in of popup.html,
 * and optionally switches pause/unpause state
 * INPUT: boolean "toggle". Whether or not to switch paused state.
 *        XOR implements this logic.
 *        (Is Paused?) XOR (To Switch?) ==> New paused state
 *   			example: (Paused = false) XOR (Switch = true) ==> TRUE,
 *				as we expect
 */
function pause_setting(toggle) {
	chrome.storage.local.get('paused', function(res) {
		if(res == undefined	) {
			chrome.storage.local.set({paused:false}, function(){});
			pauselink.textContent = "Pause name replacement";
			return;
		} 
		if((res.paused && !toggle) || (!res.paused && toggle)) {
			pauselink.textContent = "Unpause name replacement";
		} else {
			pauselink.textContent = "Pause name replacement";
		}
		
		chrome.storage.local.set({paused:xor(res.paused, toggle)}, function(){});

	});
}



/* 
 * Updates the "running" or "not running" part of popup.html
 * The current tab's URL is passed as an input. Uses the 
 * auxiliary "display" function below
 *
 */
function runnotrun_ui_update(url) {
	hostkey =  url.hostname + '1';
	protocol = url.protocol;
	chrome.storage.local.get(["paused", "allof", hostkey], function(res) {	
		if(special.indexOf(protocol) != -1) {
			display(false, 6, url.hostname);
		}
		else if(res['paused']) {
			display(false, 1, url.hostname);
		} else if( res[hostkey] == undefined) {
			if(res['allof']) {
				display(false, 2, url.hostname);
			} else {
				display(true, 5, url.hostname);
			}
		} else {
			if(res['allof']) {
				tf = true;
				display(true, 4, url.hostname);
			} else {
				display(false, 3, url.hostname);
			}
		}
	});
}

/*
 * Update in popup.html whether not replacement is running,
 * and let the "action" link trigger pass the appropriate action
 * to settings.html upon clicking
 *
 */
function display(tf, num, hostname) {
	if(tf) {
		runnotrun.textContent = "running";
		runnotrun.className = "run";
	} else {
		runnotrun.textContent = "not running";
		runnotrun.className = "notrun";
	}
	
	if(num != 6 && num != 1) {
		action.textContent = actions[num - 1];
		action.href = "settings.html" + "?h=" + hostname + "&" + "num=" + num.toString();
	}  else if(num == 1) {
		action.style.display = "none";
		action.href = "settings.html";
	}
	else {
		action.href = "settings.html";
	}
	explanation.textContent = explanations[num - 1];
	
}

/*
 *
 *
 * 					INITIALIZATION SEQUENCE
 *
 *
 * */
 
pauselink.onclick = function() { pause_setting(true); };

chrome.storage.local.get('allof', function(res) {
	if(Object.keys(res).length == 0) {
		chrome.storage.local.set({allof:true}, function(){});
	} 
});
	
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	if(tabs.length != 0) {
		runnotrun_ui_update(new URL(tabs[0].url));
	}
	
});

pause_setting(false);
