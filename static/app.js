// Define SVG area dimensions
var svgWidth = 700;
var svgHeight = 300;

// Define the chart's margins as an object
var margin = {
  top: 60,
  right: 60,
  bottom: 60,
  left: 60
};


// Define dimensions of the chart area
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// Select body, append SVG area to it, and set its dimes
var svg = d3.select("#chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append a group area, then set its margins
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Configure a parseTime function which will return a new Date object from a string
var parseTime = d3.timeParse("%m/%d/%Y");
//("%m/%d/%Y ")


// Load data from Articles flask app
d3.json("/data").then(function(ArticlesData) {


  // Print the ArticlesData
  console.log(ArticlesData);
  // Format the Date and cast the Articles value to a number
  ArticlesData.forEach(function(data) {
    data.Date = parseTime(data.Date);
    data.Articles = +data.Articles;
  });

  // Configure a time scale with a range between 0 and the chartWidth
  // Set the domain for the xTimeScale function
  // d3.extent returns the an array containing the min and max values for the property specified
  var xTimeScale = d3.scaleTime()
    .range([0, chartWidth])
    .domain(d3.extent(ArticlesData, data => data.Date));

  // Configure a linear scale with a range between the chartHeight and 0
  // Set the domain for the xLinearScale function
  var yLinearScale = d3.scaleLinear()
    .range([chartHeight, 0])
    .domain([0, d3.max(ArticlesData, data => data.Articles)]);

  // Create two new functions passing the scales in as arguments
  // These will be used to create the chart's axes
  var bottomAxis = d3.axisBottom(xTimeScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // Configure a drawLine function which will use our scales to plot the line's points
  var drawLine = d3
    .line()
    .x(data => xTimeScale(data.Date))
    .y(data => yLinearScale(data.Articles));

  // Append an SVG path and plot its points using the line function
  chartGroup.append("path")
    // The drawLine function returns the instructions for creating the line for ArticlesData
    .attr("d", drawLine(ArticlesData))
    .classed("line", true);

  // Append an SVG group element to the SVG area, create the left axis inside of it
  chartGroup.append("g")
    .classed("axis", true)
    .call(leftAxis);

  // Append an SVG group element to the SVG area, create the bottom axis inside of it
  // Translate the bottom axis to the bottom of the page
  chartGroup.append("g")
    .classed("axis", true)
    .attr("transform", "translate(0, " + chartHeight + ")")
    .call(bottomAxis);
    
        /**
     * Start labels
     */
    chartGroup
      .append("text")
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("x", chartWidth / 2)
      .attr("y", chartHeight + 50)
      .text("Date");

    chartGroup
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", -(chartHeight / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Number of Article Hits");

    chartGroup
      .append("text")
      .attr("x", chartWidth / 2)
      .attr("y", 0 - margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      //WRTIE THE TITLE ON THE HTML
      //.text("Article Hits in the New York times for {company} over a period of time");
    /**
     * End Labels
     */
}).catch(function(error) {
  console.log(error);
});

