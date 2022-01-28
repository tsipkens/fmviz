

//-- HANDLE URL VARIABLE ----------------------------------------//
// function to get URL variables
function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      vars[key] = decodeURI(value);
  });
  console.log(vars)
  return vars;
}
function getUrlParam(parameter, defaultvalue){
  var urlparameter = defaultvalue;
  if(window.location.href.indexOf(parameter) > -1){
      urlparameter = getUrlVars()[parameter];
      }
  return urlparameter;
}
function updateURLParameter(url, param, paramVal)
{
    var TheAnchor = null;
    var newAdditionalURL = "";
    var tempArray = url.split("?");
    var baseURL = tempArray[0];
    var additionalURL = tempArray[1];
    var temp = "";

    if (additionalURL) 
    {
        var tmpAnchor = additionalURL.split("#");
        var TheParams = tmpAnchor[0];
            TheAnchor = tmpAnchor[1];
        if(TheAnchor)
            additionalURL = TheParams;

        tempArray = additionalURL.split("&");

        for (var i=0; i<tempArray.length; i++)
        {
            if(tempArray[i].split('=')[0] != param)
            {
                newAdditionalURL += temp + tempArray[i];
                temp = "&";
            }
        }        
    }
    else
    {
        var tmpAnchor = baseURL.split("#");
        var TheParams = tmpAnchor[0];
            TheAnchor  = tmpAnchor[1];

        if(TheParams)
            baseURL = TheParams;
    }

    if(TheAnchor)
        paramVal += "#" + TheAnchor;

    var rows_txt = temp + "" + param + "=" + paramVal;
    return baseURL + "?" + newAdditionalURL + rows_txt;
}
function updateURLCodes (currentCodes) {
    // update URL with all of the parameters
  window.history.replaceState('', '', updateURLParameter(window.location.href, "l1", currentCodes[0]));
  window.history.replaceState('', '', updateURLParameter(window.location.href, "l2", currentCodes[1]));
  window.history.replaceState('', '', updateURLParameter(window.location.href, "l3", currentCodes[2]));
}

// Original codes: W5, nW5, K7
currentCodes = [" ", " ", " "]  // initialize as empty
currentCodes[0] = getUrlParam("l1", "W5");  // default materials for dropdowns OR read from URL
currentCodes[1] = getUrlParam("l2", "nW5x2");
currentCodes[2] = getUrlParam("l3", "K7");

// update URL with all of the parameters
updateURLCodes(currentCodes);
//-----------------------------------------------------------------//



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
      colorCode = "#444";
    } else {
      colorCode = ("#FF" + Math.round(1.8 * lc).toString(16) + "F" + (8 - lc).toString(16) + "F")
    }
  } else {
    colorCode = getComputedStyle(document.documentElement).getPropertyValue(varname)
  }
  return colorCode;
}
var colorKeys = [getCSSVar('--c7'), getCSSVar('--c6'), getCSSVar('--c5'), getCSSVar('--c2'), getCSSVar('--c1'), getCSSVar('--c4')],
  keyCodes = ["W", "K", "CP", "nW", "nWH", "ML"],
  keys = ["Woven mat. (W)", "Knit (K)", "Cut pile (CP)", "Non-woven (nW)", "Non-woven, Halyard", "Multi-layer (ML)"]
console.log(keyCodes)
var colorPen = function(keyCode) {
  for (cc in keyCodes) {
    if (keyCode == keyCodes[cc]) {
      return colorKeys[cc];
    }
  }
}


// set the dimensions and margins of the graph
var $container = $('#pen_curve'),
  widthPenA = Math.min($container.width(), 870),
  heightPenA = $container.height()

var marginPen = {  // margins of penetration curve plot
  top: 50,
  right: 55,
  bottom: 40,
  left: 65
}
var widthPen = widthPenA - marginPen.left - marginPen.right,
  heightPen = 380 - marginPen.top - marginPen.bottom;

// append the svg object to the body of the page
var svgPen = d3.select("#pen_curve")
  .append("svg")
  .attr("width", widthPen + marginPen.left + marginPen.right)
  .attr("height", heightPen + marginPen.top + marginPen.bottom)
  .append("g")
  .attr("transform", "translate(" + marginPen.left + "," + marginPen.top + ")");

