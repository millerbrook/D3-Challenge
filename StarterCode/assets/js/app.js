var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100,
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

//Initial Parameters
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(demoData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(demoData, d => d[chosenXAxis]) * 0.8,
      d3.max(demoData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating y-scale var upon click on axis label
function yScale(demoData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.max(demoData, d => d[chosenYAxis]) * 1.2, 
    d3.min(demoData, d => d[chosenYAxis]) * 0.8 //Note the min is 2nd here to account for directionality of y-axis. Correct?
    ])
    .range([height, 0]); //note also the order here. Correct?

  return yLinearScale;
};

// function used for updating xAxis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxis(newYScale, yAxis) {
  var bottomAxis = d3.axisBottom(newyScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", b => newYScale(b[chosenYAxis])); //note use of 'b' here -- is 'd' a 'd3' key expression?

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  var xlabel;
  var ylabel;
  if (chosenXAxis === "poverty") {
    xlabel = "In poverty:";
  }
  else if (chosenXAxis === "age") {
    xlabel = "Age (median):";
  }
  else {
    xlabel = "Income (median):"
  }

  if (chosenYAxis === "healthcare") {
    ylabel = "Lacks healthcare:";
  }
  else if (chosenYAxis === "smokes") {
    ylabel = "Smokes (%):";
  }
  else {
    ylabel = "Obesity (%):"
  }
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.State}<br>${xlabel} ${d[chosenXAxis]}<br>
      ${ylabel} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function (demoData, err) {
  if (err) throw err;
  // parse data
  demoData.forEach(function (data) {
    data.healthcare = +data.healthcare;
    data.smokes = +data.smokes;
    data.obesity = +data.obesity;
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
  });
  // xLinearScale function above csv import
  var xLinearScale = xScale(demoData, chosenXAxis);

  // Create y scale function
  var yLinearScale = yScale(demoData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup
    .append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup
    .append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup
    .selectAll("circle")
    .data(demoData)
    .enter()
    .append("circle")
    .attr("cx", (d) => xLinearScale(d[chosenXAxis]))
    .attr("cy", (d) => yLinearScale(d[chosenYAxis]))
    .attr("r", 10)
    .attr("fill", "blue")
    .attr("opacity", ".5");

  // Create group for three x-axis labels
  var xlabelsGroup = chartGroup
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var inPovertyLabel = xlabelsGroup
    .append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = xlabelsGroup
    .append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var householdIncomeLabel = xlabelsGroup
    .append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

// Create group for three y-axis labels
var ylabelsGroup = chartGroup
    .append("g")
    .attr("transform", "rotate(-90)") //HELP!!! WHAT POSITIONING DOES THE GROUP NEED?
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height/2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    
var lacksHealthcareLabel = ylabelsGroup
    .append("text")
    .attr("x", 20) //CORRECT POSITIONING???
    .attr("y", 0)
    .attr("value", "healthcare") // value to grab for event listener
    .classed("inactive", true)
    .text("Lacks Healthcare (%)");

var smokesLabel = ylabelsGroup
    .append("text")
    .attr("x", 40) //CORRECT POSITIONING???
    .attr("y", 0)
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes (%)");

var obesityLabel = ylabelsGroup
    .append("text")
    .attr("x", 60) //CORRECT POSITIONING???
    .attr("y", 0)
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .text("obesity (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    xlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(demoData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxis(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          inPovertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          householdIncomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "age") {
          inPovertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          householdIncomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else { //defaults to householdIncomeLabel --> is that what I want?
          inPovertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          householdIncomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });

      // y axis labels event listener
      ylabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {
  
          // replaces chosenYAxis with value
          chosenYAxis = value;
  
          // console.log(chosenYAxis)
  
          // functions here found above csv import
          // updates y scale for new data
          yLinearScale = yScale(demoData, chosenYAxis);
  
          // updates y axis with transition
          yAxis = renderYAxis(yLinearScale, yAxis);
  
          // updates circles with new y values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
  
          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  
          // changes classes to change bold text
          if (chosenYAxis === "healthcare") {
            lacksHealthcareLabel
              .classed("active", true)
              .classed("inactive", false);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenYAxis === "smokes") {
            lacksHealthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", true)
              .classed("inactive", false);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else { //defaults to householdIncomeLabel --> is that what I want?
            lacksHealthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });
}).catch(function(error) {
  console.log(error);
});
