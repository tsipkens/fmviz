
function displayDiam(val) {

    var channel = [0.498,0.62,0.796,0.962,1.191,1.478,1.909,2.322,2.756,3.398,4.221,5.246,6.491,8.116]

    document.getElementById('da').value = channel[val - 1];
  }


// set the dimensions and margins of the graph
var margin = {top: 30, right: 50, bottom: 50, left: 60},
    width = 900 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// for tooltips
var div_tool = d3.select("body").append("div")
   .attr("class", "tooltip")
   .style("opacity", 0);

 // for legend
 var margin_legend = {top: 0, right: 50, bottom: 0, left: 60}
 var svg_legend = d3.select("#my_legend")
   .append("svg")
   .attr("width", width + margin_legend.left + margin_legend.right)
   .attr("height", 100)
   .append("g");

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.csv("https://raw.githubusercontent.com/tsipkens/fmviz/main/no2/data/fm.csv", function(data) {
  d3.csv("https://raw.githubusercontent.com/tsipkens/fmviz/main/no2/data/quality.csv", function(data2) {

    // Add X axis
    var x = d3.scaleLinear()
      .domain([0, 90])
      .range([ 0, width ]);
    var xAxis = svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));
    var xAxis2 = svg.append("g")
      .call(d3.axisTop(x));

    // Add Y axis
    var y = d3.scaleLinear()
      .domain([-0.1, 1.0])
      .range([ height, 0]);
    var yrv = d3.scaleLinear()
      .domain([1+0.1, 1-1.0])
      .range([ height, 0]); // reverse axis for penetration
    svg.append("g")
      .call(d3.axisLeft(y));
    svg.append("g")
      .attr("transform", "translate(" + width + ",0)")
      .call(d3.axisRight(yrv))



    // Color scale: give me a specie name, I return a color
    var colorkeys = [ "#FE2D4C", "#2C3CB0", "#46DDB0", "#FAC42A", "#444444"]
    var keycodes = ["W", "K", "CP", "nW", "ML" ]
    var keys = ["Woven mat. (W)", "Knit (K)", "Cut pile (CP)", "Non-woven (nW)", "Multi-layer (ML)" ]
    var color = d3.scaleOrdinal()
      .domain(keys)
      .range(colorkeys)
      // Add the isolines of quality
      var qualvec = [0.5,2,5,10,20,50,100,200,500]
      qualvec.forEach(function(qualno, idx) {
        svg.append("path")
          .datum(data2)
          .attr("fill", "none")
          .attr("stroke", "#DDDDDD")
          .attr("stroke-width", 0.5)
          .attr("class", 'Qual' + qualno)
          .attr("d", d3.line()
            .x(function(d) { return x(d.Pressure) })
            .y(function(d) { return y(d['Qual' + qualno] / 100) })
            )

        svg.append('text')
          .datum(data2)
          .html(qualno + " kPa⁻¹")
      		.attr("text-anchor", "middle")
          .attr("class", "Qlabel")
          .attr("dx", "0px")
          .attr("dy", "0px")
          .attr("x", x(-10 * idx + 85))
          .attr("y", y(1 - Math.exp(-(-10 * idx + 85) / 1000 * qualno)))
        })


        // Add X axis label:
        svg.append("text")
          .attr("text-anchor", "middle")
          .attr('x', width/2)
          .attr('y', height + 35)
          .text("Pressure drop [Pa]");

        // Y axis label:
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr('transform', 'translate(-35,' + height/2 + ')rotate(-90)')
            .text("Filtration efficiency [fraction]")
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr('transform', 'translate(' + (width + 35) + ',' + height/2 + ')rotate(90)')
            .text("Penetration [fraction]")



    // Add dots
    svg.append('g')
      .selectAll("dot")
      .data(data)
      .enter()
      .append("circle")
        .attr("cx", function (d) { return x(d.PressureDrop); } )
        .attr("cy", function (d) { return y(1 - d.Filt9); } )
        .attr("r", function (d) { return d.Weight / 150 + 2; })
        .attr("stroke", "black")
        .attr("class", function (d) { return d.StructureCode; })
        .style("fill", function (d) { return color(d.StructureCode); })
        .on('mouseover', function (d) {
             d3.select(this).transition()
                .duration('50')
                .attr('opacity', '.85');
             div_tool.transition()
                .duration(50)
                .style("opacity", 1);
             div_tool.html(d.SimpleName + ' (' + d.BasicCode + ')')
               .style("left", d3.event.pageX + "px")
               .style("top", d3.event.pageY + "px");
        })
        .on('mouseout', function (d) {
             d3.select(this).transition()
                .duration('50')
                .attr('opacity', '1');
             div_tool.transition()
                .duration('50')
                .style("opacity", 0);
        });







      // A function that update the plot for a given xlim value
      function updatePlot() {

        // Get the value of the button
        xlim = this.value

        // Update X axis
        x.domain([0,xlim])
        xAxis.transition().duration(90).call(d3.axisBottom(x))
        xAxis2.transition().duration(90).call(d3.axisTop(x))

        // Update chart
        svg.selectAll("circle")
           .data(data)
           .transition()
           .duration(100)
           .attr("cx", function (d) { return x(d.PressureDrop); } )

      }

      // Add an event listener to the button created in the html part
      d3.select("#buttonXlim").on("input", updatePlot )







      // Listen to the slider?
      d3.select("#mySlider").on("change", function(d){
        selectedNo = this.value
        updateData(selectedNo)
      })

      // A function that update the chart
      function updateData(selectedNo) {

        // Create new data with the selection?
        var dataFilter = data.map(function(d){return {
          PressureDrop:d.PressureDrop,
          value:d["Filt" + selectedNo],
          Weight:d.Weight,
          StructureCode:d.StructureCode,
          SimpleName:d.SimpleName,
          BasicCode:d.BasicCode
        }})

        // Give these new data to update plot
        svg.selectAll("circle")
           .data(dataFilter)
           .transition()
           .duration(100)
           .attr("cx", function (d) { return x(d.PressureDrop); } )
           .attr("cy", function (d) { return y(1 - d.value); } )
           .attr("r", function (d) { return d.Weight / 150 + 2; })
           .attr("stroke", "black")
           .style("fill", function (d) { return color(d.StructureCode); })
           .on('mouseover', function (d) {
                d3.select(this).transition()
                   .duration('50')
                   .attr('opacity', '.85');
                div_tool.transition()
                   .duration(50)
                   .style("opacity", 1);
                div_tool.html(d.SimpleName)
                  .style("left", d3.event.pageX + "px")
                  .style("top", d3.event.pageY + "px");
           })
           .on('mouseout', function (d) {
                d3.select(this).transition()
                   .duration('50')
                   .attr('opacity', '1');
                div_tool.transition()
                   .duration('50')
                   .style("opacity", 0);
           });

        }







        // This function is gonna change the opacity and size of selected and unselected circles
        function updateMaterial(data){

          // For each check box:
          d3.selectAll(".checkbox").each(function(d){
            cb = d3.select(this);
            mat = cb.property("value")

            // If the box is check, I show the group
            if(cb.property("checked")){
              svg.selectAll("." + mat)
                .transition()
                .duration(400)
                .style("opacity", 1)
                .attr("r", function (d) { return d.Weight / 150 + 2; })

            // Otherwise I hide it
            }else{
              svg.selectAll("." + mat)
                .transition()
                .duration(400)
                .style("opacity", 0)
                .attr("r", function (d) { return 0; })
            }
          })
        }

        // When a button change, I run the update function
        d3.selectAll(".checkbox").on("change", updateMaterial);

        // And I initialize it at the beginning
        updateMaterial();





        // Add one dot in the legend for each name.
        svg_legend.selectAll("mydots")
          .data(keys)
          .enter()
          .append("circle")
            .attr("cx", 10)
            .attr("cy", function(d,i){ return 10 + i*17}) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 5)
            .style("fill", function(d){ return color(d)})

        svg_legend.selectAll("mylabels")
          .data(keys)
          .enter()
          .append("text")
            .attr("x", 25)
            .attr("y", function(d,i){ return 10 + i*17}) // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", function(d){ return color(d)})
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")

        // Handmade legend
        svg_legend.append("circle")
          .attr("cx",200).attr("cy",10)
          .attr("r", 2.0667).style("fill", "#333333")
        svg_legend.append("circle")
          .attr("cx",200).attr("cy",30)
          .attr("r", 4).style("fill", "#333333")
        svg_legend.append("circle")
          .attr("cx",200).attr("cy",50)
          .attr("r", 8.667).style("fill", "#333333")
        svg_legend.append("text")
          .attr("x", 215).attr("y", 10)
          .text("10 g/cm2").attr("alignment-baseline","middle")
        svg_legend.append("text")
          .attr("x", 215).attr("y", 30)
          .text("300 g/cm2").attr("alignment-baseline","middle")
        svg_legend.append("text")
          .attr("x", 215).attr("y", 50)
          .text("1,000 g/cm2").attr("alignment-baseline","middle")






  })
});
