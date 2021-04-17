
function displayDiam(val) {
  var channel = [0.498, 0.62, 0.796, 0.962, 1.191, 1.478, 1.909, 2.322, 2.756, 3.398, 4.221, 5.246, 6.491, 8.116]
  document.getElementById('da').value = channel[val - 1].toFixed(2);
}


// set the dimensions and margins of the graph
var $container = $('#my-dataviz'),
    widthA = 0.95 * Math.min($container.width(), 870),
    heightA = $container.height()

var margin = {
    top: 38,
    right: 60,
    bottom: 45,
    left: 70
  },
  width = widthA - margin.left - margin.right,
  height = 448 - margin.top - margin.bottom;

// For tooltips.
var divToolTip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// For formating parts of tooltip text.
var divToolTipS1 = divToolTip.append("span").attr("class", "tooltip-s1");  // name
var divToolTipS2 = divToolTip.append("span").attr("class", "tooltip-s2");  // treatment
var divToolTipS3 = divToolTip.append("span").attr("class", "tooltip-s3");  // code

// for legend
var marginLegend = {
  top: 0,
  right: 50,
  bottom: 0,
  left: 60
}
var svgLegend = d3.select("#my-legend")
  .append("svg")
  .attr("width", width + marginLegend.left + marginLegend.right)
  .attr("height", 125)
  .append("g");

