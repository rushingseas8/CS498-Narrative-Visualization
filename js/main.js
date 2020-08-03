var SVGWidth = 640;
var SVGHeight = 480;
var Margin = 60;

var data = null;
var filtered = null;

var x = null;
var y = null;
var height = null;

var state = "Vermont";

var infoPage = 1;

var activeActive = false;
var confirmedActive = false;
var deathsActive = true;

function nextPage() {
    if (infoPage < 1 || infoPage > 3) {
        console.log("Refusing to advance page past end.");
        return;
    }

    console.log("Next page");
    d3.select("#info" + infoPage)
        .transition()
        .style("max-height", "0px")
        .style("opacity", 0)
        .duration(1000)
        ;
    if (infoPage >= 1 && infoPage <= 3) {
        infoPage++;
    }
    d3.select("#info" + infoPage)
        .transition()
        .duration(1000)
        .style("max-height", "1000px")
        .style("opacity", 1)
        ;

    if (infoPage > 1) {
        document.getElementById("prevButton").disabled = false;
    }
    if (infoPage == 3) {
        document.getElementById("nextButton").disabled = true;
    }
    updatePage();
}

function prevPage() {
    if (infoPage < 1 || infoPage > 3) {
        console.log("Refusing to advance page before start.");
        return;
    }

    console.log("Prev page");
    d3.select("#info" + infoPage)
        .transition()
        .style("max-height", "0px")
        .style("opacity", 0)
        .duration(1000)
        ;
    if (infoPage >= 1 && infoPage <= 3) {
        infoPage--;
    }
    d3.select("#info" + infoPage)
        .transition()
        .duration(1000)
        .style("max-height", "1000px")
        .style("opacity", 1)
        ;

    if (infoPage == 1) {
        document.getElementById("prevButton").disabled = true;
    }
    if (infoPage < 3) {
        document.getElementById("nextButton").disabled = false;
    }
    updatePage();
}

function updatePage() {
    if (infoPage == 1) {
        stateChange("Vermont");
        d3.select("#checkboxes").style("display", "none");
        activeActive = false;
        confirmedActive = false;
    } else if (infoPage == 2) {
        stateChange("Florida");
        d3.select("#checkboxes").style("display", "none");
        activeActive = false;
        confirmedActive = false;
    } else if (infoPage == 3) {
        stateChange("Illinois");
        d3.select("#checkboxes").style("display", "");
        activeActive = true;
        confirmedActive = true;
    }

    SVGWidth = document.getElementById("chart1").offsetWidth - (2 * Margin);
    SVGHeight = document.getElementById("chart1").offsetHeight - (2 * Margin);

    recomputeBounds();
    redraw();
    hideUnused();
}

// Resize listener to handle redrawing the graph when the window size changes
window.addEventListener("resize", function() {
    // Recompute window boundaries
    // SVGWidth = Math.max(640, document.getElementById("chart1").offsetWidth - (2 * Margin));
    // SVGHeight = Math.max(480, document.getElementById("chart1").offsetHeight - (2 * Margin));
    SVGWidth = document.getElementById("chart1").offsetWidth - (2 * Margin);
    SVGHeight = document.getElementById("chart1").offsetHeight - (2 * Margin);

    redraw();
    hideUnused();
});

/*
 * Starts the interactive presentation by removing the overlay.
 */
function removeOverlay() {
    document.getElementById("introOverlay").style.transition
    d3.select("#introOverlay")
        .transition()
        .duration(750)
        .style("opacity", 0)
        .on("end", function(x) {
            d3.select("#introOverlay").style("display", "none");
        })
        ;

}

/*
 * Filters the data by state.
 */
function filterByState(_data, state) {
    toReturn = [];
    for (var i = 0; i < _data.length; i++) {
        if (_data[i].Province_State === state) {
            toReturn.push(_data[i]);
        }
    }
    return toReturn;
}

/*
 * Filters the data by date.
 * Use a date string in the format: "MM/DD/YYYY", with leading zeros removed.
 */
function filterByDate(_data, date) {
    toReturn = [];
    for (var i = 0; i < _data.length; i++) {
        if (_data[i].Date === date) {
            toReturn.push(_data[i]);
        }
    }
    return toReturn;
}

/*
 * Filters the data by the columns needed for the visualization.
 */
