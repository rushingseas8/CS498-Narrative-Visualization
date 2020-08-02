var SVGWidth = 640;
var SVGHeight = 480;
var Margin = 50;

var filtered = null;

var x = null;
var y = null;
var height = null;

/*
 * Filters the data by state.
 */
function filterByState(data, state) {
    toReturn = [];
    for (var i = 0; i < data.length; i++) {
        if (data[i].Province_State === state) {
            toReturn.push(data[i]);
        }
    }
    return toReturn;
}

/*
 * Filters the data by date.
 * Use a date string in the format: "MM/DD/YYYY", with leading zeros removed.
 */
function filterByDate(data, date) {
    toReturn = [];
    for (var i = 0; i < data.length; i++) {
        if (data[i].Date === date) {
            toReturn.push(data[i]);
        }
    }
    return toReturn;
}

/*
 * Filters the data by the columns needed for the visualization.
 */
function usefulColumns(data) {
    toReturn = [];
    for (var i = 0; i < data.length; i++) {
        var elem = data[i];
        toReturn.push({
            Active: elem.Active,
            Confirmed: elem.Confirmed,
            Date: elem.Date,
            Deaths: elem.Deaths,
            Hospitalization_Rate: elem.Hospitalization_Rate,
            Province_State: elem.Province_State,
            Testing_Rate: elem.Testing_Rate
        })
    }
    return toReturn;
}

function drawLineChart(svg, data, color, attribute) {
    // X normalizes the x axis
    var x = d3.scaleLinear()
        .domain([0, data.length])
        .range([0, SVGWidth]);

    // var height = d3.scaleLinear()
    //     .domain([0, d3.max(data, function(d) { return +d["Confirmed"]; })])
    //     .range([0, SVGHeight]);

    // var tooltip = d3.select("#Tooltip");

    svg.append("path")
        .datum(data)
        .attr("id", "line" + attribute)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 5)
        .attr("d", d3.line()
            .x(function(d,i) { return x(i); })
            .y(function(d,i) { return SVGHeight - height(d[attribute]); })
        )
        // .on("mouseover", function(d,i) {
        //     var coords = d3.mouse(this);
        //     var x = Math.floor(data.length * coords[0] / SVGWidth);
        //     var y = Math.floor(data.length * coords[1] / SVGHeight);
        //     console.log(x);
        //
        //     tooltip.transition()
        //         .duration(1)
        //         .style("opacity", 0.9);
        //     tooltip.html("Date: " + data[x]["Date"] + "<br>" +
        //             attribute + ":" + data[x][attribute])
        //         .style("left", (d3.event.pageX) + "px")
        //         .style("top", (d3.event.pageY) + "px")
        //     ;
        // })
        // .on("mouseout", function(d) {
        //     tooltip.transition()
        //         .duration(2000)
        //         .style("opacity", 0);
        // })
    ;
}

var activeActive = true;
var confirmedActive = true;
var deathsActive = true;

function toggleActive() {
    activeActive = !activeActive;
    if (activeActive) {
        // $("#lineActive").show();
        // console.log();
        d3.select("#lineActive").style("opacity", 1);
    } else {
        // $("#lineActive").hide();
        d3.select("#lineActive").style("opacity", 0);
    }
    recomputeBounds();
}

function toggleConfirmed() {
    confirmedActive = !confirmedActive;
    if (confirmedActive) {
        $("#lineConfirmed").show();
    } else {
        $("#lineConfirmed").hide();
    }
    recomputeBounds();
}

function toggleDeaths() {
    deathsActive = !deathsActive;
    if (deathsActive) {
        $("#lineDeaths").show();
    } else {
        $("#lineDeaths").hide();
    }
    recomputeBounds();
}

