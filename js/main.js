// Test
console.log("Requesting data.");
d3.csv("https://gitlab.engr.illinois.edu/galeks2/cs-498-narrative-visualization/raw/master/data/AllData.csv", function(data) {
    console.log("Data length: " + data.length);
});
