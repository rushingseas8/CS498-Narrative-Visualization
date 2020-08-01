// Test
console.log("Requesting data.");

function filter(data, state) {
    toReturn = [];
    for (var i = 0; i < data.length; i++) {
        if (data[i].Province_State === state) {
            toReturn.push(data[i]);
        }
    }
    return toReturn;
}

d3.tsv("https://raw.githubusercontent.com/rushingseas8/CS498-Narrative-Visualization/master/data/AllData.csv")
    .then(function(data) {
        console.log("Data length: " + data.length);

        console.log(data[0]);
        console.log(data[0].Date);
        console.log(data[0]["Date"]); // ???
        console.log(Object.keys(data[0])); // Get all keys
        console.log(Object.keys(data[0])[1]); // Get "Date" key
        console.log(data[0][Object.keys(data[0])[1]]);

        console.log(JSON.stringify(data[0]));
        // console.log("Filtering by Illinois: " + filter(data, "Illinois"));
    })
;
