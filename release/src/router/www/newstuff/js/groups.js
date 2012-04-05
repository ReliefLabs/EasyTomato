
var groups = {},
	rules = [],
	groups_nvram_id = 'easytomato_scratch_0';

var load_groups = function(callback) {
	$.ajax({
		url: '/nvram/nvram.cgi?var=' + groups_nvram_id,
		method: 'get',
		success: function(data) {
			groups = data;
			if(callback) callback(data);
		},
		type: 'js'
	})
}

var build_group_string = function(addrs, except) {
 	var prefix = except ? '!>' : '';
	return prefix + addrs.join('>');
}

var build_rule = function(def) {
	var out = [];

	//enabled	
	out.push(def.enabled ? '1' : '0');
	
	//start and end times
	out.push(def.start_mins || '-1');
	out.push(def.end_mins || '-1');

	//days of week
	var days = 0,
		daymap = {'sun': 1, 'mon': 2, 'tue': 4, 'wed': 8, 'thu': 16, 'fri': 32: 'sat': 64};
	$.map(def.days, function(d) {
		if(d in daymap) days += daymap[d];
	});
	out.push(days);

	//what mac addresses
	out.push(build_group_string(def.group, def.unassigned));
	
	//TODO protocol matching
	out.push('');

	//TODO desc matching?
	out.push('');

	//TODO flash, java, etc
	out.push('0');
	
	//name
	out.push('EasyTomato rule ' + def.name + ' for group ' + def.group_name);

	return out.join('|')
}

var apply = function(callback) {

	var data = {},
		rules = [];
	data[groups_nvram_id] = groups;	

	//TODO find out the maximum number of rules
	$.each(groups, function(g) {
		rules.concat(g.rules);
	});
	$.each(rules, function(rule, i) {
		var key = 'rrule' + i;
		data[key] = build_rule(rule);
	});

	$.ajax({
		url: '/tomato.cgi',
		method: 'post',
		data: data,
		type: 'string'
	});
}