//-- Add background rectangle --//
svgPen.append("rect")
  .attr("width", widthPen).attr("class", "plot-fill")
  .attr("height", heightPen);



//Read the data
d3.csv("https://raw.githubusercontent.com/tsipkens/fmviz/main/data/fm.csv", function(data) {

  // Add X axis
  var xPen = d3.scaleLog()
    .domain([0.4, 5.50])
    .range([0, widthPen]);
  svgPen.append("g")
    .attr("transform", "translate(0," + heightPen + ")")
    .attr("class", "axis")
    .call(d3.axisBottom(xPen)
      .tickFormat(d3.format(1, "f")));
  var xPen = d3.scaleLog()
    .domain([0.62, 8.116])
    .range([0, widthPen]);
  svgPen.append("g")
    .attr("class", "axis")
    .call(d3.axisTop(xPen)
      .tickFormat(d3.format(1, "f")));

  // Add Y axis.
  var yPen = d3.scaleLinear()
    .domain([-0.15, 1.15])
    .range([heightPen, 0]);
  var yRevPen = d3.scaleLinear()
    .domain([1 + 0.15, 1 - 1.15])
    .range([heightPen, 0]);  // reverse axis for penetration
  svgPen.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(yPen)
      .tickFormat(d3.format(".0%")));
  svgPen.append("g")
    .attr("transform", "translate(" + widthPen + ",0)")
    .attr("class", "axis")
    .call(d3.axisRight(yRevPen)
      .tickFormat(d3.format(".0%")))


  //-- Add axis labels --//
  // Add X axis label:
  svgPen.append("text")
    .attr("text-anchor", "middle")
    .attr('x', widthPen / 2)
    .attr('y', heightPen + 35)
    .text("Particle size (mobility diameter) [μm]");
  svgPen.append("text")
    .attr("text-anchor", "middle")
    .attr('x', widthPen / 2)
    .attr('y', -25)
    .text("Particle size (aerodynamic diameter) [μm]");

  // Y axis label:
  svgPen.append("text")
    .attr("text-anchor", "middle")
    .attr('transform', 'translate(-42,' + heightPen / 2 + ')rotate(270)')
    .text("Filtration efficiency")
  svgPen.append("text")
    .attr("text-anchor", "middle")
    .attr('transform', 'translate(' + (widthPen + 42) + ',' + heightPen / 2 + ')rotate(90)')
    .text("Penetration")


  // get all material codes
  var allCodes = [],
    allMaterials = [];
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
      return '';
    }
  }
  var layerText = function(d) {
    if (d.StructureCode == 'ML') {
      return '';  // do not show layers if already compiled multilayer mask
    } else {
      if (d.Layers == 1) {
        return '';  // don't show anything for a single layer
      } else {
        return ', ' + d.Layers + ' layers';  // append number of layers
      }
    }
    
  }

  // Fill all* summary variables.
  var allCodes = [],
    allMaterials = [];
  for (aa in data) {
    allCodes[aa] = data[aa].CaseCode;
    allMaterials[aa] = data[aa].SimpleName + treatmentText(data[aa]) 
      + layerText(data[aa]) + " (" + data[aa].CaseCode + ")";
  }

  // Filter for unique entries.
  var getUnique = function(item, i, ar) {  // function for filtering
    return ar.indexOf(item) === i
  }
  allCodes = allCodes.filter( getUnique );
  allMaterials = allMaterials.filter( getUnique );


  console.log(allCodes)
  console.log(allMaterials)

  // Populate selects/dropdown boxes.
  var populateDropDown = function(dropDown) {
    for (ii in allCodes) {
      var el = document.createElement("option");
      el.textContent = allMaterials[ii];
      el.value = allCodes[ii];
      dropDown.appendChild(el);
    }
  }
  populateDropDown(document.getElementById("select-code"));
  populateDropDown(document.getElementById("select-code2"));
  populateDropDown(document.getElementById("select-code3"));

  document.getElementById("select-code").value = currentCodes[0];
  document.getElementById("select-code2").value = currentCodes[1];
  document.getElementById("select-code3").value = currentCodes[2];

  var getDataFromCode = function(codeVal) {
    var slicedData = []
    for (cc in codeVal) {
      if (codeVal[cc] == "None") {
        slicedData[cc] = null;
      } else {
        sliceNo = 0;
        for (aa in data) {
          if (data[aa].CaseCode == codeVal[cc]) {
            sliceNo = aa;
            break;
          }
        }
        slicedData[cc] = (data[sliceNo]);
      }
    }

    return slicedData
  }

  var slicedData = getDataFromCode(currentCodes);


  var formatSlicedData = function(slicedData) {
    var data2 = [];
    var filtrNo = [2, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]  // TO DO: Remove duplicate.
    var channel = [0.62, 0.62, 0.796, 0.962, 1.191, 1.478, 1.909, 2.322, 2.756, 3.398, 4.221, 5.246, 6.491, 8.116]
    for (bb in filtrNo) {
      data2[bb] = {
        'x': channel[filtrNo[bb] - 1],
        'ya': 1
      }
      dataAll = 1;
      for (aa in slicedData) {
        if (slicedData[aa] != null) {
          data2[bb]['y' + aa] = slicedData[aa]['Filt' + filtrNo[bb]];
          dataAll = dataAll * slicedData[aa]['Filt' + filtrNo[bb]];
          data2[bb]['name_' + aa] = slicedData[aa]['Filt' + filtrNo[bb]];
        }
      }
      data2[bb]['yall'] = dataAll; // add product of all materials
    }
    return data2;
  }

  var data2 = formatSlicedData(slicedData);


  // add dashed lines at zero and one
  svgPen.append("path")
    .datum(data2)
    .attr("id", "lzeros")
    .attr("fill", "none")
    .attr("stroke", "#AAAAAA")
    .attr("stroke-width", 0.5)
    .style("stroke-dasharray", ("4, 2"))
    .attr("d", d3.line()
      .x(function(d) {
        return xPen(d.x)
      })
      .y(function(d) {
        return yPen(1 - d['ya'])
      }));
  svgPen.append("path")
    .datum(data2)
    .attr("id", "lones")
    .attr("fill", "none")
    .attr("stroke", "#AAAAAA")
    .attr("stroke-width", 0.5)
    .style("stroke-dasharray", ("4, 2"))
    .attr("d", d3.line()
      .x(function(d) {
        return xPen(d.x)
      })
      .y(function(d) {
        return yPen(d['ya'])
      }));



  // Plotting data
  for (aa in slicedData) {
    svgPen.append("path")
      .datum(data2)
      .attr("id", "p" + aa)
      .attr("fill", "none")
      .attr("stroke", "#FF8888")
      .attr("stroke-width", 0)
      .attr("d", d3.line()
        .x(function(d) {
          return xPen(d.x)
        })
        .y(function(d) {
          return yPen(1 - d['ya'])
        })
      )
  }

  // add combined curve
  svgPen.append("path")
    .datum(data2)
    .attr("id", "pall")
    .attr("fill", "none")
    .attr("stroke", "#000000")
    .attr("stroke-width", 1.5)
    .style("stroke-dasharray", ("4, 2"))
    .attr("d", d3.line()
      .x(function(d) {
        return xPen(d.x)
      })
      .y(function(d) {
        return yPen(1 - d['ya'])
      }));

  var focus = svgPen.append("g");

  focus.append("text")
    .attr("text-anchor", "end")
    .attr("font-size", "10pt")
    .attr("id", "tooltip-0")
    .attr("x", xPen(data2[6].x) - 3)
    .attr("y", yPen(0) + 12)
    .text(slicedData[0].SimpleName + treatmentText(slicedData[0]) + ' (' + slicedData[0].CaseCode + ')');
  focus.append("circle")
    .attr("id", "circ-0")
    .attr("cx", xPen(data2[6].x))
    .attr("cy", yPen(0))
    .attr("r", 3)
    .attr("fill", colorPen(slicedData[0].StructureCode))
    .attr("stroke", "#444")
    .attr("stroke-width", 0.4);

  focus.append("text")
    .attr("font-size", "10pt")
    .attr("id", "tooltip-1")
    .attr("x", xPen(data2[7].x) + 3)
    .attr("y", yPen(0) + 12)
    .text(slicedData[1].SimpleName + treatmentText(slicedData[1]) + ' (' + slicedData[1].CaseCode + ')');
  focus.append("circle")
    .attr("id", "circ-1")
    .attr("cx", xPen(data2[7].x))
    .attr("cy", yPen(0))
    .attr("r", 3)
    .attr("fill", colorPen(slicedData[1].StructureCode))
    .attr("stroke", "#444")
    .attr("stroke-width", 0.4);

  focus.append("text")
    .attr("font-size", "10pt")
    .attr("id", "tooltip-2")
    .attr("x", xPen(data2[8].x) + 3)
    .attr("y", yPen(0) + 12)
    .text(slicedData[2].SimpleName + treatmentText(slicedData[2]) + ' (' + slicedData[2].CaseCode + ')');
  focus.append("circle")
    .attr("id", "circ-2")
    .attr("cx", xPen(data2[8].x))
    .attr("cy", yPen(0))
    .attr("r", 3)
    .attr("fill", colorPen(slicedData[2].StructureCode))
    .attr("stroke", "#444")
    .attr("stroke-width", 0.4);


  var updateCurve = function(val) {
    slicedData = getDataFromCode(val);
    data2 = formatSlicedData(slicedData);

    var pweight = 0,
      pdrop = 0;
    for (aa in slicedData) {
      if (slicedData[aa] == null) {
        svgPen.select("#p" + aa)
          .datum(data2)
          .transition()
          .attr("stroke-width", 0)
          .attr("d", d3.line()
            .x(function(d) {
              return xPen(d.x)
            })
            .y(function(d) {
              return yPen(1 - d['ya'])
            })
          )

        svgPen.select("#circ-" + aa)
          .transition()
          .attr("display", "none")
        svgPen.select("#tooltip-" + aa)
          .transition()
          .attr("display", "none")
      } else {
        pweight = pweight + Number(slicedData[aa].Weight);
        pdrop = pdrop + Number(slicedData[aa].PressureDrop);

        // will produce errors for a few materials with NaN values in filtration range
        svgPen.select("#p" + aa)
          .datum(data2)
          .transition()
          .attr("stroke", colorPen(slicedData[aa].StructureCode))
          .attr("stroke-width", 2)
          .attr("d", d3.line()
            .x(function(d) {
              return xPen(d.x)
            })
            .y(function(d) {
              return yPen(1 - d['y' + aa])
            })
          )

        svgPen.select("#circ-" + aa)
          .transition()
          .attr("display", "visible")
          .attr("cx", xPen(data2[parseInt(aa) + 6]['x']))
          .attr("cy", yPen(1 - data2[parseInt(aa) + 6]['y' + aa]))
          .attr("r", 3)
          .attr("fill", colorPen(slicedData[aa].StructureCode));

        svgPen.select("#tooltip-" + aa)
          .transition()
          .attr("display", "visible")
          .attr("x", xPen(data2[parseInt(aa) + 6]['x']) - (parseInt(aa) == 0) * 8 + 4)
          .attr("y", yPen(1 - data2[parseInt(aa) + 6]['y' + aa]) + (2 - parseInt(aa)) * 7 + 4 - (parseInt(aa) == 0) * 4)
          .text(slicedData[aa].SimpleName + treatmentText(slicedData[aa]) + ' (' + slicedData[aa].CaseCode + ')');
      }
    }

    svgPen.select("#pall")
      .datum(data2)
      .transition()
      .attr("d", d3.line()
        .x(function(d) {
          return xPen(d.x)
        })
        .y(function(d) {
          return yPen(1 - d['yall'])
        })
      )

    document.getElementById("pweight").innerHTML = pweight; // estimated weight
    document.getElementById("pdrop").innerHTML = parseInt(pdrop); // estimate pressure drop

    if (pdrop < 20) {
      document.getElementById("pdrop-level").innerHTML = "Very low";
    } else if (pdrop < 35) {
      document.getElementById("pdrop-level").innerHTML = "Low";
    } else if (pdrop < 50) {
      document.getElementById("pdrop-level").innerHTML = "Moderate";
    } else if (pdrop < 65) {
      document.getElementById("pdrop-level").innerHTML = "High";
    } else {
      document.getElementById("pdrop-level").innerHTML = "Very high";
    }

    if ((pdrop <= (5 / 0.1019716 / 10 * 4.9))) {  // for overall ASTM compliance add: && ((1 - data2[0].yall) > 0.5)
      document.getElementById("ASTMlevel").innerHTML = "<b>Level 2</b> <i class='fas fa-check' style='color:rgba(1, 216, 149, 1);padding-left:2px;'></i>";
      document.getElementById("ASTMcont").style.borderColor = "rgba(1, 216, 149, 1)";  // green
      document.getElementById("ASTMcont").style.backgroundColor = "rgba(1, 216, 149, 0.01)";
    } else if ((pdrop <= (15 / 0.1019716 / 10 * 4.9))) {  // for overall ASTM compliance add: && ((1 - data2[0].yall) > 0.2)
      document.getElementById("ASTMlevel").innerHTML = "<b>Level 1</b> <i class='fas fa-check' style='color:rgba(247, 201, 28, 1);padding-left:2px;'></i>";
      document.getElementById("ASTMcont").style.borderColor = "rgba(247, 201, 28, 1)";  // yellow
      document.getElementById("ASTMcont").style.backgroundColor = "rgba(247, 201, 28, 0.021)";
    } else {
      document.getElementById("ASTMlevel").innerHTML = "<b>Non-compliant</b>";
      document.getElementById("ASTMcont").style.borderColor = "rgba(242, 52, 80, 1)";  // red
      document.getElementById("ASTMcont").style.backgroundColor = "rgba(242, 52, 80, 0.01)";
    }

  }

  updateCurve(currentCodes)

  var updateMaskColor = function(code, no) {
    if (code == "None") {
      document.getElementById("img-l" + (no + 1)).style.opacity = "0"; // select image to display
    } else {
      document.getElementById("img-l" + (no + 1)).style.opacity = "0.95"; // select image to display
      if (code[0] == "K") {
        letter = getCSSVar("--c6");
      } else if (code[0] == "W") {
        letter = getCSSVar("--c7");
      } else if (code.slice(0, 2) == "CP") {
        letter = getCSSVar("--c5");
      } else if ((code.slice(0, 3) == "nW2") || (code.slice(0, 3) == "nW3") || (code.slice(0, 3) == "nW4")) {
        letter = getCSSVar("--c1");
      } else if (code.slice(0, 2) == "nW") {
        letter = getCSSVar("--c2");
      } else {
        letter = getCSSVar("--c3");
      }
      document.getElementById("img-l" + (no + 1)).style.color = letter; // select image to display
    }

    // label image with text that displays code
    if (code != "None") {
      document.getElementById("txt-l" + (no + 1)).innerHTML = code;
    } else {
      document.getElementById("txt-l" + (no + 1)).innerHTML = "&nbsp";
    }

    if ((code.slice(0, 2) == "CP") || ((code.slice(0, 2) == "nW"))) {
      document.getElementById("txt-l" + (no + 1)).style.color = "#FFFFFF"
    } else {
      document.getElementById("txt-l" + (no + 1)).style.color = "#000000"
    }

  }
  updateMaskColor(currentCodes[0], 0) // update colours of masks show to user
  updateMaskColor(currentCodes[1], 1)
  updateMaskColor(currentCodes[2], 2)

  // dropdown menus picking different layer materials
  d3.select("#select-code").on("change", function() {
    currentCodes[0] = this.value;
    updateMaskColor(currentCodes[0], 0)
    updateCurve(currentCodes)
    updateURLCodes(currentCodes);
  })

  d3.select("#select-code2").on("change", function() {
    currentCodes[1] = this.value;
    updateMaskColor(currentCodes[1], 1)
    updateCurve(currentCodes);
    updateURLCodes(currentCodes);
  })

  d3.select("#select-code3").on("change", function() {
    currentCodes[2] = this.value;
    updateMaskColor(currentCodes[2], 2)
    updateCurve(currentCodes);
    updateURLCodes(currentCodes);
  })

})
