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
    console.log(state.bargraph.Attacks_Done)
    state.bargraph.Organizations = Array.from(state.bargraph.keys())
    console.log(state.bargraph.Organizations)
    console.log(state.bargraph.Attacks_Done)
    bargraph_init();
   
})



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

function bargraph_init(){
    
    yScale = d3.scaleBand ()
        .domain(state.bargraph.Organizations)
        .range([ height_1 - margin_1, margin_1])
        .padding(0.2)
    xScale = d3.scaleLinear()
        .domain([0, d3.max(state.bargraph.Attacks_Done)])
        .range([ 0, width_1 - margin_1 - margin_1])  
    yAxis = d3.axisRight(yScale)
        .scale(yScale)
    xAxis = d3.axisBottom(xScale)
        .scale(xScale)
    draw_bargraph()
}

function draw_bargraph() {
    const storage_Graph2 = state.click_info
    const bargraph = d3.selectAll("#bargraph")
        .append("svg")
        .attr("width", width_1)
        .attr("height", height_1)
        // .data(state.bargraph)
        // .join(
        //     enter => bargraph.append(".bar"),
        //     update => update.call(sel => sel.transition()),
        //     exit => exit.call(exit => transition()
        //         .remove("#bargraph")),
        // )

    bargraph.selectAll(".bar")
        .data(state.bargraph)
        .join(
            enter => enter.append("rect")
                .attr("class", "bar")
                .attr("y", d => {
                return yScale(d[0])
                } )
                .attr("x",  margin_1)
                .attr("width", d => xScale(d[1]))
                .attr("height", yScale.bandwidth)
                .attr("fill", "lightblue")
                .on("click", (e, d) => {
                    state.Bargraph_2Seleceted = d[0]
                    state.Bargraph_2info = storage_Graph2.filter(function(d){
                        return d.gname == state.Bargraph_2Seleceted
                        });
                    storage_scatter = state.Bargraph_2info
                    state.scatter_plot_kills = d3.rollup(storage_scatter, v => d3.sum( v , d => +d.nkill), d => d.iyear)
                    state.scatter_plot_kills.key = Array.from(state.scatter_plot_kills.keys())
                    state.scatter_plot_kills.value = Array.from(state.scatter_plot_kills.values())
                    state.scatter_plot_wounded = d3.rollup(storage_scatter, v => d3.sum(v , d => +d.nwound), d => new Date(+d.iyear, 0 ,1))
                    state.scatter_plot_wounded.value = Array.from(state.scatter_plot_wounded.values())
                    state.scatter_plot_wounded.key = Array.from(state.scatter_plot_wounded.keys())
                    console_area()}),
            update => update.call (sel => sel.transition()
                    .duration(1000)
                    .attr("y", d => {
                        return yScale(d[0])
                    } )
                    .attr("x",  margin_1)
                    .attr("width", d => xScale(d[1]))
                    .attr("height", yScale.bandwidth)
                    .attr("fill", "lightblue")
                    .on("click", (e, d) => {
                        state.Bargraph_2Seleceted = d[0]
                        state.Bargraph_2info = storage_Graph2.filter(function(d){
                            return d.gname == state.Bargraph_2Seleceted
                            });
                        storage_scatter = state.Bargraph_2info
                        state.scatter_plot_kills = d3.rollup(storage_scatter, v => d3.sum( v , d => +d.nkill), d => d.iyear)
                        state.scatter_plot_kills.key = Array.from(state.scatter_plot_kills.keys())
                        state.scatter_plot_kills.value = Array.from(state.scatter_plot_kills.values())
                        state.scatter_plot_wounded = d3.rollup(storage_scatter, v => d3.sum(v , d => +d.nwound), d => new Date(+d.iyear, 0 ,1))
                        state.scatter_plot_wounded.value = Array.from(state.scatter_plot_wounded.values())
                        state.scatter_plot_wounded.key = Array.from(state.scatter_plot_wounded.keys())
                        console_area()})
                        ),
            exit => exit.call(exit => exit.transition()
                .duration(100)
                .attr("y", d => {
                    return yScale(d[0])
                } )
                .attr("x",  margin_1)
                .attr("width", d => xScale(d[1]))
                .attr("height", yScale.bandwidth)
                .attr("fill", "lightblue")
                .remove()
            ),
            )
    bargraph.append('g')
        .call( xAxis )
        .attr('class', 'x-axis')
        .style("transform", `translate(${margin_1}px,${height_1 - margin_1}px)`)
    
    bargraph.append('g')
        .call(yAxis)
        .attr('class', 'y-axis')
        .style("transform", `translate(${margin_1}px,0px)`)  
        
            
    
}


