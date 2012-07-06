$(document).ready(function() {
	$.when(tomato_env.get('wl_ssid'), tomato_env.get('wl_wpa_psk'))
			.then(function(data1, data2) {
				$('input[name=net_name]').attr('value', data1[0].wl0_ssid);
				$('input[name=net_pw]').attr('value', data2[0].wl0_wpa_psk);
	});

	$('.no_net_pw').click(function(){
		if ($(this).attr('checked')){
			$(this).siblings('.net_pw').attr('disabled','disabled').val('');
		}
		else{
			$(this).siblings('.net_pw').removeAttr('disabled');
		}
	});
	
});
