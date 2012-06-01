$(document).ready(function() {

	$('.no_net_pw').click(function(){
		if ($(this).attr('checked')){
			$(this).siblings('.net_pw').attr('disabled','disabled').val('');
		}
		else{
			$(this).siblings('.net_pw').removeAttr('disabled');
		}
	});
	
});
