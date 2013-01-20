function usageTable(uniqueId) {
  /*
   * Initialization variables, cannot be changed.
   */
  function uniqueElementId(name) { return uniqueId + name; };
  function uniqueElementIdSelector(name) { return "#" + uniqueId + name; };
  
  // Shortcuts for convenience
  var u = uniqueElementId;
  var uS = uniqueElementIdSelector;

  var columnHeaders = [["name", "Device Name", rawFormat], ["group", "Group", rawFormat], ["rx_total", "Download Total", formatSize],  ["tx_total", "Upload Total", formatSize], ["total_total", "Device Total", formatSize]];
  var rowOnMouseOver = function(d) { };
  var rowOnMouseOut = function(d) { };

  var dataKeyFunc = function(d, i) { return i; }



  function chart(selection) {
    selection.each(function(data) {

      // We don't actually want to bind to data here, but we
      // do want to see if it hasn't been created. Use a
      // dummy array to bind to.
      var table = d3.select(this).selectAll("table").data([,]);

      table.enter().append("table").classed("table table-striped table-bordered table-hover", true);

      var headerRow = table.selectAll("thead").data([,]);
      headerRow.enter().append("thead")
        .append("tr");

      var columnHeader = headerRow.selectAll("th.header")
          .data(columnHeaders)
            .enter()
              .append("th")
                .classed("header", true)
                .text(function(conf) { return conf[1]});

      var tableBody = table.selectAll("tbody").data([,])
      tableBody.enter().append("tbody");

      var redraw = function() {
        tableBody.selectAll("td").text(function(t) { return t;})
      }

      columnHeader.append("i").classed("icon-arrow-up icon-chevron-up sortArrow", true).on("click", function(conf) {
         data = _.sortBy(data, function(d) { return d[conf[0]]; });

         headerRow.selectAll(".sortArrow").classed("icon-white", false);
         d3.select(this).classed("icon-white", true);

         var tableRow = tableBody.selectAll("tr.dataRow")
          .data(data, dataKeyFunc);

         tableRow.selectAll("td")
          .data(function(d) { return columnHeaders.map(function(c) { return c[2](d[c[0]]); });})
         redraw();

      })

      columnHeader.append("i").classed("icon-arrow-down sortArrow", true).on("click", function(conf) {
         data = _.sortBy(data, function(d) { return d[conf[0]]; });
         data = data.reverse();

         headerRow.selectAll(".sortArrow").classed("icon-white", false);
         d3.select(this).classed("icon-white", true);

         var tableRow = tableBody.selectAll("tr.dataRow")
          .data(data, dataKeyFunc);

         tableRow.selectAll("td")
          .data(function(d) { return columnHeaders.map(function(c) { return c[2](d[c[0]]); });})
         redraw();

      })
      


      var tableRow = tableBody.selectAll("tr.dataRow")
        .data(data, dataKeyFunc);
          


      tableRow.enter().append("tr")
        .classed("dataRow", true)
        .on("mouseover.custom", rowOnMouseOver)
        .on("mouseout.custom", rowOnMouseOut);

      tableRow.selectAll("td")
        .data(function(d) { return columnHeaders.map(function(c) { return c[2](d[c[0]]); });})
          .enter()
            .append("td")
              .text(function(t) { return t;});

      redraw();
    });
  }
  
  
  /**
   * Should be supplied with an array of arrays of size 2, corresponding to the display name and lookup key. E.g. [ ["ip", "IP Address"] ]
   */
  chart.columnHeaders = function(value) {
    if (!arguments.length) return columnHeaders;
    columnHeaders = value;
    return chart;
  }

  chart.rowOnMouseOver = function(value) {
    if (!arguments.length) return rowOnMouseOver;
    rowOnMouseOver = value;
    return chart;
  }

  chart.rowOnMouseOut = function(value) {
    if (!arguments.length) return rowOnMouseOut;
    rowOnMouseOut = value;
    return chart;
  }

  chart.dataKeyFunc = function(value) {
    if (!arguments.length) return dataKeyFunc;
    dataKeyFunc = value;
    return chart;
  }
  
  return chart;
}

