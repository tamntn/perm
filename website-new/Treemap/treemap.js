
var divWidth = document.getElementById('treemap').offsetWidth;

window.addEventListener('message', function (e) {
    var opts = e.data.opts,
        data = e.data.data;

    return main(opts, data);
});

var defaults = {
    margin: { top: 24, right: 0, bottom: 0, left: 0 },
    rootname: "TOP",
    format: ",d",
    title: "",
    width: divWidth,
    height: divWidth * 1 / 2
};

function main(o, data) {
    var root,
        opts = $.extend(true, {}, defaults, o),
        formatNumber = d3.format(opts.format),
        rname = opts.rootname,
        margin = opts.margin,
        theight = 36 + 16;

    $('#treemap').width(opts.width).height(opts.height);
    var width = opts.width - margin.left - margin.right,
        height = opts.height - margin.top - margin.bottom,
        transitioning;

    var color = d3.scale.category20();

    var x = d3.scale.linear()
        .domain([0, width])
        .range([0, width]);

    var y = d3.scale.linear()
        .domain([0, height])
        .range([0, height]);

    var treemap = d3.layout.treemap()
        .children(function (d, depth) { return depth ? null : d._children; })
        .sort(function (a, b) { return a.value - b.value; })
        .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
        .round(false);

    // Removing and adding new chart (in case for use with radio button)
    d3.select("#treemap").remove();
    d3.select("#treemap-container").append('div').attr('id', 'treemap');

    var svg = d3.select("#treemap").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.bottom + margin.top)
        .style("margin-left", -margin.left + "px")
        .style("margin.right", -margin.right + "px")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .style("shape-rendering", "crispEdges");

    // Creating zoom-out bar
    var grandparent = svg.append("g")
        .attr("class", "grandparent");

    grandparent.append("rect")
        .attr("y", -margin.top)
        .attr("width", width)
        .attr("height", margin.top);

    grandparent.append("text")
        .attr("x", 6)
        .attr("y", 6 - margin.top)
        .attr("dy", ".75em");

    // Add Treemap Title
    // if (opts.title) {
    //     $("#treemap").prepend("<p class='title'>" + opts.title + "</p>");
    // }
    if (data instanceof Array) {
        root = { key: rname, values: data };
    } else {
        root = data;
    }

    initialize(root);
    accumulate(root);
    layout(root);
    console.log(root);
    display(root);

    if (window.parent !== window) {
        var myheight = document.documentElement.scrollHeight || document.body.scrollHeight;
        window.parent.postMessage({ height: myheight }, '*');
    }

    function initialize(root) {
        root.x = root.y = 0;
        root.dx = width;
        root.dy = height;
        root.depth = 0;
    }

    // Aggregate the values for internal nodes. This is normally done by the
    // treemap layout, but not here because of our custom implementation.
    // We also take a snapshot of the original children (_children) to avoid
    // the children being overwritten when when layout is computed.
    function accumulate(d) {
        return (d._children = d.values)
            ? d.value = d.values.reduce(function (p, v) { return p + accumulate(v); }, 0)
            : d.value;
    }

    // Compute the treemap layout recursively such that each group of siblings
    // uses the same size (1×1) rather than the dimensions of the parent cell.
    // This optimizes the layout for the current zoom state. Note that a wrapper
    // object is created for the parent node for each group of siblings so that
    // the parent’s dimensions are not discarded as we recurse. Since each group
    // of sibling was laid out in 1×1, we must rescale to fit using absolute
    // coordinates. This lets us use a viewport to zoom.
    function layout(d) {
        if (d._children) {
            treemap.nodes({ _children: d._children });
            d._children.forEach(function (c) {
                c.x = d.x + c.x * d.dx;
                c.y = d.y + c.y * d.dy;
                c.dx *= d.dx;
                c.dy *= d.dy;
                c.parent = d;
                layout(c);
            });
        }
    }

    // Function to pick color for node:
    // We generate color for main group from a list of color
    // This is to make sure that the main group has the same color across multilpe visualizations
    // The color for subgroup and each job is generate randomly
    function pickcolor(k) {
        var colorrange = ['#00008b', '#280a8c', '#3b158d', '#4a1f8d', '#58298e', '#64328f', '#703b8f', '#7a4490', '#844e90', '#8f5791', '#996191', '#a36b91', '#ad7491', '#b57e91', '#bf8791', '#c89191', '#d19c90', '#dba690', '#e3af8f', '#edbb8e', '#f6c58d', '#ffcf8c'];
        var jobGroup = [
            "Computer and Mathematical Occupations",
            "Architecture and Engineering Occupations",
            "Management Occupations",
            "Business and Financial Operations Occupations",
            "Healthcare Practitioners and Technical Occupations",
            "Education, Training, and Library Occupations",
            "Production Occupations",
            "Life Physical and Social Science Occupations",
            "Food Preparation and Serving Related Occupations",
            "Arts, Design, Entertainment, Sports, and Media Occupations",
            "Sales and Related Occupations",
            "Office and Administrative Support Occupations",
            "Building and Grounds Cleaning and Maintenance Occupations",
            "Community and Social Service Occupations",
            "Legal Occupations",
            "Healthcare Support Occupations",
            "Installation, Maintenance, and Repair Occupations",
            "Personal Care and Service Occupations",
            "Transportation and Material Moving Occupations",
            "Farming, Fishing, and Forestry Occupations",
            "Construction and Extraction Occupations",
            "Protective Service Occupations"
        ];
        var index = jobGroup.indexOf(k);
        if (index > -1) {
            return colorrange[index];
        }
        else {
            return color(k);
        }
    }

    function display(d) {
        grandparent
            .datum(d.parent)
            .on("click", transition)
            .select("text")
            .text(name(d));

        var g1 = svg.insert("g", ".grandparent")
            .datum(d)
            .attr("class", "depth");

        // mousemove function
        var mousemove = function (d) {
            var xPosition = d3.event.pageX + 5;
            var yPosition = d3.event.pageY + 5;

            d3.select("#tooltip")
                .style("left", xPosition + "px")
                .style("top", yPosition + "px");
            d3.select("#tooltip #heading")
                .text("Hello");
            d3.select("#tooltip").classed("hidden", false);
        };

        var g = g1.selectAll("g")
            .data(d._children)
            .enter().append("g");

        g.filter(function (d) { return d._children; })
            .classed("children", true)
            .on("click", transition);

        var children = g.selectAll(".child")
            .data(function (d) { return d._children || [d]; })
            .enter().append("g");

        children.append("rect")
            .attr("class", "child")
            .call(rect)
            .append("title")
            .text(function (d) { return d.key + " (" + formatNumber(d.value) + ")"; }); // Creating hover text

        children.append("text")
            .attr("class", "ctext")
            .text(function (d) { return d.key; })
            .call(text2);

        g.append("rect")
            .attr("class", "parent")
            .call(rect);

        var t = g.append("text")
            .attr("class", "ptext")
            .attr("dy", ".75em")

        t.append("tspan")
            .text(function (d) { return d.key; });
        t.append("tspan")
            .attr("dy", "1.0em")
            .text(function (d) { return formatNumber(d.value); });
        t.call(text);

        g.selectAll("rect")
            .style("fill", function (d) { return pickcolor(d.key); });

        function transition(d) {
            if (transitioning || !d) return;
            transitioning = true;

            var g2 = display(d),
                t1 = g1.transition().duration(750),
                t2 = g2.transition().duration(750);

            // Update the domain only after entering new elements.
            x.domain([d.x, d.x + d.dx]);
            y.domain([d.y, d.y + d.dy]);

            // Enable anti-aliasing during the transition.
            svg.style("shape-rendering", null);

            // Draw child nodes on top of parent nodes.
            svg.selectAll(".depth").sort(function (a, b) { return a.depth - b.depth; });

            // Fade-in entering text.
            g2.selectAll("text").style("fill-opacity", 0);

            // Transition to the new view.
            t1.selectAll(".ptext").call(text).style("fill-opacity", 0);
            t1.selectAll(".ctext").call(text2).style("fill-opacity", 0);
            t2.selectAll(".ptext").call(text).style("fill-opacity", 1);
            t2.selectAll(".ctext").call(text2).style("fill-opacity", 1);
            t1.selectAll("rect").call(rect);
            t2.selectAll("rect").call(rect);

            // Remove the old node when the transition is finished.
            t1.remove().each("end", function () {
                svg.style("shape-rendering", "crispEdges");
                transitioning = false;
            });
        }

        return g;
    }

    // Function for text opacity if text gets longer than rect
    function text(text) {
        text.selectAll("tspan")
            .attr("x", function (d) { return x(d.x) + 6; })
        text.attr("x", function (d) { return x(d.x) + 6; })
            .attr("y", function (d) { return y(d.y) + 6; })
            .style("opacity", function (d) { return this.getComputedTextLength() < x(d.x + d.dx) - x(d.x) ? 1 : 0; });
    }

    function text2(text) {
        text.attr("x", function (d) { return x(d.x + d.dx) - this.getComputedTextLength() - 6; })
            .attr("y", function (d) { return y(d.y + d.dy) - 6; })
            .style("opacity", function (d) { return this.getComputedTextLength() < x(d.x + d.dx) - x(d.x) ? 1 : 0; });
    }

    function rect(rect) {
        rect.attr("x", function (d) { return x(d.x); })
            .attr("y", function (d) { return y(d.y); })
            .attr("width", function (d) { return x(d.x + d.dx) - x(d.x); })
            .attr("height", function (d) { return y(d.y + d.dy) - y(d.y); });
    }

    function name(d) {
        return d.parent
            ? name(d.parent) + " / " + d.key + " (" + formatNumber(d.value) + ")"
            : d.key + " (" + formatNumber(d.value) + ")";
    }
}

