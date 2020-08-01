// Test
console.log("Requesting data.");
d3.tsv("https://raw.githubusercontent.com/rushingseas8/CS498-Narrative-Visualization/master/data/AllData.csv")
    .then(function(data) {
        console.log("Data length: " + data.length);
        console.log(data[0]);
    })
;
