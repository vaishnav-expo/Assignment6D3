var width = 960,
    size = 230,
    padding = 20;

var x = d3.scaleLinear()
    .range([padding / 2, size - padding / 2]);

var y = d3.scaleLinear()
    .range([size - padding / 2, padding / 2]);

var xAxis = d3.axisBottom()
    .scale(x)
    .ticks(6);

var yAxis = d3.axisLeft()
    .scale(y)
    .ticks(6)

var color = d3.scaleOrdinal(d3.schemeCategory10);

d3.csv("video_games.csv").then((data) => {

    // var columns = ["EA", "Activision", "Ubisoft"];
    var columns = ["Atari", "Microsoft", "Midway"];
    data = data.filter(function(d, i){ return columns.includes(d["Metadata.Publishers"]) })
    console.log(data);

    dimensions = [ "Metrics.Review Score", "Metrics.Sales", "Length.Completionists.Average", "Metrics.Used Price"]
    n = dimensions.length;

    var rangeData = {};
    dimensions.forEach(function(colName) {
        rangeData[colName] = d3.extent(data, function(d) { return +d[colName]; });
    });
    console.log(rangeData);

    xAxis.tickSize(size * n);
    yAxis.tickSize(-size * n);

    var svg = d3.select("body").append("svg")
        .attr("width", size * n + padding)
        .attr("height", size * n + padding)
        .append("g")
        .attr("transform", "translate(" + padding + "," + padding / 2 + ")");

    // Heading
    svg.append("text")
        .attr("x", 430)
        .attr("y", 1)
        .attr("text-anchor", "middle")
        .style("font-size", "13px")
        .text("Scatter plot matrix of video games in years (2004-2010)");

    svg.selectAll(".x.axis")
        .data(dimensions)
        .enter().append("g")
        .attr("class", "x axis")
        .attr("transform", function(d, i) { return "translate(" + (n - i - 1) * size + ",0)"; })
        .each(function(d) { x.domain(rangeData[d]); d3.select(this).call(xAxis); });

    svg.selectAll(".y.axis")
        .data(dimensions)
        .enter().append("g")
        .attr("class", "y axis")
        .attr("transform", function(d, i) { return "translate(0," + i * size + ")"; })
        .each(function(d) { y.domain(rangeData[d]); d3.select(this).call(yAxis); });

    var cell = svg.selectAll(".cell")
        .data(cross(dimensions, dimensions))
        .enter().append("g")
        .attr("class", "cell")
        .attr("transform", function(d) { return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")"; })
        .each(plot);

    // Titles for the diagonal.
    cell.filter(function(d) { return d.i === d.j; }).append("text")
        .attr("x", padding)
        .attr("y", padding)
        .attr("dy", ".71em")
        .text(function(d) { return d.x; });

    function plot(p) {
        var cell = d3.select(this);

        x.domain(rangeData[p.x]);
        y.domain(rangeData[p.y]);

        cell.append("rect")
            .attr("class", "frame")
            .attr("x", padding / 2)
            .attr("y", padding / 2)
            .attr("width", size - padding)
            .attr("height", size - padding);

        cell.selectAll("circle")
            .data(data)
            .enter().append("circle")
            .attr("cx", function(d) { return x(d[p.x]); })
            .attr("cy", function(d) { return y(d[p.y]); })
            .attr("r", 4)
            .style("fill", function(d) { return color(d["Metadata.Publishers"]); });
    }

}).catch((error) => {
    throw error;
});


function cross(a, b) {
    var c = [], n = a.length, m = b.length, i, j;
    for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
    return c;
}