$(document).ready(function() {
    updateAndRenderGraph() // only here to call fake data, remove when online
});
/*
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
*/

function updateAndRenderGraph() {
    updateData(function() {
        renderGraph();
    });
}

function renderGraph() {
    var chart = new Highcharts.StockChart({

        chart: {
            renderTo: 'container'
        },

        rangeSelector: {
            selected: 1
        },

        series: [{
            name: 'USD to EUR',
            data: speed_history_fake
        }]
    });

    $('#button').click(function() {
        var series = chart.series[0];
        if (series.visible) {
            series.hide();
        } else {
            series.show();
        }
    });
}

function updateData(callback) {

    $.getScript("js/highstock_data.js", function(data, textStatus, jqxhr) {
        //delete speed_history["_next"];
        //var preparedData = prepareDataforHighCharts(speed_history);
        callback();
    });
}

function prepareDataforHighCharts(sh, time) {
    data_massaged = {}, total_minutes = 24 * 60;

    time = time || new Date();

    for (ip in sh) {
        data_massaged[ip] = {
            rx: [],
            tx: []
        }
        // rx
        var down = sh[ip].rx,
            up = sh[ip].tx;

        down.forEach(function(point, index) {
            var current_minutes = new Date(time).getMinutes();

            data_massaged[ip].rx.push([
            new Date(time).setMinutes(current_minutes - total_minutes), point])

            total_minutes = total_minutes - 2
        })

        // tx
    }
}