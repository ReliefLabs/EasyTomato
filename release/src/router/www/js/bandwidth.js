var preparedData;
var tableMap = {};

$(document).ready(function() {
//    updateAndRenderGraph() // only here to call fake data, remove when online
//});

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



function updateAndRenderGraph() {

    updateData(function() {

        var subnet_ip;
        for (ip in preparedData) {
            if (isSubnet(ip)) {
                subnet_ip = ip;
            }
        }
        renderGraph(subnet_ip);
        renderTable();
        // add parser for MB data
        $.tablesorter.addParser({
            id: 'bandwidth',
            is: function(s) {
                // return false so this parser is not auto detected 
                return false;
            },
            format: function(s) {
                // format your data for normalization 
                return parseFloat(s);
            },
            // set type, either numeric or text 
            type: 'numeric'
        });
       
        $("#myTable").tablesorter({
            theme : 'blue',
            headerTemplate : '{content} {icon}',
            widthFixed: true, 
            widgets: ['zebra', 'staticRow'], 
            headers:{
                0: {sorter: "ipAddress"},
                2: {sorter: "bandwidth"},
                3: {sorter: "bandwidth"},
                4: {sorter: "bandwidth"}
            },
            sortList: [[4,1]]
        })
        .tablesorterPager({
            container: $("#pager"),
            output: '{startRow} - {endRow} / {filteredRows} ({totalRows})'
        });       

        // Default 6 hours
    
        var nrDataPoints = preparedData[subnet_ip].rx.length; // 24 hours
        var maxTimeLast6Hours = preparedData[subnet_ip].rx[nrDataPoints-1][0];
        // Last 6 hours is the last fourth of the total
        var offset = (nrDataPoints / 4) * 3;
        var minTimeLast6Hours = preparedData[subnet_ip].rx[offset-1][0];
        
        updateTable(minTimeLast6Hours, maxTimeLast6Hours);
   

    });

}

function renderTable(){
    for (id in speed_history) {
        var trclass = '';
        if (isSubnet(id)) {
            trclass = 'static'
        }
        $('#table tbody').empty().append(
            '<tr class="'+trclass+'" data-ip='+id+'>'+
            '<td>'+
            (isSubnet(id) ? 'Network Total' : tableMap[id].device_name) +
            '</td>'+
            '<td>'+
            (isSubnet(id) ? '-' : tableMap[id].group_name) +
            '</td>'+
            '<td>'+
            formatBandwidthNumber(speed_history[id].rx_total) +
            '</td>'+
            '<td>'+
            formatBandwidthNumber(speed_history[id].tx_total) +
            '</td>'+
            '<td>'+
            formatBandwidthNumber(speed_history[id].rx_total + speed_history[id].tx_total) +
            '</td>'+
            '</tr>'
            )
    }

}
function updateTable(min, max) {
   var rows = $('#table tbody tr');
    $.each(rows, function(index, r) {
        var ip = $(r).attr('data-ip');
        // Download total
        var dt = _.reduce(
            preparedData[ip].rx.filter(function(el) {
                return el[0] >= min && el[0] <= max;
            })
            ,
            function(memo, num) {return memo + num[1];}, 0);
        var ut = _.reduce(
            preparedData[ip].tx.filter(function(el) {
                return el[0] >= min && el[0] <= max;
            })
            ,
            function(memo, num) {return memo + num[1];}, 0);
        
        $(r).find('td:nth-child(3)').text(formatBandwidthNumber(dt));
        // Upload total
        $(r).find('td:nth-child(4)').text(formatBandwidthNumber(ut));
        // Device Total
        $(r).find('td:nth-child(5)').text(formatBandwidthNumber(dt+ut));

    });
    //$("table.tablesorter").trigger("update");
}


function renderGraph(subnet_ip) {

    var maxYDownvalue = _.max(_.map(preparedData[subnet_ip].rx, function(pair){return pair[1]}))
    var maxYUpvalue = _.max(_.map(preparedData[subnet_ip].tx, function(pair){return pair[1]}))
    
    var seriesData = [];

    var download_color = '#2c99ce',
        upload_color = '#2cb78a',
        download_color_device = '#0c7fb5',
        upload_color_device = '#0a9a5b';
    seriesData.push({
            name: 'Download Rate',
            data: preparedData[subnet_ip].rx,
            type: 'areaspline',
            yAxis: 0,
            id: 'download',
            color: download_color
    })
    seriesData.push({
            name: 'Upload Rate',
            data: preparedData[subnet_ip].tx,
            type: 'areaspline',
            yAxis: 1,
            id : 'upload',
            color: upload_color
    })

    Highcharts.setOptions({
        global: {
            useUTC: false
        },
        lang: {
            rangeSelectorZoom: "Hours"
        }
    });
    /********************
    * Chart
    *********************/
    var chart = new Highcharts.StockChart({

        chart: {
            backgroundColor: 'transparent',
            plotBackgroundColor: 'white',
            renderTo: 'chart_container',
            alignTicks: false
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
                        //color: '#89A54E'
                        color: download_color
                    }
                },
                labels: {
                    formatter: function() {
                        return this.value/1000000 +' kBps';
                    }
                },
                min: 0,
                max: maxYDownvalue,
                height: 115,
                lineWidth: 2
    
            }, { // Secondary yAxis
                //gridLineWidth: 0,
                title: {
                    text: 'Upload Speed',
                    style: {
                        color: upload_color
                    }
                },
                labels: {
                    formatter: function() {
                        return this.value/1000000 +' kBps';
                    }
                },
                min: 0,
                max: maxYUpvalue,
                top: 170,
                height: 115,
                offset: 0,
                lineWidth: 2
        }
        ],

        xAxis: {
            minRange: 3600000,
             events: {
                setExtremes: function(event) {
                    updateTable(event.min, event.max);
                }
            }
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

        series: seriesData,
       
    });

    
    $button = $('#button');
    $button.click(function() {
        var download = chart.get('download')
        if (download) {
            download.remove();
        }
        /*
        chart.series[0].setData(preparedData['192.168.1.212'].rx, true);
        chart.addSeries({
                name: 'test',
                data: preparedData['192.168.1.212'].rx,
                animation:false
            }, true, false)
*/
    })
    $("#myTable").click(function(e) {
        var element = $(e.target),
        selectedIP = element.parent().attr('data-ip');
        $("#table tr").removeClass('selected');
        element.parent().addClass('selected');
        
        while(chart.series.length > 3)
            chart.series[chart.series.length-1].remove();

        chart.addSeries({
            name: 'Download',
            data: preparedData[selectedIP].rx,
            animation: true,
            id: selectedIP+'d',
            type: 'areaspline',
            color: download_color_device
        }, true, false);

        chart.addSeries({
            name: 'Upload',
            data: preparedData[selectedIP].tx,
            animation: true,
            id: selectedIP+'u',
            yAxis: 1,
            type: 'areaspline',
            color: upload_color_device
        }, true, false)
        
    })
    /*
     $("#myTable").mouseover(function(e) {
        console.log("mouseover")
        var element = $(e.target),
        selectedIP = element.parent().attr('data-ip');
        console.log(selectedIP+'d')
        chart.addSeries({
            name: 'test',
            data: preparedData[selectedIP].rx,
            animation: false,
            id: selectedIP+'d'
        }, true, false)
        chart.addSeries({
            name: 'test',
            data: preparedData[selectedIP].tx,
            animation: false,
            id: selectedIP+'u',
            yAxis: 1
        }, true, false)

    }).mouseout(function(e) {
    console.log("mouseout")
        var element = $(e.target),
            selectedIP = element.parent().attr('data-ip');
        var down =  chart.get('selectedIP'+'d'),
            up = chart.get('selectedIP'+'u');
        if (down) {
            console.log('down')
            down.remove();
        }
        if (up) {
            console.log('up')
            up.remove();
        }

        for (var i=0; i<chart.series.length;i++) {
            console.log(chart.series[i])
        }
        
        $(this).css('background-color', 'transparent');

    });
*/
    
}

function updateData(callback) {
    $.getScript("update.cgi?exec=ipt_bandwidth&arg0=speed&_http_id="+tomato_env.vars['http_id'], function(data, textStatus, jqxhr) {
    //$.getScript("js/data.js", function(data, textStatus, jqxhr) { ////FAKE DATA LINK
        delete speed_history["_next"];
        preparedData = prepareDataforHighCharts(speed_history, tomato_env.vars['time']);
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
function formatBandwidthNumber(number) {
    number = number / 1000000;

    return Math.round(number*10)/10 + " MB";
}
function isSubnet(ip) {
    reg = /\.0$/;
    return reg.test(ip);
}