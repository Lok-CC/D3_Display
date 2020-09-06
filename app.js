// [ --- Scatterplot 2
var width = 500;
var height = 500;
var padding = 30;

var filteredRegionData = regionData.filter(function(d){
  return d.adultLiteracyRate !== null && d.subscribersPer100 !== null ;
  })

var yScale = d3.scaleLinear()
                .domain(d3.extent(filteredRegionData
                  , d => d.subscribersPer100))
                .range([height - padding, padding]);

var xScale = d3.scaleLinear()
                .domain(d3.extent(filteredRegionData
                  , d => d.adultLiteracyRate))
                .range([padding, width - padding]);

var xAxis = d3.axisBottom(xScale)
                .tickSize(-height + 2*padding)
                .tickSizeOuter(0)

var yAxis = d3.axisLeft(yScale)
                .tickSize(-width + 2*padding)
                .tickSizeOuter(0)

var radiusScale = d3.scaleLinear()
                      .domain(d3.extent(filteredRegionData
                        , d => d.subscribersPer100))
                      .range([2, 40])

d3.select("#svgScatterplot2")
    .append("g")
      .attr("transform", "translate(0," + (height-padding) + ")")
      .call(xAxis);

d3.select("#svgScatterplot2")
    .append("g")
      .attr("transform", "translate(" + padding + ",0)")
      .call(yAxis);

d3.select("#svgScatterplot2")
    .attr("width", width)
    .attr("height", height)
  .selectAll("circle")
  .data(filteredRegionData)
  .enter()
  .append("circle")
    .attr("cx", d=> xScale(d.adultLiteracyRate))
    .attr("cy", d=> yScale(d.subscribersPer100))
    .attr("r", 5);

d3.select("#svgScatterplot2")
    .append("text")
      .attr("x", width/2)
      .attr("y", height-padding)
      .attr("dy", "1.5em")
      .style("text-anchor", "middle")
      .text("Literacy Rate, Aged 15 and Up")

d3.select("#svgScatterplot2")
    .append("text")
      .attr("x", width/2)
      .attr("y", padding)
      .style("text-anchor", "middle")
      .style("font-size", "1.5em")
      .text("Cellular Subscriptions vs. Literacy Rate")

d3.select("#svgScatterplot2")
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height/2)
      .attr("y", padding)
      .attr("dy", "-1.2em")
      .style("text-anchor", "middle")
      .text("Cellular Subscribers per 100 People")

// Scatterplot 2 ---]

// [ --- Pie Chart
var minYear = d3.min(birthDataPieChart, d => d.year);
var maxYear = d3.max(birthDataPieChart, d => d.year);
var widthPieChart = 500;
var heightPieChart = 500;

var continents = [];

for(var i=0; i<birthDataPieChart.length; i++) {
  var continent = birthDataPieChart[i].continent;
  if(continents.indexOf(continent) === -1){
    continents.push(continent);
  }
}

var colorScale = d3.scaleOrdinal()
                      .domain(continents)
                      .range(d3.schemeCategory10)

d3.select("#svgPieChart")
    .attr("width", widthPieChart)
    .attr("height", heightPieChart)
  .append("g")
    .attr("transform", "translate(" + widthPieChart/2 + "," 
        + heightPieChart/2  + ")")
    .classed("chart", true);

d3.select("#inputPieChart")
    .property("min", minYear)
    .property("max", maxYear)
    .property("value", minYear)
    .on("input", function(){
      makeGraph(+d3.event.target.value);
    });

makeGraph(minYear);

function makeGraph(year){
  var yearData = birthDataPieChart.filter(d => d.year === year);

  var arcs = d3.pie()
                .value(d => d.births)
                .sort(function(a, b){
                  if(a.continent < b.continent) return -1;
                  else if(a.continent > b.continent) return 1;
                  else return a.births - b.births;
                })
                (yearData);

  var path = d3.arc()
                  .outerRadius(widthPieChart/2 - 10)
                  .innerRadius(widthPieChart / 4)
                  .padAngle(0.02)
                  .cornerRadius(20);

  // General update pattern
  var update = d3.select(".chart")
                  .selectAll(".arc")
                  .data(arcs);

  update
    .exit()
    .remove();

  update
    .enter()
    .append('path')
      .classed("arc", true)
    .merge(update)
      .attr("fill", d=>colorScale(d.data.continent))
      .attr("stroke", "black")
      .attr("d", path)

}
// Pie Chart ---]

// [ --- Histogram 2
var width = 800;
var height = 600;
var padding = 50;
var barPadding = 1;
var ageData = regionData.filter(d => d.medianAge !== null);
var initialBinCount = 16;

var svg = d3.select("#svgHistogram")
                .attr("width", width)
                .attr("height", height)

d3.select("#inputHistogram")
    .property("value", initialBinCount)
  .on("input", function(){
    updateRects(+d3.event.target.value); 
    
  });

svg.append("g")
      .attr("transform", "translate(0," + (height-padding) + ")")
      .classed("x-axis", true)

svg.append("g")
      .attr("transform", "translate(" + padding + ",0)")
      .classed("y-axis", true)

svg.append("text")
      .attr("x", width/2)
      .attr("y", height - 10) 
      .style("text-anchor", "middle")
      .text("Median Age");

svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height/2)
      .attr("y", 15)
      .style("text-anchor", "middle")
      .text("Frequency");

updateRects(initialBinCount);

function updateRects(val){
    var xScale = d3.scaleLinear()
                      .domain(d3.extent(ageData, d=>d.medianAge))
                      .rangeRound([padding, width - padding]);
    
    var histogram = d3.histogram()
                        .domain(xScale.domain())
                        .thresholds(xScale.ticks(val))
                        .value(d => d.medianAge);
    
    var bins = histogram(ageData);
    
    var yScale = d3.scaleLinear()
                      .domain([0, d3.max(bins, d => d.length)])
                      .range([height - padding, padding]);

    d3.select(".y-axis")
        .call(d3.axisLeft(yScale));
    
    d3.select(".x-axis")
        .call(d3.axisBottom(xScale)
                  .ticks(val))
        .selectAll("text")
          .attr("y", -3)
          .attr("x", 10)
          .attr("transform", "rotate(90)")
          .style("text-anchor", "start")
    
    var rect = svg
                  .selectAll("rect")
                  .data(bins);
    
    rect
      .exit()
      .remove()
    
    rect
      .enter()
        .append("rect")
      .merge(rect)
        .attr("x", (d, i) => xScale(d.x0))
        .attr("y", d=>yScale(d.length))
        .attr("height", d=> height - padding - yScale(d.length))
        .attr("width", d=> xScale(d.x1) - xScale(d.x0) - barPadding)
        .attr("fill", "blue")
    
      d3.select(".bin-count")
          .text("Number of bins: " + bins.length);
  }
// Histogram 2 ---]

// [ --- Scatterplot 2
// Scatterplot 2 ---]