if (document.getElementById('treemap-radio-total').checked) {
    //Percentage radio button is checked
    if (window.location.hash === "") {
        d3.json("Treemap/treemapTOTAL.json", function (err, res) {
            if (!err) {
                console.log(res);
                var data = d3.nest().key(function (d) { return d.group; }).key(function (d) { return d.subgroup; }).entries(res);
                main({ title: "Job Overview" }, { key: "All Jobs", values: data });
            }
        });
    }
} else if (document.getElementById('treemap-radio-certified').checked) {
    //Number radio button is checked
    if (window.location.hash === "") {
        d3.json("Treemap/treemapCERT.json", function (err, res) {
            if (!err) {
                console.log(res);
                var data = d3.nest().key(function (d) { return d.group; }).key(function (d) { return d.subgroup; }).entries(res);
                main({ title: "Job Overview" }, { key: "All Jobs", values: data });
            }
        });
    }
} else if (document.getElementById('treemap-radio-wage').checked) {
    //Number radio button is checked
    if (window.location.hash === "") {
        d3.json("Treemap/treemapWAGE.json", function (err, res) {
            if (!err) {
                console.log(res);
                var data = d3.nest().key(function (d) { return d.group; }).key(function (d) { return d.subgroup; }).entries(res);
                main({ title: "Job Overview" }, { key: "All Jobs", values: data });
            }
        });
    }
};

