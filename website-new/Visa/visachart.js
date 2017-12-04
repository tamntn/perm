function drawVisaChart(id, file, key, value) {
    if (file.indexOf("json") >= 0) {
        d3.json(file, function (csvData) {
            var data = [],
                svg,
                defs,
                gBrush,
                brush,
                main_xScale,
                mini_xScale,
                main_yScale,
                mini_yScale,
                main_yZoom,
                main_xAxis,
                main_yAxis,
                mini_width,
                textScale;

            data = csvData;
            // for (var i = 0; i < input.length; i++) {
            //   console.log(input[i][value])
            //   var my_object = {};
            //   my_object[key] = input[i][key];
            //   my_object[value] = parseInt(input[i][value]);
            //   data.push(my_object);
            // }
            // console.log(data);

            init();
            function init() {

                //Create the random data
                // for (var i = 0; i < 40; i++) {
                //   var my_object = {};
                //   my_object[key] = i;
                //   my_object[value] = Math.floor(Math.random() * 600);
                //   data.push(my_object);
                // }//for i 
                data.sort(function (a, b) { return b[value] - a[value]; });

                console.log(data);
                /////////////////////////////////////////////////////////////
                ///////////////// Set-up SVG and wrappers ///////////////////
                /////////////////////////////////////////////////////////////

                //Added only for the mouse wheel
                var zoomer = d3.behavior.zoom()
                    .on("zoom", null);

                var main_margin = { top: 10, right: 10, bottom: 30, left: 80 },
                    main_width = 500 - main_margin.left - main_margin.right,
                    main_height = 600 - main_margin.top - main_margin.bottom;

                var mini_margin = { top: 10, right: 50, bottom: 30, left: 10 },
                    mini_height = 600 - mini_margin.top - mini_margin.bottom;
                mini_width = 140 - mini_margin.left - mini_margin.right;

                // d3.select(id).remove();
                // d3.select('#barchart-container').append('div').attr('id', id);

                svg = d3.select(id).append("svg")
                    .attr("class", "visaSVG")
                    .attr("width", main_width + main_margin.left + main_margin.right + mini_width + mini_margin.left + mini_margin.right)
                    .attr("height", main_height + main_margin.top + main_margin.bottom)
                    .call(zoomer)
                    .on("wheel.zoom", scroll)
                    //.on("mousewheel.zoom", scroll)
                    //.on("DOMMouseScroll.zoom", scroll)
                    //.on("MozMousePixelScroll.zoom", scroll)
                    //Is this needed?
                    .on("mousedown.zoom", null)
                    .on("touchstart.zoom", null)
                    .on("touchmove.zoom", null)
                    .on("touchend.zoom", null);

                var mainVisaGroup = svg.append("g")
                    .attr("class", "mainVisaGroupWrapper")
                    .attr("transform", "translate(" + main_margin.left + "," + main_margin.top + ")")
                    .append("g") //another one for the clip path - due to not wanting to clip the labels
                    .attr("clip-path", "url(#visaclip)")
                    .style("clip-path", "url(#visaclip)")
                    .attr("class", "mainVisaGroup");

                var miniVisaGroup = svg.append("g")
                    .attr("class", "miniVisaGroup")
                    .attr("transform", "translate(" + (main_margin.left + main_width + main_margin.right + mini_margin.left) + "," + mini_margin.top + ")");

                d3.selectAll('.visaBrushGroup').remove();
                var visaBrushGroup = svg.append("g")
                    .attr("class", "visaBrushGroup")
                    .attr("transform", "translate(" + (main_margin.left + main_width + main_margin.right + mini_margin.left) + "," + mini_margin.top + ")");

                /////////////////////////////////////////////////////////////
                ////////////////////// Initiate scales //////////////////////
                /////////////////////////////////////////////////////////////

                main_xScale = d3.scale.linear().range([0, main_width]);
                mini_xScale = d3.scale.linear().range([0, mini_width]);

                main_yScale = d3.scale.ordinal().rangeBands([0, main_height], 0.4, 0);
                mini_yScale = d3.scale.ordinal().rangeBands([0, mini_height], 0.4, 0);

                //Based on the idea from: http://stackoverflow.com/questions/21485339/d3-brushing-on-grouped-bar-chart
                main_yZoom = d3.scale.linear()
                    .range([0, main_height])
                    .domain([0, main_height]);

                //Create x axis object
                main_xAxis = d3.svg.axis()
                    .scale(main_xScale)
                    .orient("bottom")
                    // .ticks(4)
                    //.tickSize(0)
                    .outerTickSize(0);

                //Add group for the x axis
                d3.select(".mainVisaGroupWrapper")
                    .append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(" + 0 + "," + (main_height + 5) + ")");

                //Create y visaaxis object
                main_yAxis = d3.svg.axis()
                    .scale(main_yScale)
                    .orient("left")
                    .tickSize(0)
                    .outerTickSize(0);

                //Add group for the y visaaxis
                mainVisaGroup.append("g")
                    .attr("class", "y visaaxis")
                    .attr("transform", "translate(-5,0)");

                /////////////////////////////////////////////////////////////
                /////////////////////// Update scales ///////////////////////
                /////////////////////////////////////////////////////////////

                //Update the scales
                console.log(d3.max(data, function (d) { return d[value]; }));
                main_xScale.domain([0, d3.max(data, function (d) { return d[value]; })]);
                mini_xScale.domain([0, d3.max(data, function (d) { return d[value]; })]);
                main_yScale.domain(data.map(function (d) { return d[key]; }));
                mini_yScale.domain(data.map(function (d) { return d[key]; }));

                //Create the visual part of the y visaaxis
                d3.select(".mainVisaGroup").select(".y.visaaxis").call(main_yAxis);

                /////////////////////////////////////////////////////////////
                ///////////////////// Label axis scales /////////////////////
                /////////////////////////////////////////////////////////////

                textScale = d3.scale.linear()
                    .domain([15, 50])
                    .range([12, 6])
                    .clamp(true);

                /////////////////////////////////////////////////////////////
                ///////////////////////// Create brush //////////////////////
                /////////////////////////////////////////////////////////////

                //What should the first extent of the brush become - a bit arbitrary this
                var brushExtent = Math.max(1, Math.min(20, Math.round(data.length * 0.5)));

                brush = d3.svg.brush()
                    .y(mini_yScale)
                    .extent([mini_yScale(data[0][key]), mini_yScale(data[brushExtent][key])])
                    .on("brush", brushmove)
                //.on("brushend", brushend);

                //Set up the visual part of the brush
                gBrush = d3.select(".visaBrushGroup").append("g")
                    .attr("class", "brush")
                    .call(brush);

                gBrush.selectAll(".resize")
                    .append("line")
                    .attr("x2", mini_width);

                gBrush.selectAll(".resize")
                    .append("path")
                    .attr("d", d3.svg.symbol().type("triangle-up").size(20))
                    .attr("transform", function (d, i) {
                        return i ? "translate(" + (mini_width / 2) + "," + 4 + ") rotate(180)" : "translate(" + (mini_width / 2) + "," + -4 + ") rotate(0)";
                    });

                gBrush.selectAll("rect")
                    .attr("width", mini_width);

                //On a click recenter the brush window
                gBrush.select(".background")
                    .on("mousedown.brush", brushcenter)
                    .on("touchstart.brush", brushcenter);

                ///////////////////////////////////////////////////////////////////////////
                /////////////////// Create a rainbow gradient - for fun ///////////////////
                ///////////////////////////////////////////////////////////////////////////

                defs = svg.append("defs")

                //Create two separate gradients for the main and mini bar - just because it looks fun
                createGradient("gradient-rainbow-main", "60%");
                createGradient("gradient-rainbow-mini", "13%");

                //Add the clip path for the main bar chart
                defs.append("clipPath")
                    .attr("id", "visaclip")
                    .append("rect")
                    .attr("x", -main_margin.left)
                    .attr("width", main_width + main_margin.left)
                    .attr("height", main_height);

                /////////////////////////////////////////////////////////////
                /////////////// Set-up the mini bar chart ///////////////////
                /////////////////////////////////////////////////////////////

                //The mini brushable bar
                //DATA JOIN
                var mini_bar = d3.select(".miniVisaGroup").selectAll(".visaBar")
                    .data(data, function (d) { return d[key]; });

                //UDPATE
                mini_bar
                    .attr("width", function (d) { return mini_xScale(d[value]); })
                    .attr("y", function (d, i) { return mini_yScale(d[key]); })
                    .attr("height", mini_yScale.rangeBand());

                //ENTER
                mini_bar.enter().append("rect")
                    .attr("class", "visaBar")
                    .attr("x", 0)
                    .attr("width", function (d) { return mini_xScale(d[value]); })
                    .attr("y", function (d, i) { return mini_yScale(d[key]); })
                    .attr("height", mini_yScale.rangeBand())
                    .style("fill", "url(#gradient-rainbow-mini)");

                //EXIT
                mini_bar.exit()
                    .remove();

                //Start the brush
                gBrush.call(brush.event);

            }//init

            //Function runs on a brush move - to update the big bar chart
            function update() {

                /////////////////////////////////////////////////////////////
                ////////// Update the bars of the main bar chart ////////////
                /////////////////////////////////////////////////////////////

                //DATA JOIN
                var bar = d3.select(".mainVisaGroup").selectAll(".visaBar")
                    .data(data, function (d) { return d[key]; });

                //UPDATE
                bar
                    .attr("y", function (d, i) { return main_yScale(d[key]); })
                    .attr("height", main_yScale.rangeBand())
                    .attr("x", 0)
                    .transition().duration(500)
                    .attr("width", function (d) { return main_xScale(d[value]); });

                //ENTER
                bar.enter().append("rect")
                    .attr("class", "visaBar")
                    .style("fill", "url(#gradient-rainbow-main)")
                    .attr("y", function (d, i) { return main_yScale(d[key]); })
                    .attr("height", main_yScale.rangeBand())
                    .attr("x", 0)
                    .transition().duration(50)
                    .attr("width", function (d) { return main_xScale(d[value]); });

                //EXIT
                bar.exit()
                    .remove();

            }//update

            /////////////////////////////////////////////////////////////
            ////////////////////// Brush functions //////////////////////
            /////////////////////////////////////////////////////////////

            //First function that runs on a brush move
            function brushmove() {

                var extent = brush.extent();

                //Which bars are still "selected"
                var selected = mini_yScale.domain()
                    .filter(function (d) { return (extent[0] - mini_yScale.rangeBand() + 1e-2 <= mini_yScale(d)) && (mini_yScale(d) <= extent[1] - 1e-2); });
                //Update the colors of the mini chart - Make everything outside the brush grey
                d3.select(".miniVisaGroup").selectAll(".visaBar")
                    .style("fill", function (d, i) { return selected.indexOf(d[key]) > -1 ? "url(#gradient-rainbow-mini)" : "#e0e0e0"; });

                //Update the label size
                d3.selectAll(".y.visaaxis text")
                    .style("font-size", textScale(selected.length));

                /////////////////////////////////////////////////////////////
                ///////////////////// Update the axes ///////////////////////
                /////////////////////////////////////////////////////////////

                //Reset the part that is visible on the big chart
                var originalRange = main_yZoom.range();
                main_yZoom.domain(extent);

                //Update the domain of the x & y scale of the big bar chart
                main_yScale.domain(data.map(function (d) { return d[key]; }));
                main_yScale.rangeBands([main_yZoom(originalRange[0]), main_yZoom(originalRange[1])], 0.4, 0);

                //Update the y visaaxis of the big chart
                d3.select(".mainVisaGroup")
                    .select(".y.visaaxis")
                    .call(main_yAxis);

                //Find the new max of the bars to update the x scale
                var newMaxXScale = d3.max(data, function (d) { return selected.indexOf(d[key]) > -1 ? d[value] : 0; });
                main_xScale.domain([0, newMaxXScale]);

                //Update the x axis of the big chart
                d3.select(".mainVisaGroupWrapper")
                    .select(".x.axis")
                    .transition().duration(500)
                    .call(main_xAxis);

                //Update the big bar chart
                update();

            }//brushmove

            /////////////////////////////////////////////////////////////
            ////////////////////// Click functions //////////////////////
            /////////////////////////////////////////////////////////////

            //Based on http://bl.ocks.org/mbostock/6498000
            //What to do when the user clicks on another location along the brushable bar chart
            function brushcenter() {
                var target = d3.event.target,
                    extent = brush.extent(),
                    size = extent[1] - extent[0],
                    range = mini_yScale.range(),
                    y0 = d3.min(range) + size / 2,
                    y1 = d3.max(range) + mini_yScale.rangeBand() - size / 2,
                    center = Math.max(y0, Math.min(y1, d3.mouse(target)[1]));

                d3.event.stopPropagation();

                gBrush
                    .call(brush.extent([center - size / 2, center + size / 2]))
                    .call(brush.event);

            }//brushcenter

            /////////////////////////////////////////////////////////////
            ///////////////////// Scroll functions //////////////////////
            /////////////////////////////////////////////////////////////

            function scroll() {

                //Mouse scroll on the mini chart
                var extent = brush.extent(),
                    size = extent[1] - extent[0],
                    range = mini_yScale.range(),
                    y0 = d3.min(range),
                    y1 = d3.max(range) + mini_yScale.rangeBand(),
                    dy = d3.event.deltaY,
                    topSection;

                if (extent[0] - dy < y0) { topSection = y0; }
                else if (extent[1] - dy > y1) { topSection = y1 - size; }
                else { topSection = extent[0] - dy; }

                //Make sure the page doesn't scroll as well
                d3.event.stopPropagation();
                d3.event.preventDefault();

                gBrush
                    .call(brush.extent([topSection, topSection + size]))
                    .call(brush.event);

            }//scroll

            /////////////////////////////////////////////////////////////
            ///////////////////// Helper functions //////////////////////
            /////////////////////////////////////////////////////////////

            //Create a gradient 
            function createGradient(idName, endPerc) {

                var coloursRainbow = ["#EFB605", "#E9A501", "#E48405", "#E34914", "#DE0D2B", "#CF003E", "#B90050", "#A30F65", "#8E297E", "#724097", "#4F54A8", "#296DA4", "#0C8B8C", "#0DA471", "#39B15E", "#7EB852"];

                defs.append("linearGradient")
                    .attr("id", idName)
                    .attr("gradientUnits", "userSpaceOnUse")
                    .attr("x1", "0%").attr("y1", "0%")
                    .attr("x2", endPerc).attr("y2", "0%")
                    .selectAll("stop")
                    .data(coloursRainbow)
                    .enter().append("stop")
                    .attr("offset", function (d, i) { return i / (coloursRainbow.length - 1); })
                    .attr("stop-color", function (d) { return d; });
            }//createGradient
        });
    }
    // end if indexOf("json");
    else if (file.indexOf("csv") >= 0) {
        d3.csv(file, function (csvdata) {
            var data = [],
                svg,
                defs,
                gBrush,
                brush,
                main_xScale,
                mini_xScale,
                main_yScale,
                mini_yScale,
                main_yZoom,
                main_xAxis,
                main_yAxis,
                mini_width,
                textScale;

            input = d3.nest().entries(csvdata);
            for (var i = 0; i < input.length; i++) {
                console.log(input[i][value])
                var my_object = {};
                my_object[key] = input[i][key];
                my_object[value] = parseInt(input[i][value]);
                data.push(my_object);
            }
            // console.log(data);

            init();
            function init() {

                //Create the random data
                // for (var i = 0; i < 40; i++) {
                //   var my_object = {};
                //   my_object[key] = i;
                //   my_object[value] = Math.floor(Math.random() * 600);
                //   data.push(my_object);
                // }//for i 
                data.sort(function (a, b) { return b[value] - a[value]; });

                console.log(data);
                /////////////////////////////////////////////////////////////
                ///////////////// Set-up SVG and wrappers ///////////////////
                /////////////////////////////////////////////////////////////

                //Added only for the mouse wheel
                var zoomer = d3.behavior.zoom()
                    .on("zoom", null);

                var main_margin = { top: 10, right: 10, bottom: 30, left: 80 },
                    main_width = 500 - main_margin.left - main_margin.right,
                    main_height = 600 - main_margin.top - main_margin.bottom;

                var mini_margin = { top: 10, right: 50, bottom: 30, left: 10 },
                    mini_height = 600 - mini_margin.top - mini_margin.bottom;
                mini_width = 140 - mini_margin.left - mini_margin.right;

                // d3.select(id).remove();
                // d3.select('#barchart-container').append('div').attr('id', id);

                svg = d3.select(id).append("svg")
                    .attr("class", "visaSVG")
                    .attr("width", main_width + main_margin.left + main_margin.right + mini_width + mini_margin.left + mini_margin.right)
                    .attr("height", main_height + main_margin.top + main_margin.bottom)
                    .call(zoomer)
                    .on("wheel.zoom", scroll)
                    //.on("mousewheel.zoom", scroll)
                    //.on("DOMMouseScroll.zoom", scroll)
                    //.on("MozMousePixelScroll.zoom", scroll)
                    //Is this needed?
                    .on("mousedown.zoom", null)
                    .on("touchstart.zoom", null)
                    .on("touchmove.zoom", null)
                    .on("touchend.zoom", null);

                var mainVisaGroup = svg.append("g")
                    .attr("class", "mainVisaGroupWrapper")
                    .attr("transform", "translate(" + main_margin.left + "," + main_margin.top + ")")
                    .append("g") //another one for the clip path - due to not wanting to clip the labels
                    .attr("clip-path", "url(#visaclip)")
                    .style("clip-path", "url(#visaclip)")
                    .attr("class", "mainVisaGroup");

                var miniVisaGroup = svg.append("g")
                    .attr("class", "miniVisaGroup")
                    .attr("transform", "translate(" + (main_margin.left + main_width + main_margin.right + mini_margin.left) + "," + mini_margin.top + ")");

                d3.selectAll('.visaBrushGroup').remove();
                var visaBrushGroup = svg.append("g")
                    .attr("class", "visaBrushGroup")
                    .attr("transform", "translate(" + (main_margin.left + main_width + main_margin.right + mini_margin.left) + "," + mini_margin.top + ")");

                /////////////////////////////////////////////////////////////
                ////////////////////// Initiate scales //////////////////////
                /////////////////////////////////////////////////////////////

                main_xScale = d3.scale.linear().range([0, main_width]);
                mini_xScale = d3.scale.linear().range([0, mini_width]);

                main_yScale = d3.scale.ordinal().rangeBands([0, main_height], 0.4, 0);
                mini_yScale = d3.scale.ordinal().rangeBands([0, mini_height], 0.4, 0);

                //Based on the idea from: http://stackoverflow.com/questions/21485339/d3-brushing-on-grouped-bar-chart
                main_yZoom = d3.scale.linear()
                    .range([0, main_height])
                    .domain([0, main_height]);

                //Create x axis object
                main_xAxis = d3.svg.axis()
                    .scale(main_xScale)
                    .orient("bottom")
                    // .ticks(4)
                    //.tickSize(0)
                    .outerTickSize(0);

                //Add group for the x axis
                d3.select(".mainVisaGroupWrapper")
                    .append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(" + 0 + "," + (main_height + 5) + ")");

                //Create y visaaxis object
                main_yAxis = d3.svg.axis()
                    .scale(main_yScale)
                    .orient("left")
                    .tickSize(0)
                    .outerTickSize(0);

                //Add group for the y visaaxis
                mainVisaGroup.append("g")
                    .attr("class", "y visaaxis")
                    .attr("transform", "translate(-5,0)");

                /////////////////////////////////////////////////////////////
                /////////////////////// Update scales ///////////////////////
                /////////////////////////////////////////////////////////////

                //Update the scales
                console.log(d3.max(data, function (d) { return d[value]; }));
                main_xScale.domain([0, d3.max(data, function (d) { return d[value]; })]);
                mini_xScale.domain([0, d3.max(data, function (d) { return d[value]; })]);
                main_yScale.domain(data.map(function (d) { return d[key]; }));
                mini_yScale.domain(data.map(function (d) { return d[key]; }));

                //Create the visual part of the y visaaxis
                d3.select(".mainVisaGroup").select(".y.visaaxis").call(main_yAxis);

                /////////////////////////////////////////////////////////////
                ///////////////////// Label axis scales /////////////////////
                /////////////////////////////////////////////////////////////

                textScale = d3.scale.linear()
                    .domain([15, 50])
                    .range([12, 6])
                    .clamp(true);

                /////////////////////////////////////////////////////////////
                ///////////////////////// Create brush //////////////////////
                /////////////////////////////////////////////////////////////

                //What should the first extent of the brush become - a bit arbitrary this
                var brushExtent = Math.max(1, Math.min(20, Math.round(data.length * 0.5)));

                brush = d3.svg.brush()
                    .y(mini_yScale)
                    .extent([mini_yScale(data[0][key]), mini_yScale(data[brushExtent][key])])
                    .on("brush", brushmove)
                //.on("brushend", brushend);

                //Set up the visual part of the brush
                gBrush = d3.select(".visaBrushGroup").append("g")
                    .attr("class", "brush")
                    .call(brush);

                gBrush.selectAll(".resize")
                    .append("line")
                    .attr("x2", mini_width);

                gBrush.selectAll(".resize")
                    .append("path")
                    .attr("d", d3.svg.symbol().type("triangle-up").size(20))
                    .attr("transform", function (d, i) {
                        return i ? "translate(" + (mini_width / 2) + "," + 4 + ") rotate(180)" : "translate(" + (mini_width / 2) + "," + -4 + ") rotate(0)";
                    });

                gBrush.selectAll("rect")
                    .attr("width", mini_width);

                //On a click recenter the brush window
                gBrush.select(".background")
                    .on("mousedown.brush", brushcenter)
                    .on("touchstart.brush", brushcenter);

                ///////////////////////////////////////////////////////////////////////////
                /////////////////// Create a rainbow gradient - for fun ///////////////////
                ///////////////////////////////////////////////////////////////////////////

                defs = svg.append("defs")

                //Create two separate gradients for the main and mini bar - just because it looks fun
                createGradient("gradient-rainbow-main", "60%");
                createGradient("gradient-rainbow-mini", "13%");

                //Add the clip path for the main bar chart
                defs.append("clipPath")
                    .attr("id", "visaclip")
                    .append("rect")
                    .attr("x", -main_margin.left)
                    .attr("width", main_width + main_margin.left)
                    .attr("height", main_height);

                /////////////////////////////////////////////////////////////
                /////////////// Set-up the mini bar chart ///////////////////
                /////////////////////////////////////////////////////////////

                //The mini brushable bar
                //DATA JOIN
                var mini_bar = d3.select(".miniVisaGroup").selectAll(".visaBar")
                    .data(data, function (d) { return d[key]; });

                //UDPATE
                mini_bar
                    .attr("width", function (d) { return mini_xScale(d[value]); })
                    .attr("y", function (d, i) { return mini_yScale(d[key]); })
                    .attr("height", mini_yScale.rangeBand());

                //ENTER
                mini_bar.enter().append("rect")
                    .attr("class", "visaBar")
                    .attr("x", 0)
                    .attr("width", function (d) { return mini_xScale(d[value]); })
                    .attr("y", function (d, i) { return mini_yScale(d[key]); })
                    .attr("height", mini_yScale.rangeBand())
                    .style("fill", "url(#gradient-rainbow-mini)");

                //EXIT
                mini_bar.exit()
                    .remove();

                //Start the brush
                gBrush.call(brush.event);

            }//init

            //Function runs on a brush move - to update the big bar chart
            function update() {

                /////////////////////////////////////////////////////////////
                ////////// Update the bars of the main bar chart ////////////
                /////////////////////////////////////////////////////////////

                //DATA JOIN
                var bar = d3.select(".mainVisaGroup").selectAll(".visaBar")
                    .data(data, function (d) { return d[key]; });

                //UPDATE
                bar
                    .attr("y", function (d, i) { return main_yScale(d[key]); })
                    .attr("height", main_yScale.rangeBand())
                    .attr("x", 0)
                    .transition().duration(500)
                    .attr("width", function (d) { return main_xScale(d[value]); });

                //ENTER
                bar.enter().append("rect")
                    .attr("class", "visaBar")
                    .style("fill", "url(#gradient-rainbow-main)")
                    .attr("y", function (d, i) { return main_yScale(d[key]); })
                    .attr("height", main_yScale.rangeBand())
                    .attr("x", 0)
                    .transition().duration(50)
                    .attr("width", function (d) { return main_xScale(d[value]); });

                //EXIT
                bar.exit()
                    .remove();

            }//update

            /////////////////////////////////////////////////////////////
            ////////////////////// Brush functions //////////////////////
            /////////////////////////////////////////////////////////////

            //First function that runs on a brush move
            function brushmove() {

                var extent = brush.extent();

                //Which bars are still "selected"
                var selected = mini_yScale.domain()
                    .filter(function (d) { return (extent[0] - mini_yScale.rangeBand() + 1e-2 <= mini_yScale(d)) && (mini_yScale(d) <= extent[1] - 1e-2); });
                //Update the colors of the mini chart - Make everything outside the brush grey
                d3.select(".miniVisaGroup").selectAll(".visaBar")
                    .style("fill", function (d, i) { return selected.indexOf(d[key]) > -1 ? "url(#gradient-rainbow-mini)" : "#e0e0e0"; });

                //Update the label size
                d3.selectAll(".y.visaaxis text")
                    .style("font-size", textScale(selected.length));

                /////////////////////////////////////////////////////////////
                ///////////////////// Update the axes ///////////////////////
                /////////////////////////////////////////////////////////////

                //Reset the part that is visible on the big chart
                var originalRange = main_yZoom.range();
                main_yZoom.domain(extent);

                //Update the domain of the x & y scale of the big bar chart
                main_yScale.domain(data.map(function (d) { return d[key]; }));
                main_yScale.rangeBands([main_yZoom(originalRange[0]), main_yZoom(originalRange[1])], 0.4, 0);

                //Update the y visaaxis of the big chart
                d3.select(".mainVisaGroup")
                    .select(".y.visaaxis")
                    .call(main_yAxis);

                //Find the new max of the bars to update the x scale
                var newMaxXScale = d3.max(data, function (d) { return selected.indexOf(d[key]) > -1 ? d[value] : 0; });
                main_xScale.domain([0, newMaxXScale]);

                //Update the x axis of the big chart
                d3.select(".mainVisaGroupWrapper")
                    .select(".x.axis")
                    .transition().duration(500)
                    .call(main_xAxis);

                //Update the big bar chart
                update();

            }//brushmove

            /////////////////////////////////////////////////////////////
            ////////////////////// Click functions //////////////////////
            /////////////////////////////////////////////////////////////

            //Based on http://bl.ocks.org/mbostock/6498000
            //What to do when the user clicks on another location along the brushable bar chart
            function brushcenter() {
                var target = d3.event.target,
                    extent = brush.extent(),
                    size = extent[1] - extent[0],
                    range = mini_yScale.range(),
                    y0 = d3.min(range) + size / 2,
                    y1 = d3.max(range) + mini_yScale.rangeBand() - size / 2,
                    center = Math.max(y0, Math.min(y1, d3.mouse(target)[1]));

                d3.event.stopPropagation();

                gBrush
                    .call(brush.extent([center - size / 2, center + size / 2]))
                    .call(brush.event);

            }//brushcenter

            /////////////////////////////////////////////////////////////
            ///////////////////// Scroll functions //////////////////////
            /////////////////////////////////////////////////////////////

            function scroll() {

                //Mouse scroll on the mini chart
                var extent = brush.extent(),
                    size = extent[1] - extent[0],
                    range = mini_yScale.range(),
                    y0 = d3.min(range),
                    y1 = d3.max(range) + mini_yScale.rangeBand(),
                    dy = d3.event.deltaY,
                    topSection;

                if (extent[0] - dy < y0) { topSection = y0; }
                else if (extent[1] - dy > y1) { topSection = y1 - size; }
                else { topSection = extent[0] - dy; }

                //Make sure the page doesn't scroll as well
                d3.event.stopPropagation();
                d3.event.preventDefault();

                gBrush
                    .call(brush.extent([topSection, topSection + size]))
                    .call(brush.event);

            }//scroll

            /////////////////////////////////////////////////////////////
            ///////////////////// Helper functions //////////////////////
            /////////////////////////////////////////////////////////////

            //Create a gradient 
            function createGradient(idName, endPerc) {

                var coloursRainbow = ["#EFB605", "#E9A501", "#E48405", "#E34914", "#DE0D2B", "#CF003E", "#B90050", "#A30F65", "#8E297E", "#724097", "#4F54A8", "#296DA4", "#0C8B8C", "#0DA471", "#39B15E", "#7EB852"];

                defs.append("linearGradient")
                    .attr("id", idName)
                    .attr("gradientUnits", "userSpaceOnUse")
                    .attr("x1", "0%").attr("y1", "0%")
                    .attr("x2", endPerc).attr("y2", "0%")
                    .selectAll("stop")
                    .data(coloursRainbow)
                    .enter().append("stop")
                    .attr("offset", function (d, i) { return i / (coloursRainbow.length - 1); })
                    .attr("stop-color", function (d) { return d; });
            }//createGradient
        });
    }
};
