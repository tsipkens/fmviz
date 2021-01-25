// set the dimensions and margins of the graph
var max_width = 700;
var $container = $('#whisker_viz'),
  width_w_a = 0.95 * Math.min($container.width(), max_width),
  height_w_a = $container.height()

// set the dimensions and margins of the graph
var margin_w = {
    top: 10,
    right: 30,
    bottom: 50,
    left: 70
  },
  width_w = width_w_a - margin_w.left - margin_w.right,
  height_w = 400 - margin_w.top - margin_w.bottom;

var x_domain = [0.1, 1e4]

//Read the data
// append the svg object to the body of the page
var svg = d3.select("#whisker_viz")
  .append("svg")
  .attr("width", width_w + margin_w.left + margin_w.right)
  .attr("height", height_w + margin_w.top + margin_w.bottom)
  .append("g")
  .attr("transform",
    "translate(" + margin_w.left + "," + margin_w.top + ")");

evalQuality = function(filt, press) {
  Q = -1000 * Math.log(filt) / press;
  if (isNaN(Q)) {
    return null;
  } else if (!(isFinite(Q))) {
    return 4;
  } else if (Q < 1e-1) {
    return null;
  } else {
    return Math.log10(Q);
  }
}

// Read the data and compute summary statistics for each specie
d3.csv("https://raw.githubusercontent.com/tsipkens/fmviz/main/data/fm.csv", function(data) {

  // Compute quartiles, median, inter quantile range min and max --> these info are then used to draw the box.
  var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
    .key(function(d) {
      return d.StructureCode;
    })
    .rollup(function(d) {
      q1 = d3.quantile(d.map(function(g) {
        return evalQuality(g.Filt9, g.PressureDrop);
      }).sort(d3.ascending), .25)
      median = d3.quantile(d.map(function(g) {
        return evalQuality(g.Filt9, g.PressureDrop);
      }).sort(d3.ascending), .5)
      q3 = d3.quantile(d.map(function(g) {
        return evalQuality(g.Filt9, g.PressureDrop);
      }).sort(d3.ascending), .75)
      interQuantileRange = q3 - q1
      min = d3.quantile(d.map(function(g) {
        return evalQuality(g.Filt9, g.PressureDrop);
      }).sort(d3.ascending), .05)
      max = d3.quantile(d.map(function(g) {
        return evalQuality(g.Filt9, g.PressureDrop);
      }).sort(d3.ascending), .95)
      return ({
        q1: q1,
        median: median,
        q3: q3,
        interQuantileRange: interQuantileRange,
        min: min,
        max: max
      })
    })
    .entries(data)

  // Show the Y scale
  var y = d3.scaleBand()
    .range([height_w, 0])
    .domain(["ML", "nWH", "nW", "CP", "K", "W"])
    .padding(.4);
  svg.append("g")
    .attr("class", "axis2")
    .call(d3.axisLeft(y)
      .tickSize(0)
      .tickFormat(function(d) {
        var mapper = {
          "W": "Woven",
          "K": "Knit",
          "CP": "Cut pile",
          "nW": "Nonwoven",
          "nWH": "Halyard",
          "ML": "Multilayer"
        }
        return mapper[d]
      }))
    .select(".domain").remove()

  // Show the X scale
  var x = d3.scaleLog()
    .domain(x_domain)
    .range([0, width_w])
  svg.append("g")
    .attr("transform", "translate(0," + height_w + ")")
    .attr("class", "axis")
    .call(d3.axisBottom(x).ticks(5))

  // Color scale
  var colorkeys = ["#DAF7A6", "#FFC300", "#FF5733", "#581845", "url(#diagonal-stripe-2)", "url(#diagonal-stripe-1)"],
    keycodes = ["W", "K", "CP", "nW", "nWH", "ML"],
    keys = ["Woven mat. (W)", "Knit (K)", "Cut pile (CP)", "Non-woven (nW)", "Non-woven, Halyard", "Multi-layer (ML)"]
  var color = d3.scaleOrdinal()
    .domain(keys)
    .range(colorkeys)

  // Add X axis label:
  svg.append("text")
    .attr("text-anchor", "middle")
    .attr("x", width_w / 2)
    .attr("y", height_w + margin_w.top + 30)
    .text("Quality [kPa⁻¹]");

  // rectangle for the main box
  svg
    .selectAll("boxes")
    .data(sumstat)
    .enter()
    .append("rect")
    .attr("x", function(d) {
      return (x(Math.pow(10, d.value.q1)))
    })
    .attr("width", function(d) {
      ;
      return (x(Math.pow(10, d.value.q3)) - x(Math.pow(10, d.value.q1)))
    }) //console.log(x(d.value.q3)-x(d.value.q1))
    .attr("y", function(d) {
      return y(d.key);
    })
    .attr("height", y.bandwidth())
    .attr("stroke", "black")
    .style("fill", "#DDD")
    .style("opacity", 0.5)

  // Show the main vertical line
  svg
    .selectAll("vertLines")
    .data(sumstat)
    .enter()
    .append("line")
    .attr("x1", function(d) {
      return (x(Math.pow(10, d.value.min)))
    })
    .attr("x2", function(d) {
      return (x(Math.pow(10, d.value.max)))
    })
    .attr("y1", function(d) {
      return (y(d.key) + y.bandwidth() / 2)
    })
    .attr("y2", function(d) {
      return (y(d.key) + y.bandwidth() / 2)
    })
    .attr("stroke", "black")
    .style("width", 40)

  // Show the median
  svg
    .selectAll("medianLines")
    .data(sumstat)
    .enter()
    .append("line")
    .attr("y1", function(d) {
      return (y(d.key))
    })
    .attr("y2", function(d) {
      return (y(d.key) + y.bandwidth() / 2)
    })
    .attr("x1", function(d) {
      return (Math.pow(10, x(d.value.median)))
    })
    .attr("x2", function(d) {
      return (Math.pow(10, x(d.value.median)))
    })
    .attr("stroke", "black")
    .style("width", 80)

  // create a tooltip
  var div_tool = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
  var treatmentText = function(d) {
    if (d.Treatment != 'None') {
      if (typeof(d.Treatment) == 'undefined') {
        return '';
      } else if (d.Treatment == 'IPA') {
        return ', ' + d.Treatment + '';
      } else {
        return ', ' + d.Treatment.toLowerCase() + '';
      }
    } else {
      return ''
    }
  }


  // Add individual points with jitter
  var jitterWidth = 30
  svg
    .selectAll("indPoints")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function(d) {
      return (x(Math.pow(10, evalQuality(d.Filt9, d.PressureDrop))))
    })
    .attr("cy", function(d) {
      return (y(d.StructureCode) + (y.bandwidth() / 2) - jitterWidth / 2 + Math.random() * jitterWidth)
    })
    .attr("r", 4)
    .style("fill", function(d) {
      return (color(d.StructureCode))
    })
    .attr("stroke", "black")
    .on('mouseover', function(d) {
      d3.select(this).transition()
        .duration(50)
        .attr('opacity', .85);
      div_tool.transition()
        .duration(50)
        .style("opacity", 1);
      div_tool.html(d.SimpleName + treatmentText(d) + ' (' + d.CaseCode + ')')
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY + "px");
    })
    .on('mouseout', function(d) {
      d3.select(this).transition()
        .duration(50)
        .attr('opacity', 1);
      div_tool.transition()
        .duration(50)
        .style("opacity", 0);
    });

})
