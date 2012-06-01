

var render_groups = function() {
	var group_template = $('#group_template').html(),
		$target = $('.group_boxes');
	$target.html(Mustache.render(group_template, {'groups': groups}));

	$target.find('.group_box').each(function(i, element) {
		var group = groups[i],
			$this = $(this);

		$this.data('group', group);

		$this.find('.droppable').droppable({
			hoverClass: "droppable_hover",
			drop: function( event, ui ) {
				var device = ui.draggable.data('device'),
					old_group = ui.draggable.data('group');	

				if(old_group) old_group.devices.splice($.inArray(device, old_group.devices), 1);
				else unassigned.splice($.inArray(device, unassigned), 1);
				group.devices.push(device);

				ui.draggable.remove();
				render_groups();

				set_rules();
				$('#apply_trigger').fadeIn();
			}
		});

		$this.find('.device').each(function(j, element) {
			$(this).data('device', group.devices[j]);
			$(this).data('group', group);
			$(this).draggable({
				scroll: false,
				revert: true,
				start: function(event, ui) {
					$(this).css('z-index','2')
				}
			});
		});
		
		//group box hover, edit behavior
		$this.find('.group_name').bind({
			mouseenter:
			   function()
			   {
				$(this).addClass('borderme');
			   },
			   
			mouseleave:
			   function()
			   {
				$(this).removeClass('borderme');
			   },
			   
			click:
			   function()
			   {
				$(this).hide().siblings('.edit_group_name').show().focus();
			   }
		});

		//group name edit behavior
		$this.find('.edit_group_name').bind({	
			keypress: function(e) {
				code= (e.keyCode ? e.keyCode : e.which);
				if (code == 13) {
					$(this).trigger('blur');
				}
			},
			blur: function() {
				var $this = $(this),
					value = $.trim($this.val()) || $this.siblings('.group_name').text();

				$this.hide().siblings('.group_name').text(value).show();
				group.name = value;
				set_rules()
				$('#apply_trigger').fadeIn();
		   }
		});
		
		//group box hover crap
		$this.find('.devices_box li').bind({
			mouseenter:
			   function()
			   {
				$(this).find('.info_trig').removeClass('hideme');
			   },
			mouseleave:
			   function()
			   {
				$(this).find('.info_trig').addClass('hideme');
			   }
			   
		});

		$this.find('.del_group_trig').bind('click', function() {
			groups.splice(i, 1);
			$.each(group.devices, function() {
				unassigned.push(this);
			});
			
			$this.remove();
			render_devices();

			set_rules();
			$('#apply_trigger').fadeIn();
		});	

		$this.find('.edit_group_trig').attr('href', 'rules.html?g='+i);
		
	});


}

var render_devices = function() {
	dev_list_template = $('#device_list_template').html();
	$target = $('.device_list');

	$('.device_list').html(Mustache.render(dev_list_template, {'devices': unassigned}))
		.find('.device').each(function(i, element) {
			$(this).data('device', unassigned[i]);
			$(this).draggable({
				scroll: false,
				revert: true,
				start: function(event, ui) {
					$(this).css('z-index','2')
				}
			});
		});
		
		
}

$(document).ready(function() {

	$('#apply_trigger').fancybox({
		helpers:  { overlay : {closeClick: false} },
        closeBtn : false 
	});


	$.when(load_groups(), load_devices()).then(function() {
		render_groups();
		render_devices();
	});

/*   
KNOWN BUGS (x = done)		
- if you drag a group onto the same box, apply changes still gets fired
- overflow-y on group boxes to make them have a reasonable size messes with draggable
*/

	// Sidenav droppable magic
	$('.unassigned_group_box').droppable({
		hoverClass: "droppable_hover",
		drop: function( event, ui ) {
			var device = ui.draggable.data('device'),
				old_group = ui.draggable.data('group');	

			if(old_group) old_group.devices.splice($.inArray(device, old_group.devices), 1);
			unassigned.push(device);

			ui.draggable.remove();
			render_devices();

			set_rules();
			render_devices();
			$('#apply_trigger').fadeIn();
		}
	});

	
	$('#apply_trigger').click(function() {
		tomato_env.apply();
		$(this).fadeOut();
	});

	
	// Create group
	$('.content_bar .new_group_trig').click(function(){
		groups.push({'name': 'Untitled Group', 'devices': []});
		render_groups();
		$('#apply_trigger').fadeIn();
	});
	
});
