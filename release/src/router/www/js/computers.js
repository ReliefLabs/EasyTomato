function updateScale(hours) {
	now = new Date;

	then = new Date;

	then.setTime(then.getTime() - hours * 60 * 60 * 1000);

	txGraph.xDomain([then, now]);
	rxGraph.xDomain([then, now]);

}

$(document).ready(function() {
	$('.time_toggle').click(function() {
		$('.time_toggle').removeClass('time_toggle_active')
		$(this).addClass('time_toggle_active')
		var hours = $(this).attr('data-hours');
		updateScale(hours);
	});
})