
var tomato_env = {
	http_id: null,
	vars: {},
	vars_to_save: {},

	get: function(key) {
		var env = this;
		return $.getJSON('/nvram/nvram.cgi?var=' + key,
			function(data) {
				$.extend(env.vars, data);
				env.http_id = data.http_id;
			}
		);
	},

	set: function(key, value) {
		this.vars[key] = value;
		this.vars_to_save[key] = value;
	},

	apply: function() {
		data = this.vars_to_save;
		data._http_id = this.http_id;
		return $.post('/tomato.cgi', data);
	}
}

//Default restart type for apply, DNS changes and settings take '*' restart
tomato_env.set('_service', 'restrict-restart'); 

// Display clock
$(document).ready(function(){
	$.when(tomato_env.get('time')) //{ testing : 1234}
			.then(function(et_time){
				if(et_time.time !== 'Not Available') {
					updateClock();
					setInterval(updateClock, 60000);
				} else{
					$('.tomato_time').html('Time Not Available');
				}
			});
});

function updateClock(){

    date = new Date(tomato_env.vars['time']);
    date.setMinutes(date.getMinutes()+1);
    tomato_env.vars['time'] = date;
    var re = /(Mon|Tue|...|Sun)\,\s\d{2}\s(Jan|Feb|...|Dec)\s\d{4}\s\d{2}:\d{2}/;
    $('.tomato_time').html(date.toUTCString().match(re)[0]);
}

//groups and rules

var groups = [],
	devices = [],
	unassigned = [],
	unassigned_rules = [],
	groups_nvram_id = 'easytomato_groups',
	unassigned_rules_nvram_id = 'easytomato_rules',
	block_adult_content_nvram_id = 'wan_dns',
	block_adult_content_status = false;


var load_adult_block = function(){
	return $.when(tomato_env.get(block_adult_content_nvram_id),tomato_env.get('easytomato_scratch_2'))
			.then(function() {
			block_adult_content_status = tomato_env.vars[block_adult_content_nvram_id]=='208.67.222.123 208.67.220.123';	
	});
};



var load_devices = function() {
	return $.when(tomato_env.get('lan_ipaddr'),tomato_env.get('devlist')).then(function() {
		var mac_addrs = {};

		$.each(tomato_env.vars['devlist'], function() {
			var mac = this[2],
				device = {
				'name': this[0] !== "" ? this[0] : "device_"+this[2].substr(12).toUpperCase(),
 				'ip': this[1], 
				'mac': this[2].toLowerCase()};

			devices.push(device);
			unassigned.push(device);		
			mac_addrs[mac] = device;
		});
		

		$.each(groups, function(i, group) {
			$.each(group.devices, function(j, device) {
				unassigned = unassigned.filter(function(a){
					if(device.mac === a.mac){
						return false;
					}
						return true;
				})			
			});
		});
		


		//TEST AREA - Removes the duplicates from the dev list(dev list + arp list)  This will change, but works for now.
		Array.prototype.unique = function(prop) {
    		var temp = new Array();
    		for( i = 0; i < this.length; i++) {
        		if( typeof this[i] != "undefined" && !contains(temp, this[i], prop)) {
            		temp.length += 1;
            		temp[temp.length - 1] = this[i];
        		}
    		}
    		return temp;
		}
    	
    	// Will check for the Uniqueness
		function contains(a, e, prop) {
    		for( j = 0; j < a.length; j++) {
        		if(prop) {
            		if(a[j][prop] == e[prop]) {
                		return true;
           			}
        		}
        		if(a[j] == e) {
            		return true;
        		}
    		}
    		return false;
		};

		unassigned = unassigned.unique('mac');
	
		
		//Removes Wan addresses - we may do this another way
		var re = /[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}/;
			var temp = tomato_env.vars['lan_ipaddr'].match(re)[0];
				unassigned = unassigned.filter(function(a){
					if( temp === a.ip.match(re)[0]){
						return true;	
					}
						return false;
				})					
		});

}

var load_groups = function() {
	return $.when(tomato_env.get(groups_nvram_id), tomato_env.get(unassigned_rules_nvram_id))
			.then(function() {
		try {
			groups = JSON.parse(unescape(tomato_env.vars[groups_nvram_id])) || [];
		} catch(e) {

			//console.log('failed to load groups');
			groups = [];
		}

		try {
			unassigned_rules = JSON.parse(unescape(tomato_env.vars[unassigned_rules_nvram_id])) || [];
		} catch(e) {
			//console.log('failed to load unassigned rules');
			unassigned_rules = [];
		}
	});
}


var set_rules = function() {

	var rules = [],
		saved = 0;

	$.each(groups, function(i, g) {
	    if (g.rules != null) {
			$.each(g.rules, function(i, r) {
			    var key = 'rrule' + saved;
			    tomato_env.set(key, build_rule(g.name, r, false, g.devices));
			    saved++;
			});
	    }
	});
	$.each(unassigned_rules, function(i, r) {
		var key = 'rrule' + saved;
		tomato_env.set(key, build_rule(undefined, r, true));
		saved++;
	});
	
	tomato_env.set(groups_nvram_id, escape(JSON.stringify(groups)));

	for (saved; saved < 100; saved++) {
		var key = 'rrule' + saved;
		if (saved < rules.length) {
		} else {
			tomato_env.set(key, null);
		}
	}

}
var build_group_string = function(devices, except) {
 	var prefix = except ? '!>' : '';
 	if (devices.length === 0) { 
 		devices[0]='00:00:00:00:00:00'; //Makes sure that rules in empty groups don't apply to all devices
 	}
	return prefix + devices.join('>');
}

/*!
 * Builds the string to be sent to the backend
 * if except, devices param are undefined. Every device assigned to any group is added to the rule 
 * and the rule is of type all except in the back end.
 *
 * @param {Object} def
 * @param {Boolean} except
 * @param {Array} 
 * @returns {String}
 */

var build_rule = function(groupname, def, except, devices) {
	var out = [];

	//enabled	
	out.push(def.enabled ? '1' : '0');
	
	//start and end times
	out.push(def.start_mins || '-1');
	out.push(def.end_mins || '-1');

	//days of week
	var days = 0,
		daymap = {'sun': 1, 'mon': 2, 'tue': 4, 'wed': 8, 'thu': 16, 'fri': 32, 'sat': 64};
	$.map(def.days, function(d) {
		if(d in daymap) days += daymap[d];
	});
	out.push(days);

	//what mac addresses
	var group_string;
	if (except) {
		var assigned_addrs = [];
		$.each(groups, function() {
			$.each(this.devices, function() {
				assigned_addrs.push(this.mac);
			});
		});
		group_string = build_group_string(assigned_addrs, true); 
	} else {
		var addrs = [];
		$.each(devices, function() {
		   addrs.push(this.mac);	
		});
		group_string = build_group_string(addrs, false);
	}
	out.push(group_string);
	
	//TODO protocol matching
	out.push('');

	// blocked sites separated by \x0d\x0a
	if (def.block_all) {
		out.push('');
	} else {
		out.push(def.block_sites.join('\x0d\x0a'));
	}

	//TODO flash, java, etc
	out.push('0');
	
	//name
	out.push(groupname + ' - ' + def.name);

	return out.join('|')
}

function getParamByName(name) {
	var match = RegExp('[?&]' + name + '=([^&]*)')
		.exec(window.location.search);
	return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}