function recomputeBounds() {
    console.log("Recomputing");
    if (filtered == undefined || filtered == null) {
        console.log("Warning: data was null. Returning!");
        return;
    }

    x = d3.scaleLinear()
        .domain([0, filtered.length])
        .range([0, SVGWidth]);

    y = d3.scaleLinear()
        .domain([0, d3.max(filtered, function(d) {
            return Math.max(
                activeActive ? d.Active : 0,
                confirmedActive ? d.Confirmed : 0,
                deathsActive ? d.Deaths : 0
            )
        })])
        .range([SVGHeight, 0]);

    height = d3.scaleLinear()
        .domain([0, d3.max(filtered, function(d) {
            return Math.max(
                activeActive ? d.Active : 0,
                confirmedActive ? d.Confirmed : 0,
                deathsActive ? d.Deaths : 0
            )
        })])
        .range([0, SVGHeight]);


    redraw(d3.select("#chart1"));

    if (activeActive) {
        d3.select("#lineActive").style("opacity", 1);
    } else {
        d3.select("#lineActive").style("opacity", 0);
    }

    if (confirmedActive) {
        d3.select("#lineConfirmed").style("opacity", 1);
    } else {
        d3.select("#lineConfirmed").style("opacity", 0);
    }

    if (deathsActive) {
        d3.select("#lineDeaths").style("opacity", 1);
    } else {
        d3.select("#lineDeaths").style("opacity", 0);
    }
}

function redraw() {
    d3.select("svg").remove();
    // d3.selectAll("path").remove();

    var svg = d3.select("#chart1")
        .append("svg")
            .attr("width", SVGWidth + (2 * Margin))
            .attr("height", SVGHeight + (2 * Margin))
        .append("g")
            .attr("transform", "translate(" + Margin + "," + Margin + ")")
            ;

    var tooltip = d3.select("#Tooltip");

    svg.append("path") // this is the black vertical line to follow mouse
         .attr("id", "mouse-line")
         .style("stroke", "black")
         .style("stroke-width", "1px")
         .style("opacity", "0")
         .style("pointer-events", "none");

    // Tooltip!
    svg.append("rect")
        .attr("width", SVGWidth + (2 * Margin))
        .attr("height", SVGHeight + (2 * Margin))
        .attr("fill", "none")
        .attr("pointer-events", "all")
        // Enable on mouse over
        .on("mouseover", function() {
            d3.select("#mouse-line").style("opacity", 1);
            d3.select("#Tooltip").style("opacity", 1);
        })
        // Disable on mouse exit
        .on("mouseout", function() {
            d3.select("#mouse-line").style("opacity", 0);
            d3.select("#Tooltip").style("opacity", 0);
        })
        // Render the right tooltip
        .on("mousemove", function(d,i) {
            var coords = d3.mouse(this);
            var x = Math.floor(filtered.length * coords[0] / SVGWidth);
            var y = Math.floor(filtered.length * coords[1] / SVGHeight);

            if (x >= filtered.length || x < 0) {
                return;
            }
            // console.log(x);

            // Vertical line position
            d3.select("#mouse-line").attr("d", "M" + coords[0] + "," + SVGHeight + " " + coords[0] + ",0")

            // tooltip.html("TESTING")
            //     .style("left", (d3.event.pageX) + "px")
            //     .style("top", (d3.event.pageY) + "px")
            //     .style("opacity", 0.9)
            // ;

            var tooltipString =
            `<div class="container">
                <div class="row">
                    <div class="col-sm text-nowrap">Date:</div>
                    <div class="col-sm text-nowrap"></div>
                    <div class="col-sm text-nowrap">${filtered[x]["Date"]}</div>
                </div>
            `;
            if (activeActive) {
                tooltipString +=
                `<div class="row">
                    <div class="col-sm text-nowrap">Active cases:</div>
                    <div class="col-sm text-nowrap"></div>
                    <div class="col-sm text-nowrap" style="color: steelblue;">${filtered[x]["Active"]}</div>
                </div>
                `;
            }
            if (confirmedActive) {
                tooltipString +=
                `<div class="row">
                    <div class="col-sm text-nowrap">Confirmed cases:</div>
                    <div class="col-sm text-nowrap"></div>
                    <div class="col-sm text-nowrap" style="color: darkgreen;">${filtered[x]["Confirmed"]}</div>
                </div>
                `;
            }
            if (deathsActive) {
                tooltipString +=
                `<div class="row">
                    <div class="col-sm text-nowrap">Deaths:</div>
                    <div class="col-sm text-nowrap"></div>
                    <div class="col-sm text-nowrap" style="color: red;">${filtered[x]["Deaths"]}</div>
                </div>
                `;
            }
            tooltipString += `
                </div>`;

            tooltip.html(tooltipString)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY) + "px")
            ;
        })
    ;

    drawLineChart(svg, filtered, "steelblue", "Active");
    drawLineChart(svg, filtered, "darkgreen", "Confirmed");
    drawLineChart(svg, filtered, "red", "Deaths");
    // drawLineChart(svg, filtered, "steelblue", "Testing_Rate");

    // Left axis
    d3.select("svg")
        .append("g")
        .attr("transform", "translate(" + Margin + ", " + Margin + ")")
        .call(d3.axisLeft(y));

    var xAxis = d3.scaleTime().domain([new Date(2020, 03, 12), new Date(2020, 06, 30)]).range([0, SVGWidth]);

    // Bottom axis
    d3.select("svg")
        .append("g")
        .attr("transform", "translate(" + Margin + ", " + (SVGHeight + Margin) + ")")
        .call(d3.axisBottom(xAxis));
}