function usefulColumns(_data) {
    toReturn = [];
    for (var i = 0; i < _data.length; i++) {
        var elem = _data[i];
        toReturn.push({
            Active: elem.Active,
            Confirmed: elem.Confirmed,
            Date: elem.Date,
            Deaths: elem.Deaths,
            Hospitalization_Rate: elem.Hospitalization_Rate,
            Province_State: elem.Province_State,
            Testing_Rate: elem.Testing_Rate,
            Delta_Active: elem.Delta_Active,
            Delta_Confirmed: elem.Delta_Confirmed,
            Delta_Deaths: elem.Delta_Deaths
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
        .attr("stroke-width", 2.5)
        .attr("pointer-events", "none")
        .attr("d", d3.line()
            .x(function(d,i) { return x(i); })
            .y(function(d,i) {
                if (!d[attribute]) {
                    return SVGHeight;
                }
                return SVGHeight - height(d[attribute]);
            })
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

function toggleActive() {
    activeActive = !activeActive;
    recomputeBounds();
}

function toggleConfirmed() {
    confirmedActive = !confirmedActive;
    recomputeBounds();
}

function toggleDeaths() {
    deathsActive = !deathsActive;
    recomputeBounds();
}

// Called when State dropdown changes (or when you want to update the state filter)
function stateChange(value) {
    // console.log("Selected: " + value);
    this.state = value;

    // Re-filter the data for the new state
    filtered =
        usefulColumns(
            filterByState(data, state)
        );
    // console.log("Filtered for " + state + " to get " + filtered.length + " rows.");
    // console.log(filtered);

    recomputeBounds();
    redraw();
    hideUnused();
}

function hideUnused() {
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
            var a = d.Active;
            if (!a) { a = 0; }
            var b = d.Confirmed;
            if (!b) { b = 0; }
            var c = d.Deaths;
            if (!c) { c = 0; }

            return Math.max(
                activeActive ? a : 0,
                confirmedActive ? b : 0,
                deathsActive ? c : 0
            )
        })])
        .range([SVGHeight, 0]);

    height = d3.scaleLinear()
        .domain([0, d3.max(filtered, function(d) {
            var a = d.Active;
            if (!a) { a = 0; }
            var b = d.Confirmed;
            if (!b) { b = 0; }
            var c = d.Deaths;
            if (!c) { c = 0; }

            return Math.max(
                activeActive ? a : 0,
                confirmedActive ? b : 0,
                deathsActive ? c : 0
            )
        })])
        .range([0, SVGHeight]);


    redraw(d3.select("#chart1"));
    hideUnused();
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
                .style("background", "#c7d2ffEE")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY) + "px")
            ;
        })
    ;

    drawLineChart(svg, filtered, "steelblue", "Active");
    drawLineChart(svg, filtered, "darkgreen", "Confirmed");
    drawLineChart(svg, filtered, "red", "Deaths");
    // drawLineChart(svg, filtered, "blue", "Delta_Confirmed");
    // drawLineChart(svg, filtered, "steelblue", "Testing_Rate");

    // Title
    d3.select("svg")
        .append("text")
        .attr("transform", "translate(" + (SVGWidth / 2 + 50) + "," + (Margin) + ")")
        .attr("font-size", "2rem")
        .attr("font-weight", "bold")
        .attr("text-anchor", "middle")
        .text("COVID-19 progress for " + state);

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

    // Legend title (followed by other entries)
    d3.select("svg")
        .append("text")
        .attr("x", SVGWidth - (Margin + 0) + 20)
        .attr("y", Margin + 200 + 5)
        // .attr("transform", "translate(" + "," + ")")
        .style("text-anchor", "left")
        .style("font-weight", "bold")
        .text("Legend");

    var yOffset = 75;
    if (activeActive) {
        d3.select("svg")
            .append("circle")
            .attr("cx", SVGWidth - (Margin + 0))
            .attr("cy", Margin + 150 + yOffset)
            .attr("r", 6)
            .style("fill", "steelblue");

        d3.select("svg")
            .append("text")
            .attr("x", SVGWidth - (Margin + 0) + 10)
            .attr("y", Margin + 150 + yOffset + 5)
            .style("text-anchor", "left")
            .text("Active cases");
        yOffset += 25;
    }

    if (confirmedActive) {
        d3.select("svg")
            .append("circle")
            .attr("cx", SVGWidth - (Margin + 0))
            .attr("cy", Margin + 150 + yOffset)
            .attr("r", 6)
            .style("fill", "darkgreen");

        d3.select("svg")
            .append("text")
            .attr("x", SVGWidth - (Margin + 0) + 10)
            .attr("y", Margin + 150 + yOffset + 5)
            .style("text-anchor", "left")
            .text("Confirmed cases");
        yOffset += 25;
    }

    if (deathsActive) {
        d3.select("svg")
            .append("circle")
            .attr("cx", SVGWidth - (Margin + 0))
            .attr("cy", Margin + 150 + yOffset)
            .attr("r", 6)
            .style("fill", "red");

        d3.select("svg")
            .append("text")
            .attr("x", SVGWidth - (Margin + 0) + 10)
            .attr("y", Margin + 150 + yOffset + 5)
            .style("text-anchor", "left")
            .text("Deaths");
        yOffset += 25;
    }

    if (infoPage == 1) {
        d3.select("svg")
            .append("rect")
            .attr("x", 0.53 * SVGWidth)
            .attr("y", 1.1 * Margin)
            .attr("width", 1)
            .attr("height", SVGHeight - (0.1 * Margin))
            .attr("fill", "blue")
            ;

        d3.select("svg")
            .append("text")
            .text("Reopening began June 1")
            .attr("x", (0.53 * SVGWidth) + 5)
            .attr("y", 2 * Margin + 5)
            ;
    }

    if (infoPage == 2) {
        d3.select("svg")
            .append("rect")
            .attr("x", 0.53 * SVGWidth)
            .attr("y", 2 * Margin)
            .attr("width", 1)
            .attr("height", SVGHeight - Margin)
            .attr("fill", "blue")
            ;

        d3.select("svg")
            .append("text")
            .text("Fully reopened June 1")
            .attr("x", (0.53 * SVGWidth) + 5)
            .attr("y", 2 * Margin + 5)
            ;

        d3.select("svg")
            .append("rect")
            .attr("x", 0.77 * SVGWidth)
            .attr("y", 2 * Margin)
            .attr("width", 1)
            .attr("height", SVGHeight - Margin)
            .attr("fill", "blue")
            ;

        d3.select("svg")
            .append("text")
            .text("Closing again June 26")
            .attr("x", (0.77 * SVGWidth) + 5)
            .attr("y", 2 * Margin + 5)
            ;
    }
}