function console_area(){ 
    console.log(state.scatter_plot_kills)
    console.log(state.scatter_plot_kills.value)
    console.log(state.scatter_plot_kills.keys)
    console.log(state.scatter_plot_kills.values())
    draw_scatter()
}



function draw_scatter() {  

    ///https://stackoverflow.com/questions/24855630/d3-skip-null-values-in-line-graph-with-several-lines
    ///https://observablehq.com/@d3/line-with-missing-data

    test_storage = state.scatter_plot_kills
    console.log(test_storage)
    var parse = d3.timeParse("%Y")
    


    // console.log(storage_scatter)
    // console.log(state.scatter_plot_kills )
    // console.log(state.scatter_plot_wounded)
    xScale_scatter = d3.scaleTime()
        .domain([parse(1970), parse(2018)])
        .range([margin_1, width_1 - margin_1])
    yScale_scatter = d3.scaleLinear()
        .domain(d3.extent(state.scatter_plot_kills, d=> d.value))
        .range([height_1 - margin_1, margin_1])

    const xAxis_scatter = d3.axisBottom(xScale_scatter)
        .ticks(30)

    const yAxis_scatter = d3.axisLeft(yScale_scatter)

    const bargraph = d3.select("#scatter-plot")
        .append("svg")
        .attr("width", width_1)
        .attr("height", height_1) 

    bargraph_1 = bargraph.selectAll(".bar")
        .data(state.scatter_plot_kills)
        .join(
            enter => enter.append("rect")
            .attr("class", "bar")
            .attr("y", yScale_scatter())
            .attr("x",  margin_1)
            .attr("width", d => xScale_scatter(d.keys))
            .attr("height", d => yScale_scatter(d.values))
            .attr("fill", "lightblue")
        )
    bargraph.append('g')
        .call( xAxis_scatter )
        .attr('class', 'x-axis')
        .style("transform", `translate(${0}px,${width_1 - margin_1}px)`)
    
    bargraph.append('g')
        .call(yAxis_scatter)
        .attr('class', 'y-axis')
        .style("transform", `translate(${margin_1}px,0px)`)  






































    // scatter = d3.select("#scatter-plot")
    //     .append("svg")
    //     .attr("width", width_1)
    //     .attr("height", height_1)
    // xAxisGroup = scatter.append("g")
    //     .attr('class', 'xAxis')
    //     .call(xAxis_scatter)
    // xAxisGroup.append("text")
    //     .attr("class", "xLabel")
    //     .text("Year")
    // yAxisGroup = scatter.append("g")
    //     .attr("class", "yAxis")
    //     .call(yAxis_scatter)
    // //ALL INFO IS IN state.Bargraph_2info
    // const lineGen = d3.line()
    //     .x(d=> xScale_scatter(state.scatter_plot_kills.value))
    //     .y(d => yScale_scatter(state.scatter_plot_kills.key))
    // scatter.selectAll(".trend")
    //     .data(state.scatter_plot_kills)
    //     .join("path")
    //     .attr("class", "trend")
    //     .attr("stroke", "black")
    //     .attr("fill", "none")
    //     .attr("d", d => lineGen(d))
}