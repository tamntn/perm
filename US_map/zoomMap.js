var width = window.innerWidth,
    height = window.innerHeight,
    centered;

map();

function map(){

d3.csv('acceptanceRateByState.csv',function(error,data){
	var dataset=data;

	arrayHelp = [];
	//using nest to create a json structure with key-id
	var num_case_status =d3.nest()
						.key(function(d){ return d.Id})
						.entries(dataset)

	//changing 'key' - 'id'
	for( i in num_case_status){
			num_case_status[i].id = +num_case_status[i].key;
			arrayHelp.push(+num_case_status[i].key);//pushes to 'arrayHelp' array for future references
			delete num_case_status[i].key;
	}

	num_case_status = num_case_status.filter(function(d){ if(d.id){ return d } })

	console.log(num_case_status)
	//US map graph 
	var projection = d3.geo.albersUsa()
	    .scale(1280)
	    .translate([width / 2, height / 2]);

	var domain=[0,2,3];

	var path = d3.geo.path()
	    .projection(projection);

	var svg = d3.select("#svg_map").append("svg").attr('id','US_map') //add svg with id=US_map
	    .attr("width", width)
	    .attr("height", height);

	var colormap_P = d3.scale.linear() //Calulates color domain based on percentage
	      .domain([30,55])
	      .range(['#dddddd','#000080']);

	var colormap_N = d3.scale.linear() ////Calulates color domain based on number
	      .domain([0, d3.max(data, function(d) { return +d.Certified; })]) 
	      .range(['#dddddd','#000080']);

	d3.select('#svg_map').remove(); //help remove on update

	var svg1 = d3.select('body').append('div').attr('id','svg_map') //add div back in

	var svg = d3.select("#svg_map").append("svg").attr('id','US_map') //add svg with id=US_map back
	    .attr("width", width)
	    .attr("height", height);

	svg.append("rect")
	    .attr("class", "background")
	    .attr("width", width)
	    .attr("height", height)
	    .on("click", clicked);

	var g = svg.append("g");

	//import data for drawing the US MAP
	d3.json("https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/us.json", function(error, us) {
		if (error) throw error;

		g.append("g")
		  .attr("id", "states")
		.selectAll("path")
		  .data(topojson.feature(us, us.objects.states).features)
		.enter().append("path")
		  .attr("d", path)
		  .style('fill', function(d){ return changeColors(d);})
		  .on("click", clicked);

		g.append("path")
		  .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
		  .attr("id", "state-borders")
		  .attr("d", path);

	});


	var head_id = 0;
	var Certified = 0;
	var Denied = 0;
	var Certified_Expired = 0;
	var Withdrawn = 0;
	var total=0;
	var certified_scale = 0;

	
	//function to help change color scale across map on user request based on Percentage or number
	function changeColors(d){

		var index = arrayHelp.indexOf(+d.id); //gets the index of the id

		if (num_case_status[index]){ //if present
				head_id = num_case_status[index].id
				Certified = +num_case_status[index].values[0].Certified;
				Denied = +num_case_status[index].values[0].Denied;
				Certified_Expired = +num_case_status[index].values[0].Certified_Expired;
				Withdrawn = +num_case_status[index].values[0].Withdrawn;

				total = Certified + Denied + Certified_Expired + Withdrawn;

			if(document.getElementById('p').checked) {
  				//Percentage radio button is checked
  				
				certified_scale = Certified/total*100;

				return colormap_P(certified_scale); //return to color scale based on Percentage

			}else if(document.getElementById('n').checked) {
  				//Number radio button is checked
  				
				certified_scale = Certified

				return colormap_N(certified_scale); //return to color scale based on Number

			}
				 
		}

	}//end of changeColors()


	//On click function
	function clicked(d){
		zoom(d); //zooms in
		if(d){
			var id =0;
			id = +d.id;
			
			modal.style.display = "block";
			
			displayChart(id); //call function to display chart

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

		//function to zoom the map
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
		
		}//end of zoom()

	} //end of clicked()




    

////////////-------------  Displays Charts  -----------------//////////////

//Declare new margin, width and height for the graph inside model
var m = {top: 20, right: 30, bottom: 30, left: 40},
    w = 500 - m.left - m.right,
    h = 400 - m.top - m.bottom;



function displayChart(id){

	if (arrayHelp.indexOf(+id)!=-1){

		var index = arrayHelp.indexOf(+id);

		d3.select('#for_entries').selectAll('p').data(['a']).enter().append('p').append('h3').text('State: '+num_case_status[index].values[0].State);
		d3.select('#for_entries').selectAll('p').remove();
		d3.select('#for_entries').selectAll('p').data(['a']).enter().append('p').append('h3').text('State: '+num_case_status[index].values[0].State);
			
			
			head_id = num_case_status[index].id
			Certified = +num_case_status[index].values[0].Certified;
			Denied = +num_case_status[index].values[0].Denied;
			Certified_Expired = +num_case_status[index].values[0].Certified_Expired;
			Withdrawn = +num_case_status[index].values[0].Withdrawn;
			total = Certified + Denied + Certified_Expired + Withdrawn;
			
			if(document.getElementById('p').checked) {
				//Percentage radio button is checked
				Certified = Certified/total*100;
				Denied= Denied/total*100;
				Certified_Expired = Certified_Expired/total*100;
				Withdrawn = Withdrawn/total*100;
			}

		var data1 = [{'State':'Certified', 'Certified':Certified},
					{'State':'Denied', 'Certified':Denied},
					{'State':'Certified_Expired', 'Certified':Certified_Expired},
					{'State':'Withdrawn', 'Certified':Withdrawn}]


		var x = d3.scale.ordinal()
		    .rangeRoundBands([0, w], .1);

		var x0 = d3.scale.ordinal();

		var y = d3.scale.linear()
		    .range([h, 0]);

		var xAxis = d3.svg.axis()
		    .scale(x)
		    .orient("bottom");

		var yAxis = d3.svg.axis()
		    .scale(y)
		    .orient("left");

		var colorRange = d3.scale.category20();
		var color = d3.scale.ordinal()
    				.range(colorRange.range());

		    var chart = d3.select("svg") // initializes the group
		    .attr("width", w + m.left + m.right)
		    .attr("height", h + m.top + m.bottom)
		  .append("g")
		    .attr("transform", "translate(" + m.left + "," + m.top + ")")
		    .attr('class','helpRemove');;

		    d3.selectAll('.helpRemove').remove(); //remove the groug to update the scale

			chart = d3.select("svg") //add group back
			.attr("width", w + m.left + m.right)
		    .attr("height", h + m.top + m.bottom)
		    .append("g")
		    .attr("transform", "translate(" + m.left + "," + m.top + ")")
		    .attr('class','helpRemove');

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
		   	  .transition()
			  .duration(250)
		      .attr("class", "bar")
		      .attr("x", function(d) { return x(d.State); })
		      .attr("y", function(d) { return y(+d.Certified); })
		      .attr("height", function(d) { return h - y(+d.Certified); })
		      .attr("width", x.rangeBand())
		      .style("fill", function(d) { return color(+d.Certified); });

		   newCompare();

		   ////// ------- Add select option on model ------- ///////
		   function newCompare(){
				
				var select = d3.select('#for_entries')
						  	.append('select')
						  	.attr('id','select')
						    .on('change',onchange);

				d3.selectAll('#select').remove(); //removes the previously created select option

				var select = d3.select('#for_entries') //creates a new select option
				  	.append('select')
				  	.attr('id','select')
				    .on('change',onchange);

				var options = select.selectAll('option')
								.data(num_case_status).enter()
								.append('option')
								.attr('value',function(d){ return d.id; })
								.text(function (d){ return d.values[0].State; });

				// when a new value is selected
				function onchange() {
					selectValue = d3.select('select').property('value')
					var new_data=[num_case_status[index].values[0],num_case_status[arrayHelp.indexOf(+selectValue)].values[0]]
					// delete new_data[0].Id;
					// delete new_data[1].Id;
					// delete new_data[0].Abbreviation;
					// delete new_data[1].Abbreviation;					
					console.log(new_data);

					var options = d3.keys(new_data[0]).filter(function(key) { return (key !== "State" && key !== 'Id' && key !== 'Abbreviation') ; });
					console.log(options)

					new_data.forEach(function(d) {
    					d.valores = options.map(function(name) { return {name: name, value: +d[name]}; });
    					console.log(d.valores)
					});

					d3.selectAll('.helpRemove').remove(); //remove the groug to update the scale
					
					chart = d3.select("svg") //add group back
					.attr("width", w + 200 + m.left + m.right)
				    .attr("height", h + m.top + m.bottom)
				    .append("g")
				    .attr('width',w)
				    .attr("transform", "translate(" + m.left + "," + m.top + ")")
				    .attr('class','helpRemove')


				    x.domain(new_data.map(function(d) { return d.State; }));
				    x0.domain(options).rangeRoundBands([0, x.rangeBand()]);
					y.domain([0, d3.max(new_data, function(d) { return d3.max(d.valores, function(d) { return d.value; }); })]);

					chart.append("g")
					    .attr("class", "x axis")
					    .attr("transform", "translate(0," + h + ")")
					    .call(xAxis);

					chart.append("g")
					    .attr("class", "y axis")
					    .call(yAxis)
					    .append("text")
					    .attr("transform", "rotate(-90)")
					    .attr("y", 6)
					    .attr("dy", ".71em")
					    .style("text-anchor", "end")
					    .text("Number");

					var bar = chart.selectAll(".bar")
					    .data(new_data)
					    .enter().append("g")
					    .attr("class", "rect")
					    .attr("transform", function(d) { return "translate(" + x(d.State) + ",0)"; });

					bar.selectAll("rect")
					    .data(function(d) { return d.valores; })
					    .enter().append("rect")
					    .transition()
					    .duration(750)
					    .attr("width", x0.rangeBand())
					    .attr("x", function(d) { return x0(d.name); })
					    .attr("y", function(d) { return y(d.value); })
					    .attr("value", function(d){return d.name;})
					    .attr("height", function(d) { return h - y(d.value); })
					    .style("fill", function(d) { return color(d.name); });

					var divTooltip = d3.select("#contents").append("div").attr("class", "toolTip");

					bar.on("mousemove", function(d){
					        
					        divTooltip.style("left", d3.event.pageX+10+"px");
					        divTooltip.style("top", d3.event.pageY-25+"px");
					        divTooltip.style("display", "inline-block");
					        var x1 = d3.event.pageX, y1 = d3.event.pageY
					        var elements = document.querySelectorAll(':hover');
					        l = elements.length
					        l = l-1
					        elementData = elements[l].__data__
					        divTooltip.html((d.State)+"<br>"+elementData.name+"<br>"+elementData.value);
					
					});
					bar.on("mouseout", function(d){
					        divTooltip.style("display", "none");
					});

					var legend = chart.selectAll(".legend")
								    .data(options.slice())
								    .enter().append("g")
								    .attr("class", "legend")
								    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

					legend.append("rect")
					    .attr("x", w - 18)
					    .attr("width", 18)
					    .attr("height", 18)
					    .style("fill", color);

					legend.append("text")
					    .attr("x", w - 24)
					    .attr("y", 9)
					    .attr("dy", ".35em")
					    .style("text-anchor", "end")
					    .text(function(d) { return d; });



				} //onchange ends here

			} ///// --- select option on model ends here --- /////

			document.getElementById("select").selectedIndex = index;


		}
} //end of DisplayChart


///////////////////////////////////



}); //end of d3.csv

} //end of function map()


// function to be called when clicked on the user input radio
function mapColor() { 
    map();
}

