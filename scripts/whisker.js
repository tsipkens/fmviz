// set the dimensions and margins of the graph
var maxWidth = 950;
var $container = $('#whisker-viz'),
  widthWA = Math.min($container.width(), maxWidth),
  heightWA = $container.height()

// set the dimensions and margins of the graph
var marginW = {
    top: 10,
    right: 110,
    bottom: 50,
    left: 100
  },
  widthW = widthWA - marginW.left - marginW.right,
  heightW = 400 - marginW.top - marginW.bottom;

var xDomain = [0.5, 2e2]

//Read the data
// append the svg object to the body of the page
var svg = d3.select("#whisker-viz")
  .append("svg")
  .attr("width", widthW + marginW.left + marginW.right)
  .attr("height", heightW + marginW.top + marginW.bottom)
  .append("g")
  .attr("transform",
    "translate(" + marginW.left + "," + marginW.top + ")");

//-- Add background rectangle --//
svg.append("rect")
  .attr("width", widthW).attr("class", "plot-fill")
  .attr("height", heightW)
  .attr("stroke", "#DDD")
  .attr("stroke-width", 0.5);

evalQuality = function(filt, press) {
  Q = -1000 * Math.log(filt) / press;
  if (isNaN(Q)) {
    return null;
  } else if (!(isFinite(Q))) {
    return 3;
  } else if (Q < 1e-1) {
    return null;
  } else {
    return Math.log(Q) / Math.log(10); // used instead of log10 to work in IE
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
    .range([heightW, 0])
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
    .domain(xDomain)
    .range([0, widthW])
  svg.append("g")
    .attr("transform", "translate(0," + heightW + ")")
    .attr("class", "axis")
    .call(d3.axisBottom(x).ticks(3)
      .tickFormat(d3.format(1, "f")))

  // Check if internet explorer.
  var isIE = false;
  var ua = window.navigator.userAgent;
  var oldIE = ua.indexOf('MSIE ');
  var newIE = ua.indexOf('Trident/');
  if ((oldIE > -1) || (newIE > -1)) {
    isIE = true;
  }

  // Color scale
  var getCSSVar = function(varname) {
    if (isIE) { // internet explorer styling (no support for CSS vars.)
      lc = varname.slice(varname.length - 1);
      if (lc == ")") {
        colorcode = "#444";
      } else {
        colorcode = ("#FF" + Math.round(1.8 * lc).toString(16) + "F" + (8 - lc).toString(16) + "F")
      }
    } else {
      colorcode = getComputedStyle(document.documentElement).getPropertyValue(varname)
    }
    return colorcode;
  }
  var colorkeys = [getCSSVar('--c7'), getCSSVar('--c6'), getCSSVar('--c5'), getCSSVar('--c2'), "url(#diagonal-stripe-2)", "url(#diagonal-stripe-1)"], 
    colorkeys2 = [getCSSVar('--c7'), getCSSVar('--c6'), getCSSVar('--c5'), getCSSVar('--c2'), getCSSVar('--c2'), getCSSVar('--c4')], 
    keyCodes = ["W", "K", "CP", "nW", "nWH", "ML"],
    keys = ["Woven mat. (W)", "Knit (K)", "Cut pile (CP)", "Non-woven (nW)", "Non-woven, Halyard", "Multi-layer (ML)"];
  var color = d3.scaleOrdinal()
    .domain(keys)
    .range(colorkeys)
  var color2 = d3.scaleOrdinal()
    .domain(keyCodes)
    .range(colorkeys2)

  // Add X axis label:
  svg.append("text")
    .attr("text-anchor", "middle")
    .attr("x", widthW / 2)
    .attr("y", heightW + marginW.top + 30)
    .text("Quality [kPa⁻¹]");

  // Show the main vertical line
  svg
    .selectAll("horzLines")
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

  // For tooltips.
  var divToolTip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // For formating parts of tooltip text.
  var divToolTipS1 = divToolTip.append("div").attr("class", "tooltip-s1");  // name
  var divToolTipS2 = divToolTip.append("div").attr("class", "tooltip-s2");  // treatment
  var divToolTipS3 = divToolTip.append("div").attr("class", "tooltip-s3");  // code
  var divToolTipS4 = divToolTip.append("div").attr("class", "tooltip-s4");  // quality
  var divToolTipS5 = divToolTip.append("div").attr("class", "tooltip-s5");

  // Function to return printable text/line style for treatment.
  qualityText = function (d) {
    Q = -1000 * Math.log(d.Filt9) / d.PressureDrop;
    if (isNaN(Q)) {
      Q = "N/A";
    } else if (!(isFinite(Q))) {
      Q = "~∞";
    } else if (Q < (Math.pow(10, 1e-3))) {
      Q = "< 0.001";
    } else {
      Q = Number((Math.pow(10, (Math.log(Q) / Math.log(10)))).toPrecision(2)); // used instead of log10 to work in IE
    }
    return Q
  }
  var layerText = function (d) {
    if ((d.Layers == "1") || (d.Layers == "-")) {
      return ""
    } else {
      return "Layers  <span style='color:#AAA;'>" + d.Layers + "</span>"
    }
  }
  var treatmentText = function(d) {
    if (d.Treatment != 'None') {
      if (typeof(d.Treatment)=='undefined') {
        return '';
      } else if (d.Treatment == 'IPA') {
        return 'Treated with ' + d.Treatment + ' <i class="fas fa-flask" style="font-size:7pt;color:var(--a0)"></i>';
      } else if (d.Treatment.substring(0,4) == 'Heat') {
        return d.Treatment + ' <i class="fas fa-fire" style="font-size:8pt;color:#FF5733"></i>';
      } else if ((d.Treatment.substring(0,5) == 'Laund') || (d.Treatment.substring(0,4) == 'Wash')) {
        return d.Treatment + ' <i class="fas fa-tint" style="font-size:8pt;color:#414487"></i>'
      } else {
        return d.Treatment + '';
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
    .attr("r", 5.3)
    .style("fill", function(d) {
      return (color(d.StructureCode))
    })
    .attr("stroke", "black")
    .attr("stroke-width", function(d) {
      return treatmentLine(d);
    })
    .on('mouseover', function(d) {
      var matrix = this.getScreenCTM()
        .translate(+ this.getAttribute("cx"), + this.getAttribute("cy"));
      divToolTip.style("left", (window.pageXOffset + matrix.e + 9) + "px")
        .style("top", (window.pageYOffset + matrix.f - 40) + "px")
        .style("border-left", "8px solid " + color2(d.StructureCode));
      divToolTipS1.html(d.SimpleName);
      divToolTipS2.html("Code <span style='color:#AAA;'>" + d.CaseCode +"</span>");
      divToolTipS3.html(treatmentText(d));
      divToolTipS4.html("Quality <span style='color:#AAA;'>" + qualityText(d) + "</span>");
      divToolTipS5.html(layerText(d));
      d3.select(this).transition()
        .duration(50)
        .attr('opacity', .85);
      divToolTip.transition()
        .duration(50)
        .style("opacity", 1);
    })
    .on('mouseout', function(d) {
      d3.select(this).transition()
        .duration(50)
        .attr('opacity', 1);
      divToolTip.transition()
        .duration(50)
        .style("opacity", 0);
    });

})
