var txGraph;
var rxGraph;
var rx_slice;
var dataTable;
var maxGraphTime;
var tableMap = {};



$(document).ready(function() {
  $('.time_toggle').click(function() {
    $('.time_toggle').removeClass('time_toggle_active')
    $(this).addClass('time_toggle_active')
    var hours = $(this).attr('data-hours');
    updateScale(hours);
  });

$.when(load_groups()).then(function(){
    $.when(load_devices()).then(function() {
      var devices_with_names = unassigned.concat(_.flatten(_.map(groups, function(g){ return g.devices; })));
      $.each(devices_with_names, function(k, device) {
          tableMap[device.ip] = {
            device_name : device_names[device.mac] ? device_names[device.mac] : device.name,
            group_name : 'Unassigned'
          };
          $.each(groups, function(i, g) { //Assinging Device Group to table
            var match = _.find(g.devices, function(d){
              return d.ip === device.ip;
            });
            if (match) {
              tableMap[device.ip].group_name = g.name;
              return false;
            }
        });
      });    
    updateAndRenderGraph();
    });
  });
setInterval(updateAndRenderGraph, 120000);
});


function updateAndRenderGraph(){
      updateData(function(){ 
        renderGraph(); 
  });
}

function updateScale(hours) {
	now = maxGraphTime;

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
			rx_slice = speed_history[ip].rx.slice(
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

function renderGraph(){
   // Need to transform data from:
   // { "192.168.1.1": { rx : [0,0,01,2,4,5], ...}
   // }
   //  into:
   // {
   //   name : "192.168.1.1 RX",
   //   color : "blue",
   //   rxData: [ { x: ADate, y: 123
   //    }
   //   txData: [ { x: ADate, y: 123
   //    }
   //    ...
   //   ]
   
   //var colors = d3.scale.category10();
   
   var colors = [ '#3366cc', '#dc3912', '#ff9900', '#109618', '#990099', '#0099c6', '#dd4477']

function newColors(i) {
  if (i==0){
    return colors[0]
  }
  else{
    return colors[3];
  }
}

   var data = _.flatten(d3.entries(speed_history).map(function(series, i) {
   
     if (series.value.rx) { 
       var numRxPoints = series.value.rx.length;
       var now = new Date()
       var rxScale = d3.time.scale().domain([new Date(now.getTime() - 24*60*60*1000), now]).range([0, numRxPoints]);
       var rxTransformed =  series.value.rx.map(function(spotValue, i) {
         return { x: rxScale.invert(i),
            y: spotValue
          }
       });

       var txTransformed =  series.value.tx.map(function(spotValue, i) {
         return { x: rxScale.invert(i),
            y: spotValue
          }
       });
       
       return [{
         ip: series.key,
         //name: series.key,
         name: tableMap[series.key] ? tableMap[series.key].device_name : series.key,
         group: tableMap[series.key] ? tableMap[series.key].group_name : 'Unassigned',
         color: newColors(i),
         areaColor: newColors(i),
         rxData: rxTransformed,
         txData: txTransformed,
         rx_avg: series.value.rx_avg,
         rx_max: series.value.rx_max,
         rx_total: series.value.rx_total,
         tx_avg: series.value.tx_avg,
         tx_max: series.value.tx_max,
         tx_total: series.value.tx_total
       }];
     }
     else {
       return [];
     }
   }));
   
   // Anything ending in a .0 is a subnet total.
   totalsData = _.filter(data, isSubnet)
   perComputerData = _.filter(data, function(d) { return !isSubnet(d); })
     
   rxGraph = new usageGraph("rx")
     .plotDataFunction(function(d) { return d.rxData; })
     .height(350)
     .width(900)
     .showArea(true)
     .yLabelFunction(formatSpeed)
     //.plotInterestingPointFunction(function(d) { return d.rxData; });
     .plotInterestingPointFunction(function(d) { return []; });
   
   var rxIsActive = true,
    txIsActive = false;
   if (rxIsActive) {
     d3.select("#rxGraph").datum(totalsData).call(rxGraph);
   } else {
     d3.select("#rxGraph").datum([]).call(rxGraph);
   }
   

   txGraph = new usageGraph("tx")
     .plotDataFunction(function(d) { return d.txData; })
     .height(350)
     .width(900)
     .showArea(true)
     .yLabelFunction(formatSpeed)
     //.plotInterestingPointFunction(function(d) { return d.rxData; });
     .plotInterestingPointFunction(function(d) { return []; });

    if (txIsActive) {
         d3.select("#txGraph").datum(totalsData).call(txGraph);
    } else {
      d3.select("#txGraph").datum([]).call(txGraph);
    }

   var highlightOverFunction = function(d) {
    setTimeout(function() {
      var dataToPlot = data.filter(function(dataSet) { return d.name == dataSet.name; });
      dataToPlot = totalsData.concat(dataToPlot);
      d3.select("#rxGraph").datum(dataToPlot).call(rxGraph.quickRedraw);
      d3.select("#txGraph").datum(dataToPlot).call(txGraph.quickRedraw);
    }, 0);  
   }

   var highlightOutFunction = function(d) {
    setTimeout(function() {
      // reset to just plot the single one
      d3.select("#rxGraph").datum(totalsData).call(rxGraph);
      d3.select("#txGraph").datum(totalsData).call(txGraph);
    }, 0);
    
   }

   dataTable = new usageTable("usage")
    // .dataKeyFunc(function(d) { return d.ip; })
     .rowOnMouseOver(highlightOverFunction);
    //   .rowOnMouseOut(highlightOutFunction);
  
  perComputerData = _.sortBy(perComputerData, function(d) { return -1 * + d.rx_total; }) 

  d3.select("#table").datum(perComputerData).call(dataTable);

 }

 function isSubnet(d) {
    reg = /\.0$/;
    return reg.test(d.name);
   }

   // Default function, puts out raw.
  function rawFormat(d) { 
    return d; 
  }
  function formatSpeed(speed) {
    var suffix = ["bps", "kbps", "mbps", "tbps"];

    return reduceToPower(speed, suffix);
  }

  function formatSize(size) {
    var suffix = ["B", "KB", "MB", "GB", "TB"];
    return reduceToPower(size, suffix);
  }

  function reduceToPower(number, suffixes) {
    var power = 0;
    number = number / 1000000;
    //while (number >= 1000) {
    //  number = number / 1000;
    //  power++;
    //}

    return Math.round(number) + " MB";
  }

  function updateData(callback){
      maxGraphTime = new Date;

      $.getScript("update.cgi?exec=ipt_bandwidth&arg0=speed&_http_id="+tomato_env.vars['http_id'], function(data, textStatus, jqxhr) {
      delete speed_history["_next"];
      callback();
    });
  }
