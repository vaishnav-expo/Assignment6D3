var margin = {top: 100, right: 50, bottom: 10, left: 120},
    width = 560 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

d3.csv("video_games.csv").then((data) => {

    console.log("Prev: ",data);
    var colums = ["Atari", "Rockstar", "Midway"];
    data = data.filter(function(d, i){ return colums.includes(d["Metadata.Publishers"]) })


    console.log("After: ",data);

    //Colour scale for different cities
    var color = d3.scaleOrdinal()
        .domain(["Atari,Namco", "Capcom,Rockstar", "EA,Sony"])
        .range([ "#440154ff", "#21908dff", "#fde725ff" ])

    dimensions = ["Features.Max Players", "Metrics.Review Score", "Release.Year", "Length.Completionists.Polled"]

    console.log("Dimensions : ",dimensions)
    var y = {}
    for (i in dimensions) {
        name = dimensions[i]
        y[name] = d3.scaleLinear()
            .domain( d3.extent(data, function(d) { return +d[name]; }) )
            .range([height, 0])
        console.log("name : ",i);
    }

    console.log("y",y);

    //xscale for every y axis
    x = d3.scalePoint()
        .range([0, width])
        .domain(dimensions);

    var highlight = function(e,d){

        selected_publisher = d["Metadata.Publishers"];

        // first every group turns grey
        d3.selectAll(".line")
            .transition().duration(200)
            .style("stroke", "lightgrey")
            .style("opacity", "0.2")
        // Second the hovered specie takes its color
        console.log("Hovered specie : ",d);
        d3.selectAll("." + selected_publisher)
            .transition().duration(200)
            .style("stroke", color(selected_publisher))
            .style("opacity", "1")
    }

    // Unhighlight
    var doNotHighlight = function(e,d){
        d3.selectAll(".line")
            .transition().duration(200).delay(1000)
            .style("stroke", function(d){ return( color(d["Metadata.Publishers"]))} )
            .style("opacity", "1")
    }

    // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
    function path(d) {
        return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
    }

    // Heading
    svg.append("text")
        .attr("x", 200)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .text("Parallel coordinates of video games in years (2004-2010)");

    // Draw the lines
    svg.selectAll("myPath")
        .data(data)
        .enter()
        .append("path")
        .attr("class", function (d) { return "line " + d["Metadata.Publishers"] } ) // 2 class for each line: 'line' and the group name
        .attr("d",  path)
        .style("fill", "none" )
        .style("stroke", function(d){ return( color(d["Metadata.Publishers"]))} )
        .style("opacity", 0.9)
        .on("mouseover", highlight)
        .on("mouseleave", doNotHighlight )

    // Draw the axis:
    svg.selectAll("myAxis")
        // For each dimension of the dataset I add a 'g' element:
        .data(dimensions).enter()
        .append("g")
        .attr("class", "axis")
        // I translate this element to its right position on the x axis
        .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
        // And I build the axis with the call function
        .each(function(d) { d3.select(this).call(d3.axisLeft().ticks(5).scale(y[d])); })
        // Add axis title
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function(d) { return d; })
        .style("fill", "black")

}).catch((error) => {
    throw error;
});