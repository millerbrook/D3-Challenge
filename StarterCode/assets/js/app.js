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
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

//Initial Parameters




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
  var yLinearScale = d3
    .scaleLinear()
    .domain([0, d3.max(demoData, chosenYAxis)])
    .range([height, 0]);

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
  chartGroup.append("g").call(leftAxis);

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
    .attr("value", "in_poverty") // value to grab for event listener
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
    .attr("value", "household_income") // value to grab for event listener
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
    .attr("value", "lacks_healthcare") // value to grab for event listener
    .classed("inactive", true)
    .text("Lacks Healthcare (%)");

var smokesLabel = ylabelsGroup
    .append("text")
    .attr("x", 40) //CORRECT POSITIONING???
    .attr("y", 0)
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes (%)");

var obeseLabel = ylabelsGroup
    .append("text")
    .attr("x", 60) //CORRECT POSITIONING???
    .attr("y", 0)
    .attr("value", "obese") // value to grab for event listener
    .classed("inactive", true)
    .text("Obese (%)");

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
        if (chosenXAxis === "in_poverty") {
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
          if (chosenXAxis === "in_poverty") {
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
}).catch(function(error) {
  console.log(error);
});
