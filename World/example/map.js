		

d3.csv("main_visa_data.csv", function(error, data) {
	
 var groupData= d3.nest()
   				 .key(function(d){return d['employer_state']; })
				 .rollup("len")
   				 .rollup(function(v){return v.length; })
   				 .entries(data);

function tooltipHtml(n, d){	/* function to create html content string in tooltip div. */
		return "<h4>"+n+"</h4><table>"+
			"<tr><td>No of cases</td><td>"+(d.no_of_cases)+"</td></tr>"+
			"</table>";
	}
	var no_of_cases
	count=0
	var sampleData ={};	/* Sample random data. */	
	["HI", "AK", "FL", "SC", "GA", "AL", "NC", "TN", "RI", "CT", "MA",
	"ME", "NH", "VT", "NY", "NJ", "PA", "DE", "MD", "WV", "KY", "OH", 
	"MI", "WY", "MT", "ID", "WA", "DC", "TX", "CA", "AZ", "NV", "UT", 
	"CO", "NM", "OR", "ND", "SD", "NE", "IA", "MS", "IN", "IL", "MN", 
	"WI", "MO", "AR", "OK", "KS", "LS", "VA"].forEach(function(d){ 
			no_of_cases=groupData[count]['values'], 
			sampleData[d]={no_of_cases, color:d3.interpolate("#ffffff", "#34000f")(no_of_cases/5000)}; 
			//
			count=count+1;
		});
	console.log(d3.max(groupData, function(d) {
	 return +d['values'] }));
	/* draw states on id #statesvg */	
	uStates.draw("#statesvg", sampleData, tooltipHtml);
	d3.select(self.frameElement).style("height", "800px"); 




});