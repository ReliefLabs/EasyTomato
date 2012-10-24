var full_restart_required = false;

var render_groups = function() {
	var group_template = $('#group_template').html(),
		$target = $('.group_boxes');
		var clone_groups = JSON.parse(JSON.stringify(groups));
	$.each(clone_groups, function(i, group) {
        	group.online_devices = [];
        	group.offline_devices = [];
        	$.each(group.devices, function(j, gd) {
        		var online = false;
                $.each(devices, function(k, device) {
                    if (device.mac.toLowerCase() == gd.mac.toLowerCase()) {
                        online = true;
                        return false;
                    }
                });
                if (!online) {
                    group.offline_devices.push(gd);
                } else {
                	group.online_devices.push(gd);
                }
        	});
        	// sort them both alphabetically
        	group.online_devices = group.online_devices.sort(function(a, b) {
		    	return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
		    });
		    group.offline_devices = group.offline_devices.sort(function(a, b) {
		    	return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
		    })
    });
	//$target.html(Mustache.render(group_template, {'groups': groups}));
	$target.html(Mustache.render(group_template, {
            //'groups': groups
            'groups' : clone_groups
        }));
	
	$target.find('.group_box').each(function(i, element) {
		var group = groups[i],
			$this = $(this);

		group.devices = clone_groups[i].online_devices.concat(clone_groups[i].offline_devices);
			

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
				distance: 5, //Fixes listener issue in Ubuntu. Before always fires drag event after only clicking.
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
		
		//group box hover stuff
		$this.find('.devices_box li').bind({
			mouseenter:
			   function()
			   {
				$(this).find('.edit_trig').removeClass('hideme');
			   },
			mouseleave:
			   function()
			   {
				$(this).find('.edit_trig').addClass('hideme');
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
		//Edit Device Name
		$this.find('.edit_trig').bind('click', function() {
			device_name_form($(this).parents('li.device').data('device'));
		});

		//$this.find('.edit_group_trig').attr('href', 'rules.html?g='+i);
		$this.find('.edit_group_trig').attr('href', 'javascript:goToPage("rules.html?g='+i+'",'+i+')');

		//Changes the DNS servers over to OpenDNS' FamilyShield and back
		$('input[name=block_adult]').click(function() {
            if ($('input[name=block_adult]').is(':checked')){
            	$.when(tomato_env.get('wan_dns'))
            .then(function(){
            		tomato_env.set('easytomato_scratch_2', tomato_env.vars['wan_dns']);
            	    tomato_env.set('wan_dns', '208.67.222.123 208.67.220.123');	
            		$('#apply_trigger').fadeIn();
            	});
            }
            else{
            	tomato_env.set('wan_dns', tomato_env.vars['easytomato_scratch_2']);
            	$('#apply_trigger').fadeIn();
            }
            tomato_env.set('_service','*'); //Full restart on apply
            full_restart_required = true;  
		});

		if(block_adult_content_status){
			$('input[name=block_adult]').attr('checked', true);
		}else{
			$('input[name=block_adult]').attr('checked', false);
		}
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
				distance: 5,  //Fixes listener issue in Ubuntu. Before always fires drag event after only clicking.
				start: function(event, ui) {
					$(this).css('z-index','2')
				}
			});
		});
		$target.find('li').bind({
			mouseenter:
			   function()
			   {
				$(this).find('.edit_trig').removeClass('hideme');
			   },
			mouseleave:
			   function()
			   {
				$(this).find('.edit_trig').addClass('hideme');
			   }
			   
		});
		$target.find('.edit_trig').bind({
			click:
				function()
				{
					device_name_form($(this).parents('li.device').data('device'));
				}
			});

		}
		

var change_device_name = function(device) {
	var name = $('.update_name_form .device_name').val();
		if (name === '' || device.name === name) {
				// Warning
		} else {
			device.name = name;
			device_names[device.mac] = device.name;
			render_groups();
			render_devices();
			set_rules();
			$('#apply_trigger').fadeIn();
		}
	$.fancybox.close();
};

var device_name_form = function(device) {
	$.fancybox({ 
		content: Mustache.render($('#device_name_template').html(),device),
		afterShow:function(){
			$('form.update_name_form').bind("keypress", function (e) {
            	if (e.keyCode == 13) {
            		change_device_name(device);
            		return false;
            	}
        	});
			$('.save_device_name').click(function(){
				change_device_name(device);
			});	
		}
	});
}

var goToPage = function(uri, group_id) {

	if ($('#apply_trigger').is(':visible')) {
		if (group_id) {
			// Check the group has been saved
			if (unsaved_groups[group_id]) {
				var r = confirm('This group needs to be saved before you can add rules.');
				if ( r ) {
					apply_trigger_changes(function() {
						window.location = uri;
					})
				}
				return;
			}
		}
		var r = confirm("Changes not applied will be discarded. Do you want to continue?");
		if ( r ){
 			window.location = uri;
  		}
	} else {
		window.location = uri;
	}
};

var apply_trigger_changes = function(callback) {
	if (callback) {
		$.fancybox({content: $('#block_page')});
	}
	$.when(tomato_env.apply()).then(function() {
		$('#apply_trigger').fadeOut();
		if(full_restart_required){
			setTimeout('$.fancybox.close()', 7000);
		} else{
			$.fancybox.close();
		}
		if (callback) {
			callback();
		}
	});
}

$(document).ready(function() {

	$('#apply_trigger').fancybox({
		helpers:  { overlay : {closeClick: false} },
        closeBtn : false 
	});



	$.when(load_groups()).then(function(){
		$.when(load_devices(), load_adult_block()).then(function() {
		render_groups();
		render_devices();
		});
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

			if(old_group) {
				old_group.devices.splice($.inArray(device, old_group.devices), 1);
				unassigned.push(device);
				ui.draggable.remove();
				render_devices();
				set_rules();
				$('#apply_trigger').fadeIn();
			}

			
		}
	});

	
	$('#apply_trigger').click(function() {
		apply_trigger_changes();
		/*
		$.when(tomato_env.apply()).then(function() {
			$('#apply_trigger').fadeOut();
			if(full_restart_required){
				setTimeout('$.fancybox.close()', 7000);
			}else{
				$.fancybox.close();
			}
		});
*/
	});
		
	// Create group
	$('.content_bar .new_group_trig').click(function(){
		groups.push({'name': 'Untitled Group', 'devices': []});
		unsaved_groups[groups.length -1] = true;
		render_groups();
		$('#apply_trigger').fadeIn();
	});
	
});
