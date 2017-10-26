var margin = {top: 20, right: 20, bottom: 120, left: 60},
    width = 2400 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);

var y = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");
   
var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");
  

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

d3.csv("main_visa_data.csv", function(error, data) {
	
  var groupData= d3.nest()
   				 .key(function(d){return d['us_economic_sector']; })
				 .rollup("len")
   				 .rollup(function(v){return v.length; })
   				 .entries(data);
	console.log(groupData);
  x.domain(groupData.map(function(d) { return d.key; }));
  y.domain([0, d3.max(groupData, function(d) { return +d.values; })]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "-.55em")
      .attr("transform", "rotate(-90)" );

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
   

  svg.selectAll("bar")
      .data(groupData)
    .enter().append("rect")
      .style("fill", "steelblue")
      .attr("x", function(d) { return x(d.key); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(+d.values); })
      .attr("height", function(d) { return height - y(+d.values); });

});