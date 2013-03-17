var preparedData;

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
        renderTable();
        $("#myTable").tablesorter({
            widthFixed: true, 
            widgets: ['zebra'], 
            headers:{
                0: {sorter: "ipAddress"}}
        })
        .tablesorterPager({container: $("#pager")});       
   

    });

}

function renderTable(){
    for (id in speed_history) {
        $('#table tbody').append(
            '<tr>'+
            '<td>'+
            id +
            '</td>'+
            '<td>'+
            'group'+
            '</td>'+
            '<td>'+
            speed_history[id].rx_total +
            '</td>'+
            '<td>'+
            speed_history[id].tx_total +
            '</td>'+
            '<td>'+
            (speed_history[id].rx_total + speed_history[id].tx_total) +
            '</td>'+
            '</tr>'
            )
    }

}

function renderGraph() {

    var maxYDownvalue = _.max(_.map(preparedData['192.168.1.0'].rx, function(pair){return pair[1]}))
    var maxYUpvalue = _.max(_.map(preparedData['192.168.1.0'].tx, function(pair){return pair[1]}))

    var seriesData = [];

    for (id in preparedData) {
        seriesData.push({
            name: 'Download Rate',
            data: preparedData[id].rx,
            type: 'areaspline',
            yAxis: 0
        })
        seriesData.push({
            name: 'Upload Rate',
            data: preparedData[id].tx,
            type: 'areaspline',
            yAxis: 1
        })
    }

    console.log(seriesData[0])
    Highcharts.setOptions({
        lang: {
            rangeSelectorZoom: "Hours"
        }
    });
    
    var chart = new Highcharts.StockChart({

        chart: {
            renderTo: 'container'
        },

        plotOptions: {
            series: {
                animation: false
            }
        },

        credits: {
            enabled: false
        },

        yAxis: [{ // Primary yAxis
                title: {
                    text: 'Download Speed',
                    style: {
                        color: '#89A54E'
                    }
                },
                labels: {
                    formatter: function() {
                        return this.value/1000000 +' kBps';
                    }
                },
                min: 0,
                max: maxYDownvalue
    
            }, { // Secondary yAxis
                gridLineWidth: 0,
                title: {
                    text: 'Upload Speed',
                    style: {
                        color: '#AA4643'
                    }
                },
                labels: {
                    formatter: function() {
                        return this.value/1000000 +' kBps';
                    }
                },
                opposite: true,
                min: 0,
                max: maxYUpvalue
        }],

        xAxis: {
            minRange: 3600000
        },
        tooltip: {
            ySuffix: " kbps",
            animation: false,
            shared: false,
            //formatter: function() {      
            //    return 'Download Speed ' + (this.y/1000000).toFixed(1) +' kBps';
            //}
        },
        
        rangeSelector: {
            selected: 2,
            inputEnabled: false,
            buttonTheme: {
                width: 45
            },
            buttons: [{
                type: 'minute',
                count: 60,
                text: '1hr'
            }, {
                type: 'minute',
                count: 120,
                text: '2hr'
            },{
                type: 'minute',
                count: 360,
                text: '6hr'
            },{
                type: 'minute',
                count: 720,
                text: '12hr'
            },{
                type: 'all',
                text: '24hr'
            }]
        },

        scrollbar : {
                enabled : false
            },

        series: seriesData.splice(0,2)
    });

    
    $button = $('#button');
    $button.click(function() {
    chart.series[0].setData(preparedData['192.168.1.212'].rx, true);
    chart.addSeries({
            name: 'test',
            data:preparedData['192.168.1.212'].rx,
            animation:false
        }, true, false)
    })

     $("#myTable").mouseover(function(e) {
        trElement = $(e.target).parent();
        selectedIP = $(trElement).find('td:first').text();
        chart.series[0].setData(preparedData[selectedIP].rx, true);

    }).mouseout(function() {
        $(this).css('background-color', 'transparent');
    });

    
}

function updateData(callback) {

    $.getScript("js/data.js", function(data, textStatus, jqxhr) {
        delete speed_history["_next"];
        preparedData = prepareDataforHighCharts(speed_history);
        console.log(preparedData)
        callback();
    });
}

function prepareDataforHighCharts(sh, time) {
    data_massaged = {}, total_minutes = 24 * 60;

    time = time || new Date();
    current_minutes = new Date(time).getMinutes();

    for (ip in sh) {
        data_massaged[ip] = {
            rx: [],
            tx: []
        }
        // rx
        var down = sh[ip].rx,
            up = sh[ip].tx
            
        
        down.forEach(function(point, index) {
            
            data_massaged[ip].rx.push([
            new Date(time).setMinutes(current_minutes - total_minutes), point])

            total_minutes = total_minutes - 2;
        })
        total_minutes = 24 * 60;

        up.forEach(function(point, index) {
            
            data_massaged[ip].tx.push([
            new Date(time).setMinutes(current_minutes - total_minutes), point])

            total_minutes = total_minutes - 2;
        })
        total_minutes = 24 * 60;
    }
    return data_massaged;
}