
var render_rules_list = function(calendar) {
	
	var template = $('#rules_list_template').html(),
		rules = [];

	$.each(groups, function() {	rules.concat(this.rules); });
	$('.rules_list').html(Mustache.render_template(template, rules))
		.find('.rule').each(function(i, e) {
			$this = $(this);
			$this.data('rule', rules[i]);				
		});
}

$(function() {
	$('.fancybox').fancybox();
	
/*  
	
KNOWN BUGS (x = done)		


TO-DO (x = done)		
- CRUD rules (colin)
- Create/Update rule updates calendar (colin)
x Enable/disable rule
- $('#apply_trigger').fadeIn(); whenever needed	(colin)

*/

	var date = new Date(),
		d = date.getDate(),
		m = date.getMonth(),
		y = date.getFullYear(),
		next_calendar_id = 0;
	
	//Make the rules display in the weekly calendar view in the proper day of week, irrespective of what actual date it is today.
	function gimmeWeekDay(tgt_weekday){
		var today = date.getDay();			
		var delta = tgt_weekday - today;
		
		return delta;			
	}
	
	var calendar = $('#calendar').fullCalendar({
		header: false,
		defaultView: 'basicWeek', //MM- i like agendaWeek too, not sure which one to use
		selectable: false,
		selectHelper: true,
		select: function(start, end, allDay) {
			var title = prompt('Event Title:');
			if (title) {
				calendar.fullCalendar('renderEvent',
					{
						title: title,
						start: start,
						end: end,
						allDay: allDay
					},
					true // make the event "stick"
				);
			}
			calendar.fullCalendar('unselect');
		},
		editable: false,
		events: [],
			/*
{
				id: 999,
				title: 'No Social Media Event',
				start: new Date(y, m, d-3, 16, 0),
				end:new Date(y, m, d-3, 16, 30),
				allDay: false
			},
			{
				id: 999,
				title: 'Repeating Eventz',
				start: new Date(y, m, d-2, 16, 0),
				end:new Date(y, m, d-2, 16, 30),
				allDay: false
			},
*/
	});
	
	
	
	//toggle display of calendar entry on check click
	$('.rule_list .box_handle').live({
		click:
		   function()
		   {
				if ($(this).attr('checked')){
						rule = $(this).data('rule');
					calendar.fullCalendar('addEventSource',  
						[
							{
								id: 999,
								title: 'Repeating Eventz',
								start: new Date(y, m, d-2, 16, 0),
								end: new Date(y, m, d-2, 16, 30),
								allDay: false
							}
						]
					);
					$('#apply_trigger').fadeIn();
				}
				else{
					calendar.fullCalendar('removeEvents', 999);
					$('#apply_trigger').fadeIn();						
				}
		   }
	   
	});
	
	
});
