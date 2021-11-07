/**
 * CONSTANTS AND GLOBALS
 * */
 const width = 1000,
    height = 800,
    margin = { top: 20, bottom: 50, left: 60, right: 40 };
const width_1 = 1000,
    height_1 = 800,
    margin_1 = 30,
    radius_1 = 5;

let svg, 
    hoverBox,
    svg2;
let xScale;
let yScale;
let xAxis;
let xAxisGroup;
let yAxis;
let yAxisGroup;
let colorScale
/**
* APPLICATION STATE
* */

let state = {
    geojson: [],
    terrorist_state_data: [],
    all_attacks: [],
    selected_state: "Select A State",
    bargraph: []
    };
let bargraph = {
    
}
/**
* LOAD DATA
* Using a Promise.all([]), we can load more than one dataset at a time
* */
Promise.all([
 d3.json("../data/usState.json"),
 d3.csv("../Project/Data/State_Data.csv"),
 d3.csv("../Project/Data/UnitedStatesTerrorism.csv")
]).then(([geojson, terrorist_state_data, full_data]) => {
 state.geojson = geojson
 state.terrorist_state_data = terrorist_state_data
 state.full_data = full_data
//  console.log("state: ", state);
 init();
});

/**
* INITIALIZING FUNCTION
* this will be run *one time* when the data finishes loading in
* */
function init() {
 const colorScale = d3.scaleSequential()
    .interpolator(d3.interpolateOrRd)
    .domain(d3.extent(state.terrorist_state_data, d=> d['number_of_attacks']))
const attacksLookup = new Map(state.terrorist_state_data.map(d=> [
    d['States'], d['number_of_attacks']
]))

const statelookup = new Map(state.full_data.map(d=> [d['province'] , d['iyear']]))
/* SVG AND CONTAINERS */ 

console.log('statelookup :>>', statelookup);
svg = d3.select("#container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
hoverBox = d3.select("#hover-content")


const projection = d3.geoAlbersUsa()
    .fitSize([width, height], state.geojson)
const projections_world_to_state = d3.geoAlbersUsa()
    .translate([width, height])
    .scale(500)
const pathGen = d3.geoPath().projection(projection);


const usSates = svg.selectAll("path.state")
    .data(state.geojson.features)
    .join("path")
    .attr("class", "state")
    .attr("d", d => pathGen(d))
    .attr("fill", (d, i) => {
        // console.log(d)
        return colorScale(+attacksLookup.get(d.properties.NAME))
    })

/* Click Access for the Data in the Map */
const storage = state.full_data

usSates.on("click", (ev, d) => {
    state.click_state = d.properties.NAME
    state.click_info = storage.filter(function(d){
        return d.provstate == state.click_state
    });
    state.bargraph = d3.rollup(state.click_info, v => v.length, d => d.gname)
    state.bargraph.Attacks_Done = [...state.bargraph.values()]
    state.bargraph.Organizations = [...state.bargraph.keys()]
    // xScale = d3.scaleBand ()
    //     .domain(state.bargraph.Organizations)
    //     .range([margin_1, width_1 - margin_1])
    //     .padding(0.1)
    // yScale = d3.scaleBand()
    //     .domain([0, d3.max(state.bargraph, d => d.Attacks_Done)])
    //     // console.log(d3.max(state.bargraph.X))
    //     .range([height_1 - margin_1, margin_1])
        
    // xAxis = d3.axisBottom(xScale)
    // //   .tickSizeOuter(10)
    //   .scale(xScale)
    // yAxis = d3.axisLeft(yScale)
    //   .ticks(10, ",f")
    //   .scale(yScale)
    draw2();
   
})
/* 
Making the BarGraph based upon Clicked information
*/



usSates.on("mousemove", (ev, d) => {
    state.hover_state = d.properties.NAME
    state.hover_attacks = attacksLookup.get(d.properties.NAME) 
    draw();
})

svg.on("mousemove", (ev) => {
    const [mx, my] = d3.pointer(ev)
    state.x = ev.clientX;
    state.y = ev.clientY;
    state.latitude = projection.invert([mx,my])[0];
    state.longitude = projection.invert([mx, my])[1];
    draw()
})
 draw(); // calls the draw function
}

/**
* DRAW FUNCTION
* we call this every time there is an update to the data/state
* */
function draw() {
    hoverBox
        .style("top", state.y + "px")
        .style("left", state.x + "px")
        .html(
            `<div>US State: ${state.hover_state}</div>
            <div>Number of Attacks: ${state.hover_attacks}</div>`
          )
        
}   







}
// function draw2() {
//     console.log(state.bargraph)
//     console.log(state.bargraph.Organizations)
//     console.log(state.bargraph.Attacks_Done)
//     console.log(d3.max(state.bargraph.Attacks_Done))
//     console.log(xScale.bandwidth())
//     const bargraph = d3.select("#bargraph")
//         .append("svg")
//         .attr("width", width_1)
//         .attr("height", height_1) 
//         .style("background-color", "pink")
//     bargraph.select(".bar")
//         .data(state.bargraph)
//         .enter().append("rect")
//         .attr("class", "bar")
//         .attr("x", d => xScale(d.Organizations))
//         .attr("y", d => yScale(d.Attacks_Done))
//         .attr("width", xScale.bandwidth())
//         .attr("height", d => (height_1) - yScale(d.Attacks_Done) )
//         .attr("fill", "blue")
//     bargraph.append('g')
//         .call( xAxis )
//         .attr('class', 'x-axis')
//         .style("transform", `translate(0px,${height_1 - margin_1}px)`)
//         // .attr("dx", "2em")
        
//     bargraph.append('g')
//         .call(yAxis)
//         .attr('class', 'y-axis')
//         .style("transform", `translate(${margin_1}px,0px)`)
        
    /* needs an Update clauser to prevent mulitple's from being used */
}