// append the svg object to the body of the page
var svg = d3.select("#my-dataviz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.csv("https://raw.githubusercontent.com/tsipkens/fmviz/main/data/fm.csv", function(data) {
  d3.csv("https://raw.githubusercontent.com/tsipkens/fmviz/main/data/quality.csv", function(data2) {



    //------------------------------------------------------------------------//
    // GENERATE THE FIRST MAJOR PLOT

    // Add X axis
    var x = d3.scaleLinear()
      .domain([0, 85])
      .range([0, width]);
    var xAxis = svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .attr("class", "axis")
      .call(d3.axisBottom(x));

    var x2 = d3.scaleLinear()
      .domain([0, 85 * 0.1019716])  // converts to mm H20
      .range([0, width]);
    var xAxis2 = svg.append("g")
      .attr("class", "axis")
      .call(d3.axisTop(x2));

    // Add Y axis
    var y = d3.scaleLinear()
      .domain([-0.05, 1.05])
      .range([height, 0]);
    var yrv = d3.scaleLinear()
      .domain([1.05, -0.05])
      .range([height, 0]); // reverse axis for penetration
    svg.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y)
        .tickFormat(d3.format(".0%")));
    svg.append("g")
      .attr("transform", "translate(" + width + ",0)")
      .attr("class", "axis")
      .call(d3.axisRight(yrv)
      .tickFormat(d3.format(".0%")))

    //-- Add axis labels --//
    // Add X axis label:
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr('x', width / 2)
      .attr('y', height + 35)
      .text("Pressure drop, Δp [Pa]");
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr('x', width / 2)
      .attr('y', -25)
      .text("Pressure drop, Δp [mm H₂O]");

    // Y axis label:
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr('transform', 'translate(-42,' + height / 2 + ')rotate(270)')
      .text("Filtration efficiency")
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr('transform', 'translate(' + (width + 42) + ',' + height / 2 + ')rotate(90)')
      .text("Penetration")


      // Check if internet explorer.
      var isIE = false;
      var ua = window.navigator.userAgent;
      var oldIE = ua.indexOf('MSIE ');
      var newIE = ua.indexOf('Trident/');
      if ((oldIE > -1) || (newIE > -1)) {
          isIE = true;
      }

      // Color scale
      var getCSSVar = function (varname) {
        if (isIE) { // internet explorer styling (no support for CSS vars.)
          lc = varname.slice(varname.length - 1);
          if (lc == ")") {
            colorcode = "#444";
          } else {
            colorcode =  ("#FF" + Math.round(1.8*lc).toString(16) + "F" + (8-lc).toString(16) + "F")
          }
        } else {
          colorcode = getComputedStyle(document.documentElement).getPropertyValue(varname)
        }
        return colorcode;
      }
    var colorkeys = [getCSSVar('--c7'), getCSSVar('--c6'), getCSSVar('--c5'), getCSSVar('--c2'), "url(#diagonal-stripe-2)", "url(#diagonal-stripe-1)"],
      keyCodes = ["W", "K", "CP", "nW", "nWH", "ML"],
      keys = ["Woven mat. (W)", "Knit (K)", "Cut pile (CP)", "Non-woven (nW)", "Non-woven, Halyard", "Multi-layer (ML)"];
    var color = d3.scaleOrdinal()
      .domain(keys)
      .range(colorkeys)

    // Add the isolines of quality
    var qualvec = [0.5, 2, 5, 10, 20, 50, 100, 200, 500]
    qualvec.forEach(function(qualno, idx) {
      svg.append("path")
        .datum(data2)
        .attr("fill", "none")
        .attr("stroke", "#BFBFBF")
        .attr("stroke-width", 0.5)
        .attr('stroke-dasharray', (4, 2))
        .attr("class", 'Qual' + qualno)
        .attr("d", d3.line()
          .x(function(d) {
            return x(d.Pressure)
          })
          .y(function(d) {
            return y(d['Qual' + qualno] / 100)
          })
        )

      svg.append('text')
        .datum(data2)
        .html(qualno + " kPa⁻¹")
        .attr("text-anchor", "middle")
        .attr("class", "Qlabel")
        .attr("dx", "0px")
        .attr("dy", "0px")
        .attr("x", x(-9.8 * idx + 82.5))
        .attr("y", y(1 - Math.exp(-(-9.8 * idx + 82.5) / 1000 * qualno)))
    })

    // Add N95 line.
    dataN95 = [{x: 41, y: -0.05}, {x: 41, y: 1.05}];
    svg.append("path")
      .datum(dataN95)
      .attr("fill", "none")
      .attr("stroke", "#111111")
      .attr("stroke-width", 0.75)
      .attr('stroke-dasharray', (4, 2))
      .attr("d", d3.line()
        .x(function(d) {
          return x(d.x)
        })
        .y(function(d) {
          return y(d.y)
        })
      )
    svg.append('text')
      .html("N95 Δp")
      .attr("text-anchor", "middle")
      .attr('transform', 'translate(' + (x(dataN95[0].x) + 2.5) + ',' + height * 0.9 + ')rotate(90)')
      .attr("class", "axis")

    // Add ASTM Level 1 line.
    pL1 = 15 / 0.1019716 / 10 * 4.9;
    dataL1 = [{x: pL1, y: -0.05}, {x: pL1, y: 1.05}];
    svg.append("path")
      .datum(dataL1)
      .attr("fill", "none")
      .attr("stroke", "rgba(247, 201, 28, 1)")
      .attr("stroke-width", 1)
      .attr('stroke-dasharray', (4, 2))
      .attr("d", d3.line()
        .x(function(d) {
          return x(d.x)
        })
        .y(function(d) {
          return y(d.y)
        })
      )
    svg.append('text')
      .html("ASTM Level 1")
      .attr("text-anchor", "middle")
      .attr('transform', 'translate(' + (x(dataL1[0].x) + 2.5) + ',' + height * 0.25 + ')rotate(90)')
      .attr("class", "axis")

    // Add ASTM Level 2 line.
    pL2 = 5 / 0.1019716 / 10 * 4.9;
    dataL2 = [{x: pL2, y: -0.05}, {x: pL2, y: 1.05}];
    svg.append("path")
      .datum(dataL2)
      .attr("fill", "none")
      .attr("stroke", "rgba(1, 216, 149, 1)")
      .attr("stroke-width", 1)
      .attr('stroke-dasharray', (4, 2))
      .attr("d", d3.line()
        .x(function(d) {
          return x(d.x)
        })
        .y(function(d) {
          return y(d.y)
        })
      )
    svg.append('text')
      .html("ASTM Level 2")
      .attr("text-anchor", "middle")
      .attr('transform', 'translate(' + (x(dataL2[0].x) + 2.5) + ',' + height * 0.87 + ')rotate(90)')
      .attr("class", "axis")


    // Function to return printable text/line style for treatment.
    var treatmentText = function(d) {
      if (d.Treatment != 'None') {
        if (typeof(d.Treatment)=='undefined') {
          return '';
        } else if (d.Treatment == 'IPA') {
          return '&nbsp;+ ' + d.Treatment + '';
        } else {
          return '&nbsp;+ ' + d.Treatment.toLowerCase() + '';
        }
      } else {
        return ''
      }
    }
    var treatmentLine = function(d) {
      if (d.Treatment != 'None') {
        if (typeof(d.Treatment)=='undefined') {
          return 0.3;
        } else {
          return 1;  // thicker line for treatment cases
        }
      } else {
        return 0.3
      }
    }


    // Add dots with labels for name/treatment.
    svg.append('g')
      .selectAll("dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", function(d) {
        return x(d.PressureDrop);
      })
      .attr("cy", function(d) {
        return y(1 - d.Filt9);
      })
      .attr("r", function(d) {
        return d.Weight / 125 + 3.5;
      })
      .attr("stroke", "black")
      .attr("stroke-width", function(d) {
        return treatmentLine(d);
      })
      .attr("class", function(d) {
        return d.StructureCode;
      })
      .style("fill", function(d) {
        return color(d.StructureCode);
      })
      .on('mouseover', function(d) {
        d3.select(this).transition()
          .duration(50)
          .attr('opacity', .85);
        divToolTip.transition()
          .duration(50)
          .style("opacity", 1);
        divToolTip.style("left", d3.event.pageX + "px")
          .style("top", d3.event.pageY + "px");
        divToolTipS1.html(d.SimpleName);
        divToolTipS2.html(treatmentText(d));
        divToolTipS3.html('&nbsp;(' + d.CaseCode + ')');
      })
      .on('mouseout', function(d) {
        d3.select(this).transition()
          .duration(50)
          .attr('opacity', 1);
        divToolTip.transition()
          .duration(50)
          .style("opacity", 0);
      });
    //------------------------------------------------------------------------//




    //------------------------------------------------------------------------//
    // a generic plot updater using a given data set
    // e.g., used whenever the slider for da is changed
    function updateData(data0) {
      // give these new data to update plot
      svg.selectAll("circle")
        .data(data0)
        .transition()
        .duration(100)
        .attr("cx", function(d) {
          return x(d.PressureDrop);
        })
        .attr("cy", function(d) {
          return y(1 - d.value);
        })
        .attr("r", function(d) {
          return d.Weight / 125 + 3.5;
        })
        .attr("stroke", "black")
        .attr("stroke-width", 0.3)
        .style("fill", function(d) {
          return color(d.StructureCode);
        });
    }
    //------------------------------------------------------------------------//




    //------------------------------------------------------------------------//
    // slider controlling the aerodynamic diameter
    d3.select("#mySlider").on("change", function(d) {
      selectedNo = this.value
      updateSlider(selectedNo)
    })

    // a function that update the chart
    function updateSlider(selectedNo) {

      // create new data with the selection
      var dataFilter = data.map(function(d) {
        return {
          PressureDrop: d.PressureDrop,
          value: d["Filt" + selectedNo],
          Weight: d.Weight,
          StructureCode: d.StructureCode,
          SimpleName: d.SimpleName,
          BasicCode: d.BasicCode,
          SampleCode: d.SampleCode,
          CaseCode: d.CaseCode
        }
      })

      updateData(dataFilter) // send to general data updater
    }
    //------------------------------------------------------------------------//






    //------------------------------------------------------------------------//
    // This function will change the opacity and size of selected and unselected data
    // using checkbox for material types
    function updateMaterial(data) {

      // For each check box:
      d3.selectAll(".cb-material").each(function(d) {
        cb = d3.select(this);
        mat = cb.property("value")

        // If the box is check, I show the group
        if (cb.property("checked")) {
          svg.selectAll("." + mat)
            .transition()
            .duration(400)
            .style("opacity", 1)
            .attr("r", function(d) {
              return d.Weight / 125 + 3.5;
            })

          // otherwise, hide the circles
        } else {
          svg.selectAll("." + mat)
            .transition()
            .duration(400)
            .style("opacity", 0)
            .attr("r", function(d) {
              return 0;
            })
        }
      })
    }

    // When a button change, I run the update function
    d3.selectAll(".cb-material").on("change", updateMaterial);

    // And I initialize it at the beginning
    updateMaterial();
    //------------------------------------------------------------------------//



    //------------------------------------------------------------------------//
    // legend above the plot generated above
    // add one dot in the legend for each material type
    svgLegend.selectAll("mydots")
      .data(keys)
      .enter()
      .append("circle")
      .attr("cx", 5)
      .attr("cy", function(d, i) {
        return 20 + 9 + i * 17
      })
      .attr("r", 5)
      .attr("stroke", "black")
      .attr("stroke-width", 0.3)
      .style("fill", function(d) {
        return color(d)
      })
    svgLegend.selectAll("legendLabels")
      .data(keys)
      .enter()
      .append("text")
      .attr("x", 15)
      .attr("y", function(d, i) {
        return 20 + 10 + i * 17
      })
      .text(function(d) {
        return d
      })
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")

    svgLegend.append("text")
      .attr("x", 0).attr("y", 14)
      .text("Material structure").attr("alignment-baseline", "left")
      .attr('class', 'control-label')

    // legend for circles sizes
    svgLegend.append("text")
      .attr("x", 195).attr("y", 14)
      .text("Material weight").attr("alignment-baseline", "left")
      .attr('class', 'control-label')
    svgLegend.append("circle") // 10 g/cm2
      .attr("cx", 208).attr("cy", 32)
      .attr("r", 10 / 125 + 3.5).style("fill", "#333333")
      .attr("stroke", "black")
      .attr("stroke-width", 0.3)
    svgLegend.append("text")
      .attr("x", 223).attr("y", 34)
      .text("10 g/m²").attr("alignment-baseline", "middle")
    svgLegend.append("circle") // 300 g/cm2
      .attr("cx", 208).attr("cy", 57)
      .attr("stroke", "black")
      .attr("stroke-width", 0.3)
      .attr("r", 300 / 125 + 3.5).style("fill", "#333333")
    svgLegend.append("text")
      .attr("x", 223).attr("y", 59)
      .text("300 g/m²").attr("alignment-baseline", "middle")
    svgLegend.append("circle") // 1000 g/cm2
      .attr("cx", 208).attr("cy", 82)
      .attr("stroke", "black")
      .attr("stroke-width", 0.3)
      .attr("r", 1000 / 125 + 3.5).style("fill", "#333333")
    svgLegend.append("text")
      .attr("x", 223).attr("y", 84)
      .text("1,000 g/m²").attr("alignment-baseline", "middle")
    //------------------------------------------------------------------------//



  })
});
