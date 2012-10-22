var wl_password_status = false;
var PASSWORD_MIN_LENGTH =8;

$(document).ready(function() {
	$.when(tomato_env.get('wl0_ssid'), tomato_env.get('wl0_wpa_psk'), tomato_env.get('wl0_security_mode'),
		tomato_env.get('tm_sel'), tomato_env.get('tm_dst'), tomato_env.get('easytomato_scratch_4'))
			.then(function(data1, data2, data3, timezone, dst_status, last_encryption_type){
				$('input[name=net_name]').attr('value', data1[0].wl0_ssid);
				wl_password_status = data3[0].wl0_security_mode != 'disabled';
			
				//Set Wireless Password and check box
				if(wl_password_status){
					$('input[name=no_net_pw]').attr('checked', false);
					$('input[name=net_pw]').attr('value', data2[0].wl0_wpa_psk);
					tomato_env.set('easytomato_scratch_4',data3[0].wl0_security_mode); //saving encryption mode	
				}else{
					$('input[name=no_net_pw]').attr('checked', true);
					$('input[name=net_pw]').attr('disabled','disabled');
					tomato_env.set('easytomato_scratch_4',last_encryption_type[0].easytomato_scratch_4);
				}
				if(dst_status[0].tm_dst==='1'){
					$('input[name=auto_daylight]').attr('checked', true);
				}
				$('select[name=tm_sel]').val(timezone[0].tm_sel);
				

	});

	$('.no_net_pw').click(function(){
		if ($(this).attr('checked')){
			$(this).siblings('.net_pw').attr('disabled','disabled').val('');
		}
		else{
			$(this).siblings('.net_pw').removeAttr('disabled').val('wl0_wpa_psk');
		}
	});

	$('.save_settings').bind('click', function() {
			
			if( $("input[name=net_pw]").val().length < PASSWORD_MIN_LENGTH && !$('.no_net_pw').attr('checked')) { //Checks wireless password length
				alert('Wireless password must be 8 or more characters long.')
			}else{
				if($('input[name=router_pw1]').val() != $('input[name=router_pw2]').val()) { //checks
					alert('Router passwords do not match.')
				}else{

					tomato_env.set('wl0_ssid',$('input[name=net_name]').val());
					
					//Turns wireless encryption on or off and sets password
					if($('.no_net_pw').attr('checked')){                      
						tomato_env.set('wl0_security_mode','disabled');
						tomato_env.set('wl0_akm','');
						
					}else{
						tomato_env.set('wl0_security_mode',tomato_env.vars['easytomato_scratch_4']);
						tomato_env.set('wl0_wpa_psk',$('input[name=net_pw]').val());
						switch(tomato_env.vars['easytomato_scratch_4']){
							case 'wpa_personal' : tomato_env.set('wl0_akm','psk');
							         break;
							case 'wpa2_personal': tomato_env.set('wl0_akm','psk2');
							         break;
							case 'wpaX_personal': tomato_env.set('wl0_akm','psk%20psk2');
							         break;
						}
						
					}

					
					//Time Zone settings
					tomato_env.set('tm_sel', $('select[name=tm_sel]').val());
					tomato_env.set('tm_tz', $('select[name=tm_sel]').val()); 
					if($('.auto_daylight').attr('checked')){
						tomato_env.set('tm_dst','1');	
					}else{	
						tomato_env.set('tm_dst','0');	
					}
				
					//Save router password, if one set
					if($('input[name=router_pw1]').val() != ''){   
						tomato_env.set('set_password_1',$('input[name=router_pw1]').val());
						tomato_env.set('set_password_2',$('input[name=router_pw2]').val());
					}
				
					tomato_env.set('_service','*'); //Full restart on apply
					$.fancybox('<div class="apply_changes_box">Saving Changes…</div>',{helpers:  { overlay : {closeClick: false} }, closeBtn : false });
					$.when(tomato_env.apply()).then(function() {
					setTimeout('$.fancybox.close()', 7000);
			  	
			  });
			}
		}
	});

	
});
