

$(function() {
/*  
	
KNOWN BUGS (x = done)		


TO-DO (x = done)		
- CRUD rules (colin)
- Create/Update rule updates calendar (colin)
x Enable/disable rule
- $('#apply_trigger').fadeIn(); whenever needed	(colin)

*/
	var rules,
		unassigned = false,
		day_map = {'sun': 0, 'mon': 1, 'tue': 2, 'wed': 3, 'thu': 4, 'fri': 5, 'sat': 6},
		date = new Date(),
		next_calendar_id;

	//Make the rules display in the weekly calendar view in the proper day of week, irrespective of what actual date it is today.
	function normalizedDate(weekday, minutes){
		return new Date(date.getFullYear(), date.getMonth(), date.getDate() + (weekday - date.getDay()), 0, minutes);
	}
	
	var event_generator = function(start, end, callback) {
		if(!rules) return;
		var blocks = [];

		$.each(rules, function(i, rule) {
			if (!rule.enabled) return true //continue

			var actual_days = (rule.days === -1) ? ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] : rule.days;
			$.each(actual_days, function(i, day) {
				var dow = day_map[day];
				if(rule.start_mins === -1 || rule.end_mins === -1) {
					blocks.push({
						'title': rule.name,
						'allDay': true
					});
				} else if(rule.end_mins < rule.start_mins) {
					blocks.push({
						'title': rule.name,
						'allDay': false,
						'start': normalizedDate(dow, rule.start_mins),
						'end': normalizedDate(dow, 24*60)
					});
					blocks.push({
						'title': rule.name,
						'allDay': false,
						'start': normalizedDate((dow + 1) % 7, 0),
						'end': normalizedDate((dow + 1) % 7, rule.end_mins)
					});
				} else {
					blocks.push({
						'title': rule.name,
						'allDay': false,
						'start': normalizedDate(dow, rule.start_mins),
						'end': normalizedDate(dow, rule.end_mins)
					});
				}
			});
		});	

		callback(blocks);
	}

	var calendar = $('#calendar').fullCalendar({
		header: false,
		defaultView: 'agendaWeek', //MM- i like agendaWeek too, not sure which one to use
		selectable: false,
		editable: false,
		eventSources: [event_generator]
	});
		

	var render_rules_list = function() {
		
		var template = $('#rule_list_template').html();	

		$('.rules_list').html(Mustache.render(template, {'rules': rules}))
			.find('.rule').each(function(i, e) {
				var $this = $(this),
					rule = rules[i];

				$this.find('.check[name="rule_toggle"]').bind('change', function() {
					rule.enabled = !rule.enabled;
					calendar.fullCalendar('refetchEvents');	
				});
				
				$this.find('.edit_rule_trig').click(function() {
					render_rule_form(rule);
				});
			});
	}

	var render_rule_form = function(rule) {
		var rule_form_template = $('#rule_form_template').html(),
			data;
	  
		if(rule) {  		
			data = {'rule': $.extend({}, rule)}
			
			// Toggle day checkboxes
			$.each(rule.days, function(){
				data.rule[this] = true;
			});	

		} else {
			data = {'rule': {}};
		}

		var start_hour, end_hour, start_min, end_min;

		if(!rule || rule.start_mins === -1 || rule.end_mins === -1) {
			start_hour = -1;
			end_hour = -1;
			start_min = -1;
			end_min = -1;
		} else {
			start_hour = Math.floor(rule.start_mins / 60);
			end_hour = Math.floor(rule.end_mins / 60);
			start_min = rule.start_mins % 60;
			end_min = rule.end_mins % 60;
		}

		data.rule.start_hours = []
		data.rule.end_hours = []
		for(var i=00; i<24; i++) {
			var is_start_hour_selected = (i === start_hour ? true : false);
			var is_end_hour_selected = (i === end_hour ? true : false);
			data.rule.start_hours.push({'value':i, 'selected':is_start_hour_selected});
			data.rule.end_hours.push({'value':i, 'selected':is_end_hour_selected});
		}
		
		data.rule.start_mins = []
		data.rule.end_mins = []
		for(var mi=00; mi<60; mi+=5) {
			var is_start_min_selected = (mi === start_min ? true : false);
			var is_end_min_selected = (mi === end_min ? true : false);
			data.rule.start_mins.push({'value':mi, 'selected':is_start_min_selected});
			data.rule.end_mins.push({'value':mi, 'selected':is_end_min_selected});
		}

		var $target = $('#ruleformbox'),
			$form = $target.html(Mustache.render(rule_form_template, data)).children('form');

		$form.find('.save_rule').bind('click', function() {
			var result = {}

			result.name = $.trim($form.find('.rule_name').val());

			if($form.find('.check[name="every_day"]').attr('checked')) {
				result.days = -1;
			} else {
				result.days = [];
				$form.find('.day:checked').each(function(i, d) {
					result.days.push($(d).attr('name'));
				});
			}

			if($form.find('.check[name="all_day"]').attr('checked')) {
				result.start_mins = -1;
				result.end_mins = -1;
			} else {
				result.start_mins = Number($form.find('.hourcombo[name="start_time_hour"]').val()) * 60 + Number($form.find('.mincombo[name="start_time_min"]').val());
				result.end_mins = Number($form.find('.hourcombo[name="end_time_hour"]').val()) * 60 + Number($form.find('.mincombo[name="end_time_min"]').val());	
			}

			result.block_all = !!$form.find('.check[name="block_all"]').attr('checked');
			result.block_social = !!$form.find('.check[name="block_social"]').attr('checked');
			result.block_stream = !!$form.find('.check[name="block_stream"]').attr('checked');

			result.block_sites = $form.find('textarea[name="block_sites"]').val().split(/\s+/);

			if(rule) {
				$.extend(rule, result);
			} else {
				result.enabled = true;
				rules.push(result);
			}	

			set_rules();
			tomato_env.apply();
			$.fancybox.close();
			render_rules_list();
			calendar.fullCalendar('refetchEvents')
		});

		$.fancybox.open($target);
	}

	$('.new_rule_trig').click(function() { render_rule_form(); });

	$.when(load_groups(), load_devices()).then(function() {
		var group_id = Number(getParamByName('g'));
		if(group_id) {
			rules = groups[group_id].rules;
			group_name = groups[group_id].name;
		} else {
			rules = unassigned_rules;
			group_name = unassigned_rules;
			unassigned = true;
		}
		
		rules = [{
			'all_day' :true,
			'block_all':true,
			'block_sites': 'http://facebook.com, http://pr0nz.com',
			'block_social':true,
			'block_stream':true,
			'days': ['mon','wed','fri'],
			'enabled':true,
			'end_mins': 625,
			'every_day' : true,
			'name':'happiness',
			'start_mins': 375
		}];
		render_rules_list();
		calendar.fullCalendar('refetchEvents');	
	});

});
