function usageGraph(uniqueId) {
  /*
   * Initialization variables, cannot be changed.
   */
  function uniqueElementId(name) { return uniqueId + name; };
  function uniqueElementIdSelector(name) { return "#" + uniqueId + name; };
  
  // Shortcuts for convenience
  var u = uniqueElementId;
  var uS = uniqueElementIdSelector;
    
  /*
   * Configurable - changed by parameter.
   */
  var height = 500,
      width = 960,
      xValue = function(d) { return d.x; },
      yValue = function(d) { return d.y; },
      margin = {top: 10, right: 10, bottom: 20, left: 70},
      dataKeyFunction = function(d) { return d.name; },
      dataPointKeyFunction  = function(d) { return d.x; },
      plotDataFunction = function(d) { return d.data; },
      plotColorFunction = function(d) { return d.color; },
      plotInterestingPointFunction = function(d) { return d.data; },
      eventHandling = function(d) { /* Do nothing */ },
      onlyShowPointsOnMouseOver = false,
      showArea = false,
      transitionSpeed = 500;
    
  var plotWidth = function() { return width - margin.left - margin.right; };      
  var plotHeight = function() { return (height - margin.top - margin.bottom); };   
     
     
  var xScale = d3.time.scale().range([0, plotWidth()]),
      yScale = d3.scale.linear().range([plotHeight(), 0]);
      
  var xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickSize(-1 * plotHeight()),
      yAxis = d3.svg.axis().scale(yScale).orient("left").tickSize(-1 * plotWidth());
      
  var lineGen = d3.svg.line()
    .interpolate("monotone")
    .x(function(d) { return xScale(xValue(d)); })
    .y(function(d) { return yScale(yValue(d)); });

  var areaGen = d3.svg.area()
    .interpolate("monotone")
    .x(function(d) { return xScale(xValue(d)); })
    .y0(height)
    .y1(function(d) { return yScale(yValue(d)); });

  function updateXDomain(domain) {
    xScale.domain(domain);
    redrawGraph(graph, 500);
  }
    
  // Internal variables to save
  var svg = null;
  var graph = null;
     
  function chart(selection) {
    selection.each(function(data) {
      // We don't actually want to bind to data here, but we
      // do want to see if it hasn't been created. Use a
      // dummy array to bind to.
      svg = d3.select(this).selectAll("svg").data([,]);
      
      svg.enter()
          .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("defs").append("clipPath")
              .attr("id", u("clip"))
                .append("rect");
        
      // Update or write the clip dimensions        
      svg.selectAll(uS("clip")).selectAll("rect")
        .attr("width", plotWidth)
        .attr("height", plotHeight);

      graph  = svg.selectAll(uS("graph")).data([,]);
      
      var graphEnter = graph.enter()
          .append("g")
            .attr("id", u("graph"));
      
      
      graphEnter.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + plotHeight() + ")")
        .call(xAxis)
        .selectAll(".tick").style("opacity", 0.2);

      graphEnter.append("g")
       .attr("class", "y axis")
       .call(yAxis)
       .selectAll(".tick").style("opacity", 0.2);
      
      // Do this for existing elems as well as the margin may have changed.
      svg.selectAll(uS("graph")).attr("transform", "translate(" + margin.left + "," + margin.top + ")");      

      drawLine(graph, data);      
      recalculateAxes(data);
      redrawGraph(graph, transitionSpeed);

    });
  }
  
  function drawLine(graph, activeDataSeries) {
    var plotGroup = graph.selectAll("g.plotGroup").data(activeDataSeries, dataKeyFunction);
 
    var plotGroupEnter = plotGroup.enter().append("g")
      .classed("plotGroup", true);

    plotGroupEnter
          .append("path")
            .attr("class", "plot")
            .attr("clip-path", "url(" + uS("clip") + ")")
            .style("opacity", 1) // To be transitioned in
            .attr("stroke", plotColorFunction)
            .attr("d", function(d) { return lineGen(plotDataFunction(d)); });
            
    if (showArea) {
      
      var area = graph.selectAll("path.area").data(plotDataFunction(d));      
      var areaEnter = area.enter()
        .append("path")
        .classed("area", true)
        .attr("clip-path", "url(" + uS("clip") + ")")
        .style("opacity", 1) // To be transitioned in
        .style("background-color", "black")
        .attr("d", function(d) { return fillArea(d); });
    }
            
    var interestingPoints = plotGroup.selectAll("circle.highlight")
      .data(plotInterestingPointFunction, dataPointKeyFunction);
      
     interestingPoints.enter()
          .append("circle")
            .attr("r", 4)
            .attr("class", "highlight")
            .attr("clip-path", "url(" + uS("clip") + ")")
            .style("opacity", 0) // To be transitioned in
            .attr("cx", function(d) { return xScale(xValue(d)); })
            .attr("cy", function(d) { return yScale(yValue(d)); })
            .on("mouseover.showPoint", function(d) { d3.select(this).style("opacity", 1) })
            .on("mouseout.showPoint", function(d) { d3.select(this).style("opacity", 
                                         onlyShowPointsOnMouseOver ? 0 : 1) })
            .each(eventHandling);
            
    interestingPoints.exit().remove();

    plotGroup.exit().remove();  
  }
  
  /*
   * Calculate the new axes with the new data.
   */
   function recalculateAxes(activeDataSeries) {
     if (activeDataSeries.length == 0) {
       var xExtent = [new Date(), new Date()];
     } else {
       var xExtent = d3.extent(_.flatten(activeDataSeries.map(function(d) { return d3.extent(plotDataFunction(d), xValue); })));
     }
     
     var yMax  = d3.max(_.flatten(activeDataSeries.map(function(d) { return d3.max(plotDataFunction(d), yValue); })));
                    
     if (!yMax) { yMax = 0; }


     xScale.domain(xExtent);
     xScale.range([0, plotWidth()]);
     yScale.domain([0, 1.1 * yMax]); // Give 10% so we don't have the highest point cut off
     yScale.range([plotHeight(), 0]);
  }
  
  // Redraw the current focus window
  function redrawGraph(graph, duration) {
    var selection = duration ? graph.transition().duration(duration) : graph;
    selection.selectAll("path.area")
      .style("opacity", 1)
      .attr("d", areaGen);
    selection.selectAll("path.plot")
      .style("opacity", 1)  
      .attr("d", function(d) { return lineGen(plotDataFunction(d)); }); 
    selection.selectAll("circle.highlight")
      .style("opacity", onlyShowPointsOnMouseOver ? 0 : 1)
      .attr("cx", function(d) { return xScale(xValue(d)); })
      .attr("cy", function(d) { return yScale(yValue(d)); });
    selection.select(".x.axis").call(xAxis).selectAll(".tick").style("opacity", 0.2);
    selection.select(".y.axis").call(yAxis).selectAll(".tick").style("opacity", 0.2);
    
    if (showArea) {        
      d3.selectAll("path.area")
        .style("opacity", 1) // To be transitioned in
        .attr("d", function(d) { debugger; return fillArea(d); });
    }
  }
  
  chart.width = function(value) {
    if (!arguments.length) return width;
    width = value;
    return chart;
  };

  chart.height = function(value) {
    if (!arguments.length) return height;
    height = value;
    return chart;
  };
  
  chart.focusSize = function(value) {
    if (!arguments.length) return focusSize;
    focusSize = value;
    return chart;
  };
  
  chart.margin = function(value) {
    if (!arguments.length) return margin;
    margin = value;
    return chart;
  };
  
  chart.xValue = function(value) {
    if (!arguments.length) return xValue;
    xValue = value;
    return chart;
  };
  
  chart.yValue = function(value) {
    if (!arguments.length) return yValue;
    yValue = value;
    return chart;
  };
  
  chart.dataKeyFunction = function(value) {
    if (!arguments.length) return dataKeyFunction;
    dataKeyFunction = value;
    return chart;
  };
  
  /**
   * This function should return the actual plot data from the object. E.g. if you have
   * { name: "Test Series", data: [(1,1), (2,3), (3,3)] } you should return the data
   * object.
   * Performance note: as it stands, this function is called for every step of the line, so make
   * sure it's efficient, or refactor this code.
   */
  chart.plotDataFunction = function(value) {
    if (!arguments.length) return plotDataFunction;
    plotDataFunction = value;
    return chart;
  };
  
  /**
   * The function which tells the chart what color to display for this data series
   */
  chart.plotColorFunction = function(value) {
    if (!arguments.length) return plotColorFunction;
    plotColorFunction = value;
    return chart;
  };
  
  /**
   * Get the list of points that should be highlighted by circles and have mouse-over.
   * Note that this should only be a single deep array as each element gets its own
   * circle.
   */
  chart.plotInterestingPointFunction = function(value) {
    if (!arguments.length) return plotInterestingPointFunction;
    plotInterestingPointFunction = value;
    return chart;
  };
  
  
  /**
   * How fast to transition in new elements. 0 or null = instantaneous.
   */
  chart.transitionSpeed = function(value) {
    if (!arguments.length) return transitionSpeed;
    transitionSpeed = value;
    return chart;
  };
  
  /**
   * How fast to transition in new elements. 0 or null = instantaneous.
   */
  chart.onlyShowPointsOnMouseOver = function(value) {
    if (!arguments.length) return onlyShowPointsOnMouseOver;
    onlyShowPointsOnMouseOver = value;
    return chart;
  };
  
  /**
   * Show area between all points - max and min if multiple lines
   */
  chart.showArea = function(value) {
    if (!arguments.length) return showArea;
    showArea = value;
    return chart;
  };

  /**
   * The tick format for the y Label
   */
  chart.yLabelFunction = function(value) {
    yAxis.tickFormat(value)
    return chart;
  };

  /*
   * The x domain. Use this for zooming in/out from external tools.
   */
  chart.xDomain = function(value) {
    if (!arguments.length) return xScale.domain();

    updateXDomain(value);
    return chart;
  }
  
  return chart;
}

