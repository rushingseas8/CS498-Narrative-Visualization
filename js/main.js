var SVGWidth = 640;
var SVGHeight = 480;
var Margin = 60;

var data = null;
var filtered = null;

var x = null;
var y = null;
var height = null;

var state = "Illinois";

window.addEventListener("resize", function() {
    // Recompute window boundaries
    // SVGWidth = Math.max(640, document.getElementById("chart1").offsetWidth - (2 * Margin));
    // SVGHeight = Math.max(480, document.getElementById("chart1").offsetHeight - (2 * Margin));
    SVGWidth = document.getElementById("chart1").offsetWidth - (2 * Margin);
    SVGHeight = document.getElementById("chart1").offsetHeight - (2 * Margin);

    redraw();
});

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

function drawLineChart(svg, _data, color, attribute) {
    // X normalizes the x axis
    var x = d3.scaleLinear()
        .domain([0, _data.length])
        .range([0, SVGWidth]);

    // var height = d3.scaleLinear()
    //     .domain([0, d3.max(data, function(d) { return +d["Confirmed"]; })])
    //     .range([0, SVGHeight]);

    // var tooltip = d3.select("#Tooltip");

    svg.append("path")
        .datum(_data)
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

// Called when State dropdown changes
function stateChange(value) {
    // console.log("Selected: " + value);
    this.state = value;

    // Re-filter the data for the new state
    filtered =
        usefulColumns(
            filterByState(data, state)
        );
    // console.log("Filtered for " + state + " to get " + filtered.length + " rows.");
    console.log(filtered);

    recomputeBounds();
    redraw();
}

function recomputeBounds() {
    // console.log("Recomputing");
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

    // this is the black vertical line to follow mouse
    // Note that we have to translate by (-Margin) left!
    svg.append("path")
         .attr("id", "mouse-line")
         // .attr("transform", "translate(" + (-Margin) + "," + 0 + ")")
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
        // .attr("transform", "translate(" + (-Margin) + "," + (-Margin) + ")")
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

    // Title
    d3.select("svg")
        .append("text")
        .attr("transform", "translate(" + (SVGWidth / 2 + 35) + "," + (Margin + 35) + ")")
        .attr("font-size", "2rem")
        .attr("font-weight", "bold")
        .attr("text-anchor", "middle")
        .text("Cases/Time for " + state);

    // Left axis
    d3.select("svg")
        .append("g")
        .attr("transform", "translate(" + Margin + ", " + Margin + ")")
        .call(d3.axisLeft(y));

    // Text label for the y axis
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - Margin)
        .attr("x", 0 - (SVGHeight / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Count");

    var xAxis = d3.scaleTime().domain([new Date(2020, 03, 12), new Date(2020, 06, 30)]).range([0, SVGWidth]);

    // Bottom axis
    d3.select("svg")
        .append("g")
        .attr("transform", "translate(" + Margin + ", " + (SVGHeight + Margin) + ")")
        .call(d3.axisBottom(xAxis));

    // Text label for the x axis
    d3.select("svg")
        .append("text")
        .attr("transform", "translate(" + (SVGWidth / 2 + 35) + " ," + (SVGHeight + Margin + 35) + ")")
        .style("text-anchor", "middle")
        .text("Date");
}

d3.tsv("https://raw.githubusercontent.com/rushingseas8/CS498-Narrative-Visualization/gh-pages/data/AllData.csv")
    .then(function(_data) {
        console.log("Loaded " + _data.length + " rows.");
        // Store all the data in memory
        data = _data;

        // for (var i = 0; i < data.length; i++) {
        //     data.ID = i;
        // }



        // Start by filtering the data
        filtered =
            usefulColumns(
                filterByState(data, state)
            );
        console.log("Filtered for " + state + " to get " + filtered.length + " rows.");

        recomputeBounds();
        redraw();

        // Get the computed width of the SVG element and redraw again
        SVGWidth = document.getElementById("chart1").offsetWidth - (2 * Margin);
        SVGHeight = document.getElementById("chart1").offsetHeight - (2 * Margin);
        recomputeBounds();
        redraw();
    })
;
