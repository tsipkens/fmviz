



var currentCodes = ["W5","nW5","K7"];  // starting materials



// assign colors and material types to variables
var colorkeys = ["#DAF7A6", "#FFC300", "#FF5733", "#581845", "#581845", "#777777"],
  keyCodes = ["W", "K", "CP", "nW", "nWH", "ML"],
  keys = ["Woven mat. (W)", "Knit (K)", "Cut pile (CP)", "Non-woven (nW)", "Non-woven, Halyard", "Multi-layer (ML)"]

var color_pc = function (keyCode) {
  for (cc in keyCodes) {
    if (keyCode==keyCodes[cc]) { return colorkeys[cc]; }
  }
}


// set the dimensions and margins of the graph
var $container = $('#pen_curve'),
    width_pc_a = 0.95 * Math.min($container.width(), 870),
    height_pc_a = $container.height()

var margin_pc = {
  top: 30,
  right: 55,
  bottom: 50,
  left: 65
}
  width_pc = width_pc_a - margin_pc.left - margin_pc.right,
  height_pc = 410 - margin_pc.top - margin_pc.bottom;

// append the svg object to the body of the page
var svg_pc = d3.select("#pen_curve")
  .append("svg")
  .attr("width", width_pc + margin_pc.left + margin_pc.right)
  .attr("height", height_pc + margin_pc.top + margin_pc.bottom)
  .append("g")
  .attr("transform", "translate(" + margin_pc.left + "," + margin_pc.top + ")");



