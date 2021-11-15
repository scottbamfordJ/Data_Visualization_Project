/**
 * CONSTANTS AND GLOBALS
 * */
 const width = 1000,
    height = 800,
    margin = { top: 20, bottom: 50, left: 60, right: 40 };
const width_1 = 1000,
    height_1 = 1000,
    margin_1 = 200,
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
    bargraph: [],
    bargraph_2: []
    };
let bargraph = {
    
}
/**
* LOAD DATA
* Using a Promise.all([]), we can load more than one dataset at a time
* */
Promise.all([
 d3.json("../data/usState.json"),
 d3.csv("../data/State_Data.csv"),
 d3.csv("../data/UnitedStatesTerrorism.csv")
]).then(([geojson, terrorist_state_data, full_data]) => {
 state.geojson = geojson
 state.terrorist_state_data = terrorist_state_data
 state.full_data = full_data
console.log("state: ", state);
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
    state.bargraph.Attacks_Done = Array.from(state.bargraph.values())
    state.bargraph.Organizations = Array.from(state.bargraph.keys())
    console.log(state.bargraph.Organizations)
    console.log(state.bargraph.Attacks_Done)
    draw_horizontal();
   
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
function draw2() {
    /* Making Hover Box Stuff */

    hover_bargraph = d3.select("#hover-bargraph")

    /* Making Scales and Axis */

    xScale = d3.scaleBand ()
        .domain(state.bargraph.Organizations)
        .range([margin_1, width_1 - margin_1])
        .padding(0.2)

    yScale = d3.scaleLinear()
        .domain([0, d3.max(state.bargraph.Attacks_Done)])
        .range([height_1 - margin_1, margin_1])  

    xAxis = d3.axisBottom(xScale)
      .scale(xScale)
    yAxis = d3.axisRight(yScale)
      .scale(yScale)
    const bargraph = d3.select("#bargraph")
        .append("svg")
        .attr("width", width_1)
        .attr("height", height_1) 
    bargraph_1 = bargraph.selectAll(".bar")
        .data(state.bargraph)
        .enter().append("rect")
        .attr("class", "bar")
        // .on("mousemove", organization_name)
        .attr("x", d => {
          return xScale(d[0])
        } )
        .attr("y",  d => yScale(d[1]))
        .attr("width", xScale.bandwidth())
        .attr("height", d =>  height_1 - margin_1 - yScale(d[1]))
        .attr("fill", "lightblue")
    bargraph.append('g')
        .call( xAxis )
        .attr('class', 'x-axis')
        .style("transform", `translate(0px,${height_1 - margin_1}px)`)
        // .attr("dx", "2em")
    
    bargraph.append('g')
        .call(yAxis)
        .attr('class', 'y-axis')
        .style("transform", `translate(${margin_1}px,0px)`)
    /* Making Hover For Name of groups? 
    
            STILL WORKING ON IT!
    */


    // function organization_name (d,i) {
    //     console.log(state.bargraph.Organizations[i])
    // }
    // bargraph_1.on("mousemove", (ev, d) => {
    //     state.bargraph.hover_bargraph = state.bargraph.Organizations
    //     state.bargraph.hover_attacks = state.bargraph.Attacks_Done
    // })
    
    /* needs an Update clauser to prevent mulitple's from being used */
}
// function get_info(e, d){}
function draw_horizontal(){
    const storage_Graph2 = state.click_info
    hover_bargraph = d3.select("#hover-bargraph")

    /* Making Scales and Axis */

    yScale = d3.scaleBand ()
        .domain(state.bargraph.Organizations)
        .range([ height_1 - margin_1, margin_1])
        .padding(0.2)

    xScale = d3.scaleLinear()
    // Using the 0, as the starting point, and having to duble subtract margins ( Look a tbargraph.append("g" style.) )
        .domain([0, d3.max(state.bargraph.Attacks_Done)])
        .range([ 0, width_1 - margin_1 - margin_1])  
    console.log(xScale.domain())
    yAxis = d3.axisRight(yScale)
      .scale(yScale)
    xAxis = d3.axisBottom(xScale)
      .scale(xScale)
    const bargraph = d3.select("#bargraph")
        .append("svg")
        .attr("width", width_1)
        .attr("height", height_1) 
    bargraph_1 = bargraph.selectAll(".bar")
        .data(state.bargraph)
        .enter().append("rect")
        .attr("class", "bar")
        // .on("mousemove", organization_name)
        .attr("y", d => {
          return yScale(d[0])
        } )
        // .attr("x",  d => yScale(d[1]))
        .attr("x",  margin_1)
        // .attr("width", d =>  width_1 - margin_1 - xScale(d[1]))
        .attr("width", d => xScale(d[1]))
        .attr("height", yScale.bandwidth)
        .attr("fill", "lightblue")

        /* on click function for the output */
        // State creation use state_click info - > refer to above. 
        .on("click", (e, d) => {
            state.Bargraph_2Seleceted = d[0]
            state.Bargraph_2info = storage_Graph2.filter(function(d){
                return d.gname == state.Bargraph_2Seleceted
                });
            storage_scatter = state.Bargraph_2info
            console.log(storage_scatter)
            state.scatter_plot_kills = d3.rollup(storage_scatter, v => d3.sum( v, d => d.nkill), d => d.iyear)
            state.scatter_plot_wounded = d3.rollup(storage_scatter, v => d3.sum(v , d => d.nwound), d => d.iyear)
            // This is where Organization Specific Information is stored. (state.Bargraph_2info)
            draw_scatter_init()
            // state.Bargraph_2 = d3.rollup(state.Bargraph_2.info, v => v.length, d => d.gname)
            // state.Bargraph_2.Attacks_Done = Array.from(state.Bargraph_2.info.values())
            // state..Bargraph_2.Organizations = Array.from(state.Bargraph_2.info.keys())
        })
        //state.click_state id's the state of the group selected
        //d is the actual organization name. 
    bargraph.append('g')
        .call( xAxis )
        .attr('class', 'x-axis')
        .style("transform", `translate(${margin_1}px,${height_1 - margin_1}px)`)
        // .attr("dx", "2em")
    
    bargraph.append('g')
        .call(yAxis)
        .attr('class', 'y-axis')
        .style("transform", `translate(${margin_1}px,0px)`)


    // xScale = d3.scaleLinear()
    //     .domain([0, d3.max(state.bargraph.Attacks_Done)])
    //     // console.log(d3.max(state.bargraph.X))
    //     .range([margin_1, width_1 - margin_1])
    // yScale = d3.scaleBand ()
    //     .domain(state.bargraph.Organizations)
    //     .range([height_1 - margin_1, margin_1])   
    //     .padding(0.1)
    // xAxis = d3.axisBottom(xScale)
    //     // .tickSizeOuter(10)
    //     .scale(xScale)
    // yAxis = d3.axisLeft(yScale)
    //   // .ticks(10, ",f")
    //   .scale(yScale)
    // const bargraph = d3.select("#bargraph")
    //   .append("svg")
    //   .attr("width", width_1)
    //   .attr("height", height_1) 
    // bargraph.selectAll(".bar")
    //     .data(state.bargraph)
    //     .enter().append("rect")
    //     .attr("class", "bar")
    //     .attr("x", d => xScale(d[1])
    //     .attr("y", d => {
    //          return yScale(d[0])
    //         }))
    //     .attr("width", yScale.bandwidth())
    //     .attr("height", d =>  width_1 - margin_1 - xScale(d[1]))
    //     .attr("fill", "black")
    // bargraph.append('g')
    //     .call( xAxis )
    //     .attr('class', 'x-axis')
    //     .style("transform", `translate(0px,${height_1 - margin_1}px)`)
    //     // .attr("dx", "2em")

    // bargraph.append('g')
    //     .call(yAxis)
    //     .attr('class', 'y-axis')
    //     .style("transform", `translate(${margin_1}px,0px)`)
    // }
}
function draw_scatter_init(){
    xScale_scatter = d3.scaleTime()
        .domain([1970, 2018])
        .range([margin_1, width_1 - margin_1])
    yScale_scatter = d3.scaleLinear()
        .domain(d3.extent(storage_scatter, d=> d.nkill))
        .range([height_1 - margin_1, margin_1])

    scatter = d3.select("#scatter-plot")
        .append("svg")
        .attr("width", width_1)
        .attr("height", height_1)
    draw_scatter()
}
function draw_scatter() {    
    //ALL INFO IS IN state.Bargraph_2info
    console.log(state.scatter_plot_wounded)
    console.log(state.scatter_plot_kills)
    const lineGen = d3.line()
        .x(d=> xScale_scatter(d.iyear))
        .y(d => yScale_scatter(state.scatter_plot_kills))
scatter.selectAll(".trend")
    .data(state.scatter_plot_kills)
    .join("path")
    .attr("class", "trend")
    .attr("stroke", "black")
    .attr("fill", "none")
    .attr("d", d => lineGen(d))




}