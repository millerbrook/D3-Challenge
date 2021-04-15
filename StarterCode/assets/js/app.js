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
  var xLinearScale = d3
    .scaleLinear()
    .domain([
      d3.min(demoData, (d) => d[chosenXAxis]) * 0.8,
      d3.max(demoData, (d) => d[chosenXAxis]) * 1.2,
    ])
    .range([0, width]);

  return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(demoData, chosenYAxis) {
  // create scales
  var yLinearScale = d3
    .scaleLinear()
    .domain([
      d3.max(demoData, (d) => d[chosenYAxis]) * 1.2,
      d3.min(demoData, (d) => d[chosenYAxis]) * 0.8, //Note the min is 2nd here to account for directionality of y-axis. Correct?
    ])
    .range([0, height]); //note also the order here. Correct?

  return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition().duration(1000).call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition().duration(1000).call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(
  circlesGroup,
  newXScale,
  chosenXAxis,
  newYScale,
  chosenYAxis
) {
  circlesGroup
    .transition()
    .duration(1000)
    .attr("cx", (d) => newXScale(d[chosenXAxis]))
    .attr("cy", (d) => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(demoData, chosenXAxis, chosenYAxis, circlesGroup) {
  var xlabel;
  var ylabel;
  if (chosenXAxis === "poverty") {
    xlabel = "In poverty:";
  } else if (chosenXAxis === "age") {
    xlabel = "Age (median):";
  } else {
    xlabel = "Income (median):";
  }

  if (chosenYAxis === "healthcare") {
    ylabel = "Lacks healthcare:";
  } else if (chosenYAxis === "smokes") {
    ylabel = "Smokes (%):";
  } else {
    ylabel = "Obesity (%):";
  }
  var toolTip = d3
    .tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function (d) {
      return `${d.abbr}<br>${xlabel} ${d[chosenXAxis]}<br>
      ${ylabel} ${d[chosenYAxis]}`;
    });

  circlesGroup.call(toolTip);

  circlesGroup
    .on("mouseover", function (data) {
      toolTip.show(data, this);
    })
    // onmouseout event
    .on("mouseout", function (data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv")
  .then(function (demoData, err) {
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
    var yAxis = chartGroup.append("g").classed("y-axis", true).call(leftAxis);

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

    //Put state abbreviations on circles
    var textGroup = chartGroup
      .selectAll("text")
      .data(demoData)
      .enter()
      .append("text")
      .attr("x", (d) => xLinearScale(d[chosenXAxis]))
      .attr("y", (d) => yLinearScale(d[chosenYAxis]))
      .attr("dy", ".4em")
      .attr("dx", "-.7em")
      .style("font-size", ".75em")
      .attr("fill", "white")
      .attr("opacity", ".9")
      .text(function (d) {
        return d.abbr;
      });

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
      .classed("inactive", false)
      .text("In Poverty (%)");

    var ageLabel = xlabelsGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .classed("active", false)
      .classed("inactive", true)
      .text("Age (Median)");

    var householdIncomeLabel = xlabelsGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income") // value to grab for event listener
      .classed("active", false)
      .classed("inactive", true)
      .text("Household Income (Median)");

    // Create group for three y-axis labels
    // append y axis
    //  chartGroup.append("text")
    //  .attr("transform", "rotate(-90)")
    //  .attr("y", 0 - margin.left)
    //  .attr("x", 0 - (height/1.5))
    //  .attr("dy", "1em")
    //  .classed("axis-text", true)
    //  .text("Number of Billboard 500 Hits");
    var ylabelsGroup = chartGroup
      .append("g")
      .attr("transform", "rotate(-90)") //HELP!!! WHAT POSITIONING DOES THE GROUP NEED?
      //     .attr("y", 0 - margin.left)
      //     .attr("x", 0 - (height/1.5))
      .attr("dy", "1em")
      .classed("axis-text", true);

    var lacksHealthcareLabel = ylabelsGroup
      .append("text")
      .attr("x", 0 - height / 2) //CORRECT POSITIONING???
      .attr("y", 0 - margin.left / 2)
      .attr("value", "healthcare") // value to grab for event listener
      .classed("active", true)
      .text("Lacks Healthcare (%)");

    var smokesLabel = ylabelsGroup
      .append("text")
      .attr("x", 0 - height / 2) //CORRECT POSITIONING???
      .attr("y", 0 - margin.left / 2 - 19)
      .attr("value", "smokes") // value to grab for event listener
      .classed("inactive", true)
      .text("Smokes (%)");

    var obesityLabel = ylabelsGroup
      .append("text")
      .attr("x", 0 - height / 2) //CORRECT POSITIONING???
      .attr("y", 0 - margin.left / 2 - 38)
      .attr("value", "obesity") // value to grab for event listener
      .classed("inactive", true)
      .text("Obesity (%)");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(
      demoData,
      chosenXAxis,
      chosenYAxis,
      circlesGroup
    );

    // x axis labels event listener
    xlabelsGroup.selectAll("text").on("click", function () {
      // get value of selection
      var value = d3.select(this).attr("value");
      console.log(`Value chosen is ${value}`)
      if (value !== chosenXAxis) {
        // replaces chosenXAxis with value
        chosenXAxis = value;

        console.log(`Chosen X axis is now ${chosenXAxis}`)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(demoData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxis(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(
          circlesGroup,
          xLinearScale,
          chosenXAxis,
          yLinearScale,
          chosenYAxis
        );

        // updates tooltips with new info
        circlesGroup = updateToolTip(demoData, chosenXAxis, chosenYAxis, circlesGroup);

        if (chosenXAxis === "poverty") {
          inPovertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel.classed("active", false).classed("inactive", true);
          householdIncomeLabel.classed("active", false).classed("inactive", true);
          console.log(`chosen x is poverty`);
        } 
        else if (chosenXAxis === "age") {
          inPovertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel.classed("active", true).classed("inactive", false);
          householdIncomeLabel.classed("active", false).classed("inactive", true);
          console.log(`chosen x is age`);
        }
        else {
          inPovertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel.classed("active", false).classed("inactive", true);
          householdIncomeLabel.classed("active", true).classed("inactive", false);
          console.log(`chosen x is income`);
        }
      }
    });

    // y axis labels event listener
    ylabelsGroup.selectAll("text").on("click", function () {
      // get value of selection
      var value = d3.select(this).attr("value");
      //console.log(`Value on Y axis click: ${value}`);
      if (value !== chosenYAxis) {
        // replaces chosenYAxis with value
        chosenYAxis = value;

        console.log(chosenYAxis);

        // functions here found above csv import
        // updates y scale for new data
        yLinearScale = yScale(demoData, chosenYAxis);

        // updates y axis with transition
        yAxis = renderYAxis(yLinearScale, yAxis);

        // updates circles with new y values
        circlesGroup = renderCircles(
          circlesGroup,
          xLinearScale,
          chosenXAxis,
          yLinearScale,
          chosenYAxis
        );

        // updates tooltips with new info
        //circlesGroup = updateToolTip(demoData, chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenYAxis === "healthcare") {
          lacksHealthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel.classed("active", false).classed("inactive", true);
          obesityLabel.classed("active", false).classed("inactive", true);
          console.log(`chosen Y is healthcare`);
        } 
        else if (chosenYAxis === "smokes") {
          lacksHealthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel.classed("active", true).classed("inactive", false);
          obesityLabel.classed("active", false).classed("inactive", true);
          console.log(`chosen Y is smokes`);
        }
        else {
          lacksHealthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel.classed("active", false).classed("inactive", true);
          obesityLabel.classed("active", true).classed("inactive", false);
          console.log(`chosen Y is obese`);
        }
      }
    });
  })
  .catch(function (error) {
    console.log(error);
  });
