function updateScale(hours) {
	now = new Date;

	then = new Date;

	then.setTime(then.getTime() - hours * 60 * 60 * 1000);

	txGraph.xDomain([then, now]);
	rxGraph.xDomain([then, now]);

	setTimeout(function(){speedHistorySubset(hours)},300);

}
function speedHistorySubset(hours) {

	for (ip in speed_history) {

		// if ip is not a subnet
		if (!/\.0$/.test(ip)) { 
			var rx_slice = speed_history[ip].rx.slice(
				speed_history[ip].rx.length-(hours*30),
				speed_history[ip].rx.length-1
			),
			tx_slice = speed_history[ip].tx.slice(
				speed_history[ip].tx.length-(hours*30),
				speed_history[ip].tx.length-1
			),
			rx_sum = _.reduce(rx_slice, function(memo, num){ return memo + num; }, 0),
			tx_sum = _.reduce(tx_slice, function(memo, num){ return memo + num; }, 0);
			
			// Update table data object
			var perComputerDataRow = _.find(perComputerData, function(item){ return item.ip == ip; });
			perComputerDataRow.rx_total = rx_sum;
			perComputerDataRow.tx_total = tx_sum;
		}
	};
	
	d3.select("#table").datum(perComputerData).call(dataTable);

}

$(document).ready(function() {
	$('.time_toggle').click(function() {
		$('.time_toggle').removeClass('time_toggle_active')
		$(this).addClass('time_toggle_active')
		var hours = $(this).attr('data-hours');
		updateScale(hours);
	});
});