function createStreamGraph() {
    // Check breakpoint
    function breakCalc(x) {
        x <= 480 ? y = 'xs' : y = 'md';
        return y;
    }

    var breakpoint = breakCalc($(window).width());

    $(window).resize(function () {
        var breakpoint = breakCalc($(window).width());
    })

    // change the height of the chart depending on the breakpoint
    function breakHeight(bp) {
        bp == 'xs' ? y = 250 : y = 500;
        return y;
    }

    // function to group by multiple properties in underscore.js
    _.groupByMulti = function (obj, values, context) {
        if (!values.length)
            return obj;
        var byFirst = _.groupBy(obj, values[0], context),
            rest = values.slice(1);
        for (var prop in byFirst) {
            byFirst[prop] = _.groupByMulti(byFirst[prop], rest, context);
        }
        return byFirst;
    };

    // function to decide whether to pluralize the word "award" in the tooltip
    function awardPlural(x) {
        x == 1 ? y = 'case' : y = 'cases';
        return y;
    }

    // funciton to determine the century of the datapoint when displaying the tooltip
    function century(x) {
        x < 100 ? y = '19' + x : y = '20' + (x.toString().substring(1));
        return y;
    }

    // function to ensure the tip doesn't hang off the side
    function tipX(x) {
        var winWidth = $(window).width();
        var tipWidth = $('.tip').width();
        if (breakpoint == 'xs') {
            x > winWidth - tipWidth - 20 ? y = x - tipWidth : y = x;
        } else {
            x > winWidth - tipWidth - 500 ? y = x + 420 - tipWidth : y = x + 450;
        }
        return y;
    }

    function dateToString(date) {
        var monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
        var month = +date.slice(0, date.length - 4);
        var year = date.slice(date.length - 4);
        var result = monthNames[month] + " " + year;
        return result;
    }



    var datearray = [];
    //PATH TO THE CSV FILE
    var csvpath = "Streamgraph/jobByMonth.csv";
    //COLOR SCHEME
    var colorrange = ['#00008b', '#280a8c', '#3b158d', '#4a1f8d', '#58298e', '#64328f', '#703b8f', '#7a4490', '#844e90', '#8f5791', '#996191', '#a36b91', '#ad7491', '#b57e91', '#bf8791', '#c89191', '#d19c90', '#dba690', '#e3af8f', '#edbb8e', '#f6c58d', '#ffcf8c'];
    strokecolor = colorrange[0];

    var format = d3.time.format("%m/%d/%y");

    var margin = { top: 20, right: 40, bottom: 80, left: 350 };
    var width = document.getElementById('streamgraph-container').offsetWidth - 30 - margin.left - margin.right;
    var height = 480 - margin.top - margin.bottom;

    //TOOLTIP
    var tooltip = d3.select(".streamchart")
        .append("div")
        .attr("class", "tip")
        .style("position", "absolute")
        .style("z-index", "200")
        .style("visibility", "hidden")
        .style("top", "10px");

    // Vertical Line
    var vertical = d3.select(".streamchart")
        .append("div")
        .attr("class", "remove")
        .style("position", "absolute")
        .style("z-index", "19")
        .style("width", "1.5px")
        .style("height", "390px")
        .style("top", "10px")
        .style("bottom", "20px")
        .style("left", "0px")
        .style("background", "red")
        .style("visibility", "hidden");

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height - 10, 0]);

    var z = d3.scale.ordinal()
        .range(colorrange);

    var color = d3.scale.category20c();

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(d3.time.months);

    var yAxis = d3.svg.axis()
        .scale(y);

    //CREATE AREAS
    var stack = d3.layout.stack()
        .offset("silhouette")
        .values(function (d) { return d.values; })
        .x(function (d) { return d.date; })
        .y(function (d) { return d.value; });

    var nest = d3.nest()
        .key(function (d) { return d.key; });

    var area = d3.svg.area()
        .interpolate("basis")
        .x(function (d) { return x(d.date); })
        .y0(function (d) { return y(d.y0); })
        .y1(function (d) { return y(d.y0 + d.y); });

    var svg = d3.select(".streamchart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var graph = d3.csv(csvpath, function (data) {
        data.forEach(function (d) {
            d.date = format.parse(d.date);
            d.value = +d.value;
        });

        var layers = stack(nest.entries(data));

        x.domain(d3.extent(data, function (d) { return d.date; }));
        y.domain([0, d3.max(data, function (d) { return d.y0 + d.y; })]);

        svg.selectAll(".layer")
            .data(layers)
            .enter().append("path")
            .attr("class", "layer")
            .attr("data-legend", function (d) { return d.key.slice(0, d.key.length - 12) }) //This function is for calling d3.legend
            .attr("d", function (d) { return area(d.values); })
            .style("fill", function (d) { return z(d.key); });
        // .style("fill", function (d, i) { return z(i); });


        //AXIS
        svg.append("g")
            .attr("class", "x streamaxis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

        svg.append("g")
            .attr("class", "y streamaxis")
            .attr("transform", "translate(" + width + ", 0)")
            .call(yAxis.orient("right"));

        svg.append("g")
            .attr("class", "y streamaxis")
            .call(yAxis.orient("left"));

        svg.selectAll(".layer")
            .attr("opacity", 1)
            .on("mouseover", function (d, i) {
                svg.selectAll(".layer").transition()
                    .duration(100)
                    .attr("opacity", function (d, j) {
                        return j != i ? 0.6 : 1;
                    })
            })
            //TOOPLTIP UPDATE
            .on("mousemove", function (d, i) {
                var color = d3.select(this).style('fill'); // need to know the color in order to generate the swatch
                console.log(color);
                mouse = d3.mouse(this);
                mousex = mouse[0];
                vertical
                    .style("left", mousex + 360 + "px")
                    .style("visibility", "visible");
                var invertedx = x.invert(mousex);
                var xDate = invertedx.getMonth() + century(invertedx.getYear());
                d.values.forEach(function (f) {
                    var date = (f.date.getMonth().toString()) + (f.date.toString()).split(' ')[3];
                    if (xDate == date) {
                        tooltip
                            .style("left", tipX(mousex) - 85 + "px")
                            .html("<div class='year'>" + dateToString(date) + "</div><div class='key'><div style='background: " + color + "' class='swatch'>&nbsp;</div>" + f.key + "</div><div class='value'>" + f.value + " " + awardPlural((f.value)) + "</div>")
                            .style("visibility", "visible");
                    }
                })

                d3.select(this)
                    .classed("hover", true)
                    .attr("stroke", strokecolor)
                    .attr("stroke-width", "0.5px");
                // tooltip.html("<p>" + d.key + "<br>" + pro + "</p>").style("visibility", "visible")
                //     .style("left", d3.event.pageX + 10 + "px").style("top", d3.event.pageY - 40 + "px")
                // ;

            })
            .on("mouseout", function (d, i) {
                svg.selectAll(".layer")
                    .transition()
                    .duration(100)
                    .attr("opacity", "1");
                d3.select(this)
                    .classed("hover", false)
                    .attr("stroke-width", "0px");
                tooltip.style("visibility", "hidden");
                vertical.style("visibility", "hidden");
            })

        //LEGEND
        legend = svg.append("g")
            .attr("class", "streamlegend")
            .attr("transform", "translate(50,30)")
            .style("font-size", "12px")
            .call(d3.legend)


    });
};