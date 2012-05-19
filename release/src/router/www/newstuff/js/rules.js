
var render_rules_list = function() {
	
	var template = $('#rules_list_template').html(),
		rules = [];

	$.each(groups, function() {	rules.concat(this.rules); });
	$('.rules_list').html(Mustache.render_template(template, rules))
		.find('rule').each(function(index, element) {

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

	var date = new Date();
	var d = date.getDate();
	var m = date.getMonth();
	var y = date.getFullYear();
	
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
		events: [
			{
				title: 'Single day event',
				start: new Date(y, m, 1)
			},
			{
				title: 'Youtube Block',
				start: new Date(y, m, d + gimmeWeekDay(1)),
				end: new Date(y, m, d + gimmeWeekDay(3))
			},
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
			{
				title: 'Meeting',
				start: new Date(y, m, d, 10, 30),
				allDay: false
			},
			{
				title: 'Lunch',
				start: new Date(y, m, d, 12, 0),
				end: new Date(y, m, d, 14, 0),
				allDay: false
			},
			{
				title: 'Birthday Party',
				start: new Date(y, m, d+1, 19, 0),
				end: new Date(y, m, d+1, 22, 30),
				allDay: false
			},
			{
				title: 'Click for Google',
				start: new Date(y, m, 28),
				end: new Date(y, m, 29),
				url: 'http://google.com/'
			}
		]
	});
	
	
	
	//toggle display of calendar entry on check click
	$('.rule_list .box_handle').live({
		click:
		   function()
		   {
				if ($(this).attr('checked')){
					calendar.fullCalendar('addEventSource',  
						[
							{
								id: 999,
								title: 'Repeating Eventz',
								start: new Date(y, m, d-2, 16, 0),
								end:new Date(y, m, d-2, 16, 30),
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
