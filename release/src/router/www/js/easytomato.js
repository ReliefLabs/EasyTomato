
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
		return $.post('/tomato.cgi', data, function() {
			tomato_env.set('_service', 'restrict-restart'); //returns the restart to the default after applying changes
		});
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

   var str = tomato_env.vars['time'],date;
   if (str instanceof Date) {
       date = str;
   } else {
       var re1 = /\d{2}\s(Jan|Feb|...|Dec)\s\d{4}\s\d{2}:\d{2}:\d{2}/g;
       date = new Date(str.match(re1)[0]);
   }
   date.setMinutes(date.getMinutes()+1);
   tomato_env.vars['time'] = date;
   var re = /(Mon|Tue|...|Sun)\s(Jan|Feb|...|Dec)\s\d{2}\s\d{4}\s\d{2}:\d{2}/;
   $('.tomato_time').html(date.toString().match(re)[0]);
}

//groups and rules

var groups = [],
	devices = [],
	unassigned = [],
	unassigned_rules = [],
	device_names = {},
	groups_nvram_id = 'easytomato_groups',
	unassigned_rules_nvram_id = 'easytomato_rules',
	block_adult_content_nvram_id = 'wan_dns',
	block_adult_content_status = false,
	block_ad_status = false,
	unsaved_groups = {};


var load_adult_block = function(){
	return $.when(tomato_env.get(block_adult_content_nvram_id),tomato_env.get('easytomato_saved_wan_dns'))
			.then(function() {
			block_adult_content_status = tomato_env.vars[block_adult_content_nvram_id]=='208.67.222.123 208.67.220.123';	
	});
};

var load_adblock = function(){
	return $.when(tomato_env.get('adblock'))
			.then(function() {
			block_ad_status = tomato_env.vars['adblock']=='1';	
	});
};

var load_devices = function() {
	return $.when(tomato_env.get('lan_ipaddr'),tomato_env.get('devlist'), tomato_env.get('easytomato_device_names')).then(function() {
		var mac_addrs = {};
		$.each(tomato_env.vars['arplist'], function() {
			var mac = this[2],
				device = {
				'name': this[0],
 				'ip': this[1], 
				'mac': this[2].toLowerCase()};

			devices.push(device);
			unassigned.push(device);		
			mac_addrs[mac] = device;
		});

		//Remove devices in unassigned that are in groups
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

		//Removes Wan addresses - we may do this another way
		var re = /[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}/;
			var temp = tomato_env.vars['lan_ipaddr'].match(re)[0];
				unassigned = unassigned.filter(function(a){
					if( temp === a.ip.match(re)[0]){
						return true;	
					}
						return false;
				})				
		
		//loads device names
		try {
			device_names = JSON.parse(unescape(tomato_env.vars['easytomato_device_names']));
		} catch(e) {
			device_names = {};
		}
		


		//Name devices in unassigned list
		$.each(unassigned, function(i, device){
			if (device_names[device.mac]){
				device.name = device_names[device.mac];
			} else {
				var check = contains(tomato_env.vars['devlist'], device, 'mac');

				if (check){
					device.name = check;			
				} else{
					device.name = "device_"+ device.mac.substr(12).toUpperCase()
				}
			}
		});


		// Will check matching MAC address in devicelist
		function contains(a, e, prop) {
    		for( j = 0; j < a.length; j++) {
        		if(prop) {
            		if(a[j][2] == e[prop]) {
                		return a[j][0];
           			}
        		}
    		}
    		return false;
		};

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
	tomato_env.set('easytomato_device_names', escape(JSON.stringify(device_names)));


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