d3.tsv("https://raw.githubusercontent.com/rushingseas8/CS498-Narrative-Visualization/gh-pages/data/AllData.csv")
    .then(function(_data) {
        console.log("Loaded " + _data.length + " rows.");
        // Store all the data in memory
        data = _data;

        for (var i = 0; i < data.length; i++) {
            data[i].ID = i;
        }

        // console.log(data[0]);

        var stateSet = new Set();
        for (var i = 0; i < 100; i++) {
            stateSet.add(data[i].Province_State);
        }
        // console.log(stateSet);

        // Filter by each unique state
        for (let state of stateSet) {
            var filter = filterByState(data, state);

            // console.log(filter);

            // Compute the delta between each consecutive day for each state
            data[filter[0].ID].Delta_Active = 0;
            for (var i = 1; i < filter.length; i++) {
                data[filter[i].ID].Delta_Active = Math.max(0, filter[i].Active - filter[i - 1].Active);
            }

            data[filter[0].ID].Delta_Confirmed = 0;
            for (var i = 1; i < filter.length; i++) {
                data[filter[i].ID].Delta_Confirmed = Math.max(0, filter[i].Confirmed - filter[i - 1].Confirmed);
            }

            data[filter[0].ID].Delta_Deaths = 0;
            for (var i = 1; i < filter.length; i++) {
                data[filter[i].ID].Delta_Deaths = Math.max(0, filter[i].Deaths - filter[i - 1].Deaths);
            }

        }

        // console.log(data);



        // Start by filtering the data
        filtered =
            usefulColumns(
                filterByState(data, state)
            );
        // console.log("Filtered for " + state + " to get " + filtered.length + " rows.");

        recomputeBounds();
        redraw();

        // Get the computed width of the SVG element and redraw again
        SVGWidth = document.getElementById("chart1").offsetWidth - (2 * Margin);
        SVGHeight = document.getElementById("chart1").offsetHeight - (2 * Margin);
        // recomputeBounds();
        redraw();
        hideUnused();
    })
;
