
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

//groups and rules

var groups = [],
	devices = [],
	unassigned = [],
	unassigned_rules = [],
	groups_nvram_id = 'easytomato_scratch_0',
	unassigned_rules_nvram_id = 'easytomato_scratch_1';

var load_devices = function() {
	return tomato_env.get('devlist').then(function() {
		var mac_addrs = {};

		$.each(tomato_env.vars['devlist'], function() {
			var mac = this[2],
				device = {'name': this[0], 'ip': this[1], 'mac': this[2]};

			devices.push(device);
			unassigned.push(device);		
			mac_addrs[mac] = device;
		});

		$.each(groups, function(i, group) {
			$.each(group.devices, function(j, device) {
				this_device = mac_addrs[device.mac];
				if(this_device) {
					group.devices[j] = this_device;
					unassigned.splice($.inArray(this_device, unassigned), 1);
				}
			});
		});		
	});

}

var load_groups = function() {
	return $.when(tomato_env.get(groups_nvram_id), tomato_env.get(unassigned_rules_nvram_id))
			.then(function() {
		try {
			groups = JSON.parse(unescape(tomato_env.vars[groups_nvram_id])) || [];
		} catch(e) {

			console.log('failed to load groups');
			groups = [];
		}

		try {
			unassigned_rules = JSON.parse(unescape(tomato_env.vars[unassigned_rules_nvram_id])) || [];
		} catch(e) {
			console.log('failed to load unassigned rules');
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
		    tomato_env.set(key, build_rule(r, true));
		    saved++;
		});
	    }
	});
	$.each(unassigned_rules, function(i, r) {
		var key = 'rrule' + saved;
		tomato_env.set(key, build_rule(r, true));
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
	return prefix + devices.join('>');
}

var build_rule = function(def, except) {
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
		$.each(def.group.devices, function() {
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
	out.push('EasyTomato rule ' + def.name + ' for group ' + def.group_name);

	return out.join('|')
}

function getParamByName(name) {
	var match = RegExp('[?&]' + name + '=([^&]*)')
		.exec(window.location.search);
	return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}