//Read the data
d3.csv("https://raw.githubusercontent.com/tsipkens/fmviz/main/data/fm.csv", function(data) {

  // Add X axis
  var x_pc = d3.scaleLog()
    .domain([0.498, 8.116])
    .range([0, width_pc]);
  svg_pc.append("g")
    .attr("transform", "translate(0," + height_pc + ")")
    .attr("class", "axis")
    .call(d3.axisBottom(x_pc)
      .tickFormat(d3.format(".1f")));
  svg_pc.append("g")
    .attr("class", "axis")
    .call(d3.axisTop(x_pc)
      .tickFormat(d3.format(".1f")));

  // Add Y axis
  var y_pc = d3.scaleLinear()
    .domain([-0.15, 1.15])
    .range([height_pc, 0]);
  var yrv_pc = d3.scaleLinear()
    .domain([1 + 0.15, 1 - 1.15])
    .range([height_pc, 0]); // reverse axis for penetration
  svg_pc.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y_pc)
      .tickFormat(d3.format(".0%")));
  svg_pc.append("g")
    .attr("transform", "translate(" + width_pc + ",0)")
    .attr("class", "axis")
    .call(d3.axisRight(yrv_pc)
      .tickFormat(d3.format(".0%")))


  //-- Add axis labels --//
  // Add X axis label:
  svg_pc.append("text")
    .attr("text-anchor", "middle")
    .attr('x', width_pc / 2)
    .attr('y', height_pc + 35)
    .text("Particle size [micron]");

  // Y axis label:
  svg_pc.append("text")
    .attr("text-anchor", "middle")
    .attr('transform', 'translate(-42,' + height_pc / 2 + ')rotate(-90)')
    .text("Filtration efficiency")
  svg_pc.append("text")
    .attr("text-anchor", "middle")
    .attr('transform', 'translate(' + (width_pc + 42) + ',' + height_pc / 2 + ')rotate(90)')
    .text("Penetration")


  // get all material codes
  var all_codes = [], all_mats = [];
  var treatmentText = function(d) {
    if (d.Treatment != 'None') {
      if (typeof(d.Treatment)=='undefined') {
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


  for (aa in data) {
    all_codes[aa] = data[aa].CaseCode;
    all_mats[aa] = data[aa].SimpleName + treatmentText(data[aa]) + " (" + data[aa].CaseCode + ")";
  }

  all_codes = all_codes.filter(function(item, i, ar) { return ar.indexOf(item) === i }); // get only unique entries
  all_mats = all_mats.filter(function(item, i, ar) { return ar.indexOf(item) === i }); // get only unique entries


  console.log(all_codes)
  console.log(all_mats)

  var populateDropDown = function (dropDown) {
    for(ii in all_codes) {
        var el = document.createElement("option");
        el.textContent = all_mats[ii];
        el.value = all_codes[ii];
        dropDown.appendChild(el);
      }
  }

  populateDropDown(document.getElementById("select-code"));
  populateDropDown(document.getElementById("select-code2"));
  populateDropDown(document.getElementById("select-code3"));

  document.getElementById("select-code").value = currentCodes[0];
  document.getElementById("select-code2").value = currentCodes[1];
  document.getElementById("select-code3").value = currentCodes[2];

  var getDataFromCode = function (codeVal) {
    var slicedData = []
    for (cc in codeVal) {
      if (codeVal[cc]=="None") {
        slicedData[cc] = null;
      } else {
        sliceNo = 0;
        for (aa in data) {
          if (data[aa].CaseCode==codeVal[cc]) { sliceNo = aa; break; }
        }
        slicedData[cc] = (data[sliceNo]);
      }
    }

    return slicedData
  }

  var slicedData = getDataFromCode(currentCodes);


  var formatSlicedData = function (slicedData) {
    var data2 = [];
    var filt_no = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
    var channel = [0.498, 0.62, 0.796, 0.962, 1.191, 1.478, 1.909, 2.322, 2.756, 3.398, 4.221, 5.246, 6.491, 8.116]
    for (bb in filt_no) {
      data2[bb] = {'x': channel[filt_no[bb] - 1], 'ya': 1}
      dataAll = 1;
      for (aa in slicedData) {
        if (slicedData[aa]!=null) {
          data2[bb]['y' + aa] = slicedData[aa]['Filt' + filt_no[bb]];
          dataAll = dataAll * slicedData[aa]['Filt' + filt_no[bb]];
        }
      }
      data2[bb]['yall'] = dataAll; // add product of all materials
    }
    return data2;
  }

  var data2 = formatSlicedData(slicedData);


  // add dashed lines at zero and one
  svg_pc.append("path")
    .datum(data2)
    .attr("id", "lzeros")
    .attr("fill", "none")
    .attr("stroke", "#AAAAAA")
    .attr("stroke-width", 0.5)
    .style("stroke-dasharray", ("4, 2"))
    .attr("d", d3.line()
      .x(function(d) {
        return x_pc(d.x)
      })
      .y(function(d) {
        return y_pc(1 - d['ya'])
      }));
    svg_pc.append("path")
      .datum(data2)
      .attr("id", "lones")
      .attr("fill", "none")
      .attr("stroke", "#AAAAAA")
      .attr("stroke-width", 0.5)
      .style("stroke-dasharray", ("4, 2"))
      .attr("d", d3.line()
        .x(function(d) {
          return x_pc(d.x)
        })
        .y(function(d) {
          return y_pc(d['ya'])
        }));



  // Plotting data
  for (aa in slicedData) {
    svg_pc.append("path")
      .datum(data2)
      .attr("id", "p" + aa)
      .attr("fill", "none")
      .attr("stroke", "#2525C6")
      .attr("stroke-width", 0)
      .attr("d", d3.line()
        .x(function(d) {
          return x_pc(d.x)
        })
        .y(function(d) {
          return y_pc(1 - d['ya'])
        })
      )
    }

    // add combined curve
    svg_pc.append("path")
      .datum(data2)
      .attr("id", "pall")
      .attr("fill", "none")
      .attr("stroke", "#000000")
      .attr("stroke-width", 1.5)
      .style("stroke-dasharray", ("4, 2"))
      .attr("d", d3.line()
        .x(function(d) {
          return x_pc(d.x)
        })
        .y(function(d) {
          return y_pc(1 - d['ya'])
        }));



  var updateCurve = function (val) {
    slicedData = getDataFromCode(val);
    data2 = formatSlicedData(slicedData);

    var pweight = 0,
        pdrop = 0;
    for (aa in slicedData) {
      if (slicedData[aa]==null) {
        svg_pc.select("#p" + aa)
          .datum(data2)
          .transition()
          .attr("stroke-width", 0)
          .attr("d", d3.line()
            .x(function(d) {
              return x_pc(d.x)
            })
            .y(function(d) {
              return y_pc(1 - d['ya'])
            })
          )
      } else {
        pweight = pweight + Number(slicedData[aa].Weight);
        pdrop = pdrop + Number(slicedData[aa].PressureDrop);

        // will produce errors for a few materials with NaN values in filtration range
        svg_pc.select("#p" + aa)
          .datum(data2)
          .transition()
          .attr("stroke", color_pc(slicedData[aa].StructureCode))
          .attr("stroke-width", 2)
          .attr("d", d3.line()
            .x(function(d) {
              return x_pc(d.x)
            })
            .y(function(d) {
              return y_pc(1 - d['y' + aa])
            })
          )
        }
      }

      svg_pc.select("#pall")
        .datum(data2)
        .transition()
        .attr("d", d3.line()
          .x(function(d) {
            return x_pc(d.x)
          })
          .y(function(d) {
            return y_pc(1 - d['yall'])
          })
        )

      document.getElementById("pweight").value = pweight;  // estimated weight (sum)
      document.getElementById("pdrop").value = pdrop;  // estimate pressure drop (sum)
    }

    updateCurve(currentCodes)

    var updateMaskColor = function (code, no) {
      if (code=="None") {
        letter = "none"
      } else if ((code[0]=="K") || (code[0]=="W")) {
        letter = code[0]
      } else if ((code.slice(0, 3)=="nW2") || ((code.slice(0, 3)=="nW3")) || ((code.slice(0, 3)=="nW4"))) {
        letter = "nWH"
      } else if ((code.slice(0, 2)=="CP") || ((code.slice(0, 2)=="nW"))) {
        letter = code.slice(0, 2)
      } else {
        letter = "other"
      }
      document.getElementById("img_l" + (no + 1)).src =
        "imgs/mask_" + letter + ".svg";  // select image to display

      // label image with text that displays code
      if (code!="None") {
        document.getElementById("txt_l" + (no + 1)).innerHTML = code;
      } else {
        document.getElementById("txt_l" + (no + 1)).innerHTML = "&nbsp";
      }

      if ((code.slice(0, 2)=="CP") || ((code.slice(0, 2)=="nW"))) {
        document.getElementById("txt_l" + (no + 1)).style.color = "#FFFFFF"
      } else {
        document.getElementById("txt_l" + (no + 1)).style.color = "#000000"
      }

    }
    updateMaskColor(currentCodes[0], 0)  // update colours of masks show to user
    updateMaskColor(currentCodes[1], 1)
    updateMaskColor(currentCodes[2], 2)

  // dropdown menus picking different layer materials
  d3.select("#select-code").on("change", function() {
    currentCodes[0] = this.value;
    updateMaskColor(currentCodes[0], 0)
    updateCurve(currentCodes)
  })

  d3.select("#select-code2").on("change", function() {
    currentCodes[1] = this.value;
    updateMaskColor(currentCodes[1], 1)
    updateCurve(currentCodes)
  })

  d3.select("#select-code3").on("change", function() {
    currentCodes[2] = this.value;
    updateMaskColor(currentCodes[2], 2)
    updateCurve(currentCodes)
  })

})
