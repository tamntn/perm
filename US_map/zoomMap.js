var width = window.innerWidth,
    height = window.innerHeight,
    centered;


d3.csv('acceptanceRateByState.csv',function(error,data){
	var dataset=data;

	arrayHelp = [];
	var num_case_status =d3.nest()
						.key(function(d){ return d.Id})
						.entries(dataset)

	console.log(data)


for( i in num_case_status){
	num_case_status[i].id = +num_case_status[i].key;
	arrayHelp.push(+num_case_status[i].key);
	delete num_case_status[i].key;
}

console.log(num_case_status)

var projection = d3.geo.albersUsa()
    .scale(1280)
    .translate([width / 2, height / 2]);

var domain=[0,2,3];

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var color = d3.scale.linear()
      .domain([0,56])
      .range(['blue','yellow']);

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", clicked);

var g = svg.append("g");




d3.json("https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/us.json", function(error, us) {
  if (error) throw error;
  console.log(us);
  g.append("g")
      .attr("id", "states")
    .selectAll("path")
      .data(topojson.feature(us, us.objects.states).features)
    .enter().append("path")
      .attr("d", path)
      .style('fill', function(d){ return color(d.id);})
      .on("click", clicked);

  g.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      .attr("id", "state-borders")
      .attr("d", path);

  // g.append("g")
  //     .attr("id", "states")
  //   .selectAll("path")
  //     .data(data)
  //   .enter().append("path")
  //     .attr("d", path)
  // 	.style('fill', function(d){ return color(d.id) ;})

});


	function clicked(d){
		zoom(d); //zooms in
		if(d){
			var id =0;
			id = +d.id;
			console.log(id);
			
			//document.getElementById("contents").innerHTML= textDisplay(d) +'<br>';
			
			console.log(d);
			modal.style.display = "block";
			
			displayChart(id);



			// When the user clicks on <span> (x), close the modal
			span.onclick = function() {
			    modal.style.display = "none";
			    zoom(d); //zooms out
			    //location.reload();
			}

			// When the user clicks anywhere outside of the modal, close it
			window.onclick = function(event) {
			    if (event.target == modal) {
			        modal.style.display = "none";
			        zoom(d); //zooms out
			    }
			}
		}
		function zoom(d){
			var x, y, k;

		  if (d && centered !== d) {
		    var centroid = path.centroid(d);
		    x = centroid[0];
		    y = centroid[1];
		    k = 4;
		    centered = d;
		  } else {
		    x = width / 2;
		    y = height / 2;
		    k = 1;
		    centered = null;
		  }
		

		  g.selectAll("path")
		      .classed("active", centered && function(d) { return d === centered; });

		  g.transition()
		      .duration(750)
		      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
		      .style("stroke-width", 1.5 / k + "px");
		}
	}



	var head_id = 0;
	var Certified = 0;
	var Denied = 0;
	var Certified_Expired = 0;
	var Withdrawn = 0;

var m = {top: 20, right: 30, bottom: 30, left: 40},
    w = 500 - m.left - m.right,
    h = 400 - m.top - m.bottom;
    
var chart = d3.select("svg")
    .attr("width", w + m.left + m.right)
    .attr("height", h + m.top + m.bottom)
  .append("g")
    .attr("transform", "translate(" + m.left + "," + m.top + ")");
////////////-------------  Displays Charts  -----------------//////////////

function displayChart(id){

//changeVariables(id);

if (arrayHelp.indexOf(+id)!=-1){

	var index = arrayHelp.indexOf(+id);

	document.getElementById("select").selectedIndex = index;

	head_id = num_case_status[index].id
	Certified = +num_case_status[index].values[0].Certified;
	Denied = +num_case_status[index].values[0].Denied;
	Certified_Expired = +num_case_status[index].values[0].Certified_Expired;
	Withdrawn = +num_case_status[index].values[0].Withdrawn;

	total = Certified + Denied + Certified_Expired + Withdrawn;

	console.log(Certified +" "+Denied+" "+ Certified_Expired+" "+Withdrawn)

var data1 = [{'State':'Certified', 'Certified':(Certified/total)*100},
			{'State':'Denied', 'Certified':(Denied/total)*100},
			{'State':'Certified_Expired', 'Certified':(Certified_Expired/total)*100},
			{'State':'Withdrawn', 'Certified':(Withdrawn/total)*100}]


var x = d3.scale.ordinal()
    .rangeRoundBands([0, w], .1);

var y = d3.scale.linear()
    .range([h, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

    chart.remove();

	chart = d3.select("svg")
    .attr("width", w + m.left + m.right)
    .attr("height", h + m.top + m.bottom)
  .append("g")
    .attr("transform", "translate(" + m.left + "," + m.top + ")");

  x.domain(data1.map(function(d) { return d.State; }));
  y.domain([0, d3.max(data1, function(d) { return +d.Certified; })]);

  chart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + h + ")")
      .call(xAxis);

  chart.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  chart.selectAll(".bar")
      .data(data1)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.State); })
      .attr("y", function(d) { return y(+d.Certified); })
      .attr("height", function(d) { return h - y(+d.Certified); })
      .attr("width", x.rangeBand());


}
}


//////////////////////////

function updateComparasion(){
	
}











});