// Function to update using radio button
function updateTreeMap() {
    if (document.getElementById('treemap-radio-total').checked) {
        //Percentage radio button is checked
        if (window.location.hash === "") {
            d3.json("Treemap/treemapTOTAL.json", function (err, res) {
                if (!err) {
                    console.log(res);
                    var data = d3.nest().key(function (d) { return d.group; }).key(function (d) { return d.subgroup; }).entries(res);
                    main({ title: "Job Overview" }, { key: "All Jobs", values: data });
                }
            });
        }
    } else if (document.getElementById('treemap-radio-certified').checked) {
        //Number radio button is checked
        if (window.location.hash === "") {
            d3.json("Treemap/treemapCERT.json", function (err, res) {
                if (!err) {
                    console.log(res);
                    var data = d3.nest().key(function (d) { return d.group; }).key(function (d) { return d.subgroup; }).entries(res);
                    main({ title: "Job Overview" }, { key: "All Jobs", values: data });
                }
            });
        }
    } else if (document.getElementById('treemap-radio-wage').checked) {
        //Number radio button is checked
        if (window.location.hash === "") {
            d3.json("Treemap/treemapWAGE.json", function (err, res) {
                if (!err) {
                    console.log(res);
                    var data = d3.nest().key(function (d) { return d.group; }).key(function (d) { return d.subgroup; }).entries(res);
                    main({ title: "Job Overview" }, { key: "All Jobs", values: data });
                }
            });
        }
    };
}