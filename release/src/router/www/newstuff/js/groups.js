
unassigned = [
	{'name': 'eata', 'ip': '192.168.1.135', 'mac': '00:1E:64:0D:12:C2'}
]

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
				var computer = ui.draggable.data('computer'),
					old_group = ui.draggable.data('group');	

				if(old_group) old_group.computers.splice($.inArray(computer, old_group.computers));
				group.computers.push(computer);

				ui.draggable.remove();
				render_groups();

				set_rules();
				$('#apply_trigger').fadeIn();
			}
		});

		$this.find('.computer').each(function(i, element) {
			$(this).data('computer', unassigned[i]);
			$(this).data('group', group);
			$(this).draggable({
				scroll: false,
				revert: true,
				start: function(event, ui) {
					$(this).css('z-index','2')
				}
			});
		});
	});


}

var render_devices = function() {
	dev_list_template = $('#device_list_template').html();
	$target = $('.device_list');

	$('.device_list').html(Mustache.render(dev_list_template, {'computers': unassigned}))
		.find('.computer').each(function(i, element) {
			$(this).data('computer', unassigned[i]);
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

	load_groups().then(function() {
		render_groups();
		render_devices();
	});

/*   		$('.fancybox').fancybox(); */
/*   
KNOWN BUGS (x = done)		
- if you drag a group onto the same box, apply changes still gets fired
- overflow-y on group boxes to make them have a reasonable size messes with draggable
*/

	//group box hover crap
	$('.devices_box li').live({
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
	
	//group box hover, edit behavior
	$('.group_box .group_name').live({
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
	$('.group_box .edit_group_name').live({
		/*
focus:
		   function()
		   {
			var new_group_name = $(this).val();
			$(this).hide().siblings('.group_name').show().text(new_group_name);
		   },
*/				
		 keypress:
			function(e)
			{
				code= (e.keyCode ? e.keyCode : e.which);
				if (code == 13) {
					$(this).trigger('blur');
				}
			},
		
		blur:
		   function() {
				var new_group_name = ($.trim($(this).val()).length !== 0) ? $(this).val() : $(this).siblings('.group_name').text();
				if($.trim($(this).val()).length !== 0 && $.trim($(this).val()) !== $(this).siblings('.group_name').text()) $('#apply_trigger').fadeIn();
				
				$(this).hide().siblings('.group_name').text(new_group_name).show();

		   }
   
	});

	
	$('#apply_trigger').click(function() {
		tomato_env.apply();
		$(this).fadeOut();
	});

	
	// Create group
	$('.content_bar .new_group_trig').click(function(){
		groups.push({'name': 'Untitled Group', 'computers': []});
		render_groups();
		$('#apply_trigger').fadeIn();
	});
	
});