d3.tsv("https://raw.githubusercontent.com/rushingseas8/CS498-Narrative-Visualization/gh-pages/data/AllData.csv")
    .then(function(data) {
        console.log("Data length: " + data.length);

        console.log(data[0]);
        // console.log(data[0].Date);

        // console.log(JSON.stringify(data[0]));
        // console.log("Filtering by Illinois: " + JSON.stringify(usefulColumns(filter(data, "Illinois"))));

        filtered =
            usefulColumns(
                filterByState(data, "Illinois")
            );

        console.log("Filtered: " + filtered);

        var x = d3.scaleLinear()
            .domain([0, filtered.length])
            .range([0, 500]);

        // height = d3.scaleLinear()
        //     .domain([0, d3.max(filtered, function(d) { return +d.Active; })])
        //     .range([0, 500]);
        //
        // y = d3.scaleLinear()
        //     .domain([0, d3.max(filtered, function(d) { return +d.Active; })])
        //     .range([SVGHeight, 0]);

        recomputeBounds();

        // Basic bar chart for testing
        // svg.selectAll("rect")
        //     .data(filtered)
        //     .enter()
        //     .append("rect")
        //     .attr("x", function(d,i) { return x(i); })
        //     .attr("y", function(d,i) { return 500 - height(d.Active); })
        //     .attr("width", 2)
        //     .attr("height", function(d,i) {return height(d.Active);})
        //     ;

        // svg.append("path")
        //     .datum(filtered)
        //     .attr("fill", "none")
        //     .attr("stroke", "steelblue")
        //     .attr("stroke-width", 1.5)
        //     .attr("d", d3.line()
        //         .x(function(d,i) { return x(i); })
        //         .y(function(d,i) { return 500 - height(d.Active); })
        //     )
        //     ;

        redraw();

        // svg.append("path")
        //     .datum(filtered)
        //     .attr("fill", "none")
        //     .attr("stroke", "steelblue")
        //     .attr("stroke-width", 1.5)
        //     .attr("d", d3.line()
        //         .x(function(d,i) { return x(i); })
        //         .y(function(d,i) { return 500 - height(d.Confirmed); })
        //     )
        //     ;

        console.log("Filtering by date: " + JSON.stringify(
            usefulColumns(
                filterByDate(filterByState(data, "Illinois"), "4/21/2020")
            )
        ));
    })
;
