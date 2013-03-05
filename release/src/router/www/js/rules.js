
$(function() {
/*  
	
KNOWN BUGS (x = done)		


TO-DO (x = done)		
- CRUD rules (colin)
- Create/Update rule updates calendar (colin)
x Enable/disable rule
- $('#apply_trigger').fadeIn(); whenever needed	(colin)

*/


	var rules=[],
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
						'allDay': true,
						'start': normalizedDate(dow, 0)
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

//Settings for the Calendar
	var calendar = $('#calendar').fullCalendar({
		header: false,
		defaultView: 'agendaWeek',
		selectable: false,
		editable: false,
		allDayText: 'All-Day',
		axisFormat: 'H:mm',
		timeFormat: 'H:mm{ - H:mm}',
		slotMinutes: 60,
		contentHeight: 999999999,
		firstHour: 0,
		aspectRatio: .5,
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
					set_rules();
					$.fancybox('<div class="apply_changes_box">Toggling Rule…</div>',{
						helpers:  { overlay : {closeClick: false} },
      					  closeBtn : false 
						});
					$.when(tomato_env.apply()).then(function() {
			  			$.fancybox.close();
			  			calendar.fullCalendar('refetchEvents');
					});
					
				});
				
				$this.find('.edit_rule_trig').click(function() {
					render_rule_form(rule);
				});
				
				$this.find('.delete_rule_trig').click(function() {
					rules.splice(i,1);
					render_rules_list();
					var group_id = getParamByName('g');
					if (group_id != null) {
						groups[group_id].rules = rules;
						tomato_env.set(groups_nvram_id, escape(JSON.stringify(groups)));
					} else {
						tomato_env.set(unassigned_rules_nvram_id, escape(JSON.stringify(rules)));
					}	
					set_rules();
					$.fancybox('<div class="apply_changes_box">Deleting Rule…</div>',{
						helpers:  { overlay : {closeClick: false} },
      					  closeBtn : false 
						});
					$.when(tomato_env.apply()).then(function() {
			  		$.fancybox.close();
			  		calendar.fullCalendar('refetchEvents');
					});
					
			});
		});
	}

	

	var render_rule_form = function(rule) {
		var rule_form_template = $('#rule_form_template').html(),
			data;
	  
		if(rule) {  		
			data = {'rule': $.extend({}, rule)}
			
			// Toggle day and hour checkboxes
			$.each(rule.days, function(){
				data.rule[this] = true;
			});	
			if(rule.days.length == 7){
				data.rule.every_day = true;
			}
			if(rule.start_mins === -1 || rule.end_mins === -1)
			{
				data.rule.all_day = true;
			}
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

			if(result.name === ''){
				result.name = 'No Rule Name';
			}

			// Sum of all days even if every_day is checked.
			//if($form.find('.check[name="every_day"]').attr('checked')) {
			//	result.days = -1;
			//} else {
			result.days = [];
			$form.find('.day:checked').each(function(i, d) {
					result.days.push($(d).attr('name'));
				});
			

			if($form.find('.check[name="all_day"]').attr('checked')) {
				result.start_mins = -1;
				result.end_mins = -1;
			} else {
				result.start_mins = Number($form.find('.hourcombo[name="start_time_hour"]').val()) * 60 + Number($form.find('.mincombo[name="start_time_min"]').val());
				result.end_mins = Number($form.find('.hourcombo[name="end_time_hour"]').val()) * 60 + Number($form.find('.mincombo[name="end_time_min"]').val());	
			}

			result.block_all = !!$form.find('.check[name="block_all"]').attr('checked');
			//result.block_social = !!$form.find('.check[name="block_social"]').attr('checked');
			//result.block_stream = !!$form.find('.check[name="block_stream"]').attr('checked');

			//Grabs the blocked sites if there are any
			result.block_sites = $form.find('textarea[name="block_sites"]').val() !== '' ?
									$form.find('textarea[name="block_sites"]').val().toLowerCase().split(/\s+/) : [];			

			if( result.block_sites.length == 0 && !result.block_all){
				alert('You must either list a site(s) to block or block all internet')
				return;
			}

			if(rule) {
				$.extend(rule, result);
			} else {
				result.enabled = true;
				rules.push(result);
			}	
			// including rules in groups variable
			var group_id = getParamByName('g');
			if (group_id != null) {
				groups[group_id].rules = rules;
				tomato_env.set(groups_nvram_id, escape(JSON.stringify(groups)));
			} else {
				tomato_env.set(unassigned_rules_nvram_id, escape(JSON.stringify(rules)));
			}			
			set_rules();

			$.fancybox('<div class="apply_changes_box">Saving&nbsp;Rule…</div>',{
						helpers:  { overlay : {closeClick: false} },
      					  closeBtn : false 
						});
					$.when(tomato_env.apply()).then(function() {
			  		$.fancybox.close();
			render_rules_list();
			calendar.fullCalendar('refetchEvents')
			});
		});

		$.fancybox.open($target, {});
	}

	$('.new_rule_trig').click(function() { render_rule_form(); });

	$.when(load_groups(), load_devices()).then(function() {
		// group_id? = false when group_id = 0
		// New condition separates correctly unassigned rules from group rules
		var group_id_param = getParamByName('g'),
			group_id = Number(group_id_param);
		if(group_id_param != null && typeof group_id != 'undefined') {
			rules = groups[group_id].rules || [];
			group_name = groups[group_id].name;

		} else {
			rules = unassigned_rules;
			group_name = 'Unassigned';
			unassigned = true;
		}
		$('.rules_title h4').html(group_name + ' Device Schedule');

	    render_rules_list();
	    calendar.fullCalendar('refetchEvents');	
	});

});
