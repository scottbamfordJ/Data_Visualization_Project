/**
 * CONSTANTS AND GLOBALS
 * */
 const width = 500,
    height = 500,
    margin = { top: 20, bottom: 50, left: 60, right: 40 };
const width_1 = 800,
    height_1 = 700,
    margin_1 = 30,
    radius_1 = 5;
const width_bar = 400,
    height_bar = 300,
    margin_bar = 30
let svg, 
    hoverBox,
    svg2;
let xScale;
let yScale;
let xAxis;
let xAxisg;
let yAxisg;
let xAxisGroup;
let yAxis;
let yAxisGroup;
let colorScale;
let bargraph;
let xScale_scatter;
let yScale_scatter;
let xAxis_scatter;
let yAxis_scatter;
let xAxis_2;
let yAxis_2;
let xScale_wounded;
let yScale_wounded;
let xAxis_wounded;
let yAxis_wounded;
let xAxis_wounded_label;
let yAxis_wounded_label;
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
bargraph_init();
nkills_bargraph_init();
nwounded_bargraph_init();
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
svg = d3.select("#map")
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
    // console.log(state.bargraph.Organizations)
    // console.log(state.bargraph.Attacks_Done)
    draw_bargraph();
    Remove_svg();
    //Create New Function which removes the elements in the SVG;
   
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
    // May need to pull this into the draw_bargraph since they're different with each click. 
    yScale = d3.scaleBand()
        .range([ height_1 - margin_1, margin_1])
    xScale = d3.scaleLinear()
        .range([ 0, width_1 - margin_1 - margin_1])  
    yAxis = d3.axisRight(yScale)
        .scale(yScale)
    xAxis = d3.axisBottom(xScale)
        .scale(xScale)

    bargraph = d3.selectAll("#bargraph")
        .append("svg")
        .attr("width", width_1)
        .attr("height", height_1)
    xAxisg = bargraph.append('g')
        .attr('class', 'x-axis')
        .style("transform", `translate(${margin_1}px,${height_1 - margin_1}px)`)
    yAxisg = bargraph.append('g')
        .attr('class', 'y-axis')
        .style("transform", `translate(${margin_1}px,${0}px)`)
    xAxisLabel = bargraph.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", 0)
        .attr("y", -500)
    yAxisLabel = bargraph.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("x", -330)
        .attr("y", 10)
        .attr("dy", "0.75em")
    title_bargraph = bargraph.append("text")
        .attr("x", (width_1/2))
        .attr("y", 0 - (margin_1/2))
        .style("text-decoration", "underline")






}
function Remove_svg(){
    nkills_plot.selectAll("rect").remove();
    nwounded_plot.selectAll("rect").remove();
}
function draw_bargraph() {
    var parse = d3.timeParse("%Y")
    // I think That as its said what needs to change is the full SVG not just the bar's, I'm not sure exactly how I will be able to updated for the full SVG
    // As well as I may need to pull the X + Y Scales into this draw since they do change based upon what is clicked. 
    const storage_Graph2 = state.click_info
    //Updated yScale xScale
    yScale.domain(state.bargraph.Organizations).padding(0.2)
    xScale.domain([0, d3.max(state.bargraph.Attacks_Done)])
    
    bargraph.selectAll(".bar")
        .data(state.bargraph)
        .join(
            /* What the Data Will Start With*/ 
            enter => enter.append("rect")
                .attr("class", "bar")
                .attr("y", d => {
                return yScale(d[0])
                } )
                .attr("x",  margin_1)
                .attr("width", d => xScale(d[1]))
                .attr("height", yScale.bandwidth)
                .attr("fill", "lightblue"),
            /* When The data changes How It will update*/
            update => update.call (sel => sel.transition()
                    .duration(1000)
                    .attr("y", d => {
                        return yScale(d[0])
                    } )
                    .attr("x",  margin_1)
                    .attr("width", d => xScale(d[1]))
                    .attr("height", yScale.bandwidth)
                    .attr("fill", "lightblue")

                        ),
            /* When Data Is Updating What will be removed */ 
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
            .on("click", (e, d) => {
                state.Bargraph_2Seleceted = d[0]
                state.Bargraph_2info = storage_Graph2.filter(function(d){
                    return d.gname == state.Bargraph_2Seleceted
                    });
                storage_scatter = state.Bargraph_2info

                state.scatter_plot_kills = d3.rollup(storage_scatter, v => d3.sum( v , d => +d.nkill), d =>d.iyear)
                state.scatter_plot_kills.key = Array.from(state.scatter_plot_kills.keys())
                state.scatter_plot_kills.value = Array.from(state.scatter_plot_kills.values())

                state.scatter_plot_wounded = d3.rollup(storage_scatter, v => d3.sum(v , d => +d.nwound), d => d.iyear)
                state.scatter_plot_wounded.key = Array.from(state.scatter_plot_wounded.keys())
                state.scatter_plot_wounded.value = Array.from(state.scatter_plot_wounded.values())
                console.log(state.scatter_plot_kills)
                console.log(state.scatter_plot_wounded)
                draw_killed();
                draw_wounded()})
        xAxisg.call(xAxis)
        yAxisg.call(yAxis).raise() // Raise Look It Up 
        xAxisLabel.text("Number Of Attacks")
        yAxisLabel.text("Organization Name").attr("transform", "rotate(-90)")
        title_bargraph.text("Organization vs Number of Attacks")
    // bargraph.append('g')
    //     .call( xAxis )
    //     .attr('class', 'x-axis')
    //     .style("transform", `translate(${margin_1}px,${height_1 - margin_1}px)`)

    // bargraph.append('g')
    //     .call( yAxis )
    //     .attr('class', 'x-axis')
    //     .style("transform", `translate(${margin_1}px,${width_1 - margin_1}px)`)
 
        
            
    
}

function nkills_bargraph_init(){ 
    // console.log(state.scatter_plot_kills)
    // console.log(state.scatter_plot_kills.value)
    xScale_scatter = d3.scaleBand()
        .range([margin_bar, width_bar - margin_bar])
        .padding(0.2)
    yScale_scatter = d3.scaleLinear()
        .range([height_bar - margin_bar, margin_bar])
    xAxis_scatter = d3.axisBottom(xScale_scatter)
        .scale(xScale_scatter)
    yAxis_scatter = d3.axisLeft(yScale_scatter)
        .scale(yScale_scatter)

    nkills_plot = d3.select("#scatter-plot")
        .append("svg")
        .attr("width", width_bar)
        .attr("height", height_bar)
    xAxis_2 = nkills_plot.append('g')
        .attr('class', 'x-axis')
        .style("transform", `translate(${0}px,${height_bar - margin_bar}px)`)
    yAxis_2 = nkills_plot.append('g')
        .attr('class', 'y-axis')
        .style("transform", `translate(${margin_bar}px,${0}px)`)
}



function draw_killed(){  

    xScale_scatter.domain(state.scatter_plot_kills.key)
    yScale_scatter.domain([ 0, d3.max(state.scatter_plot_kills.value)])
    nkills_plot.selectAll(".bar")
        .data(state.scatter_plot_kills)
        .join(
            enter => enter.append("rect")
                .attr("class", "bar")
                .attr("x", d => {
                    return xScale_scatter(d[0])
                })
                .attr("y", d =>  yScale_scatter(d[1]))
                .attr("width", xScale_scatter.bandwidth)
                .attr("height", d => height_bar - margin_bar- yScale_scatter(d[1]))
                .attr("fill", "red"),
            update => update.call(sel => sel.transition()
                .duration(1000)
                .attr("x", d => {
                    return xScale_scatter(d[0])
                })
                .attr("y", d =>  yScale_scatter(d[1]))
                .attr("width", xScale_scatter.bandwidth)
                .attr("height", d => height_bar - margin_bar- yScale_scatter(d[1]))
                .attr("fill", "red")
                ),
            exit => exit.call(exit=> exit.transition()
                .duration(10)
                .attr("x", d => {
                    return xScale_scatter(d[0])
                })
                .attr("y", d =>  yScale_scatter(d[1]))
                .attr("width", xScale_scatter.bandwidth)
                .attr("height", d => height_bar - margin_bar- yScale_scatter(d[1]))
                .attr("fill", "red")
                .remove()
                ),
        )
        xAxis_2.call(xAxis_scatter)
        yAxis_2.call(yAxis_scatter)
}
function nwounded_bargraph_init(){ 
    // console.log(state.scatter_plot_kills)
    // console.log(state.scatter_plot_kills.value)
    xScale_wounded = d3.scaleBand()
        .range([margin_bar, width_bar - margin_bar])
        .padding(0.2)
    yScale_wounded = d3.scaleLinear()
        .range([height_bar - margin_bar, margin_bar])
    xAxis_wounded = d3.axisBottom(xScale_wounded)
        .scale(xScale_wounded)
    yAxis_wounded = d3.axisLeft(yScale_wounded)
        .scale(yScale_wounded)

    nwounded_plot = d3.select("#nwounded-plot")
        .append("svg")
        .attr("width", width_bar)
        .attr("height", height_bar)
    xAxis_wounded_label = nwounded_plot.append('g')
        .attr('class', 'x-axis')
        .style("transform", `translate(${0}px,${height_bar - margin_bar}px)`)
    yAxis_wounded_label = nwounded_plot.append('g')
        .attr('class', 'y-axis')
        .style("transform", `translate(${margin_bar}px,${0}px)`)
}



function draw_wounded(){  

    xScale_wounded.domain(state.scatter_plot_wounded.key)
    yScale_wounded.domain([ 0, d3.max(state.scatter_plot_wounded.value)])
    nwounded_plot.selectAll(".bar")
        .data(state.scatter_plot_wounded)
        .join(
            enter => enter.append("rect")
                .attr("class", "bar")
                .attr("x", d => {
                    return xScale_wounded(d[0])
                })
                .attr("y", d =>  yScale_wounded(d[1]))
                .attr("width", xScale_wounded.bandwidth)
                .attr("height", d => height_bar - margin_bar- yScale_wounded(d[1]))
                .attr("fill", "red"),
            update => update.call(sel => sel.transition()
                .duration(1000)
                .attr("x", d => {
                    return xScale_wounded(d[0])
                })
                .attr("y", d =>  yScale_wounded(d[1]))
                .attr("width", xScale_wounded.bandwidth)
                .attr("height", d => height_bar - margin_bar- yScale_wounded(d[1]))
                .attr("fill", "red")
                ),
            exit => exit.call(exit=> exit.transition()
                .duration(10)
                .attr("x", d => {
                    return xScale_wounded(d[0])
                })
                .attr("y", d =>  yScale_wounded(d[1]))
                .attr("width", xScale_wounded.bandwidth)
                .attr("height", d => height_bar - margin_bar- yScale_wounded(d[1]))
                .attr("fill", "red")
                .remove()
                ),

        )
        .on("click", (e, d) => {
            selected = d[0]
            state.written_info = storage_scatter.filter(function(d){
                return d.iyear == selected
                });
            objArray = state.written_info
            // console.log(objArray);
            table_draw();
            })
        xAxis_wounded_label.call(xAxis_wounded)
        yAxis_wounded_label.call(yAxis_wounded)
}
// CSS Grid 
// MOUSE ENTER< MOUSE OVER < MOUSE EXIT
// ENTER AND EXIT RECOMMENDED 



// Columns I want 
// iyear, imonth, iday , gname, city, attacktypye1_txt, target1, targetsub_type1_txt, target_type1_txt, weapdetail, weaptype_txt
function table_remove(){
    // Table.selectAll('tr').remove()
    table_draw()
    // Table.selectAll('tr').remove()
}
function table_init(){ 
    let table = d3.select("body").append("table")
    let headers = ['Month', 'Day', 'Year', 'City of Attack', 
        'Organization Name', 'Target of Attack', 'Target Category', 
        'Attack Type', 'Weapon Details', 'Weapon Type']
    let thead = table.append("thead")
    let tbody = table.append("tbody")

}
function table_draw(){

    year = objArray.map(a => a.iyear)
    day = objArray.map(a => a.iday)
    month = objArray.map(a => a.imonth)
    gname = objArray.map(a => a.gname)
    city = objArray.map(a => a.city)
    attacktype = objArray.map(a => a.attacktype1_txt)
    target = objArray.map(a => a.target1)
    targetsubtype = objArray.map(a => a.targsubtype1_txt)
    targettype = objArray.map(a => a.targtype1_txt)
    weapdetail = objArray.map(a => a.weapdetail)
    weapontype = objArray.map(a => a.weaptype1_txt)
    wounded = objArray.map(a => a.nwound)
    killed = objArray.map(a => a.nkill)


    test = [month, day, year, city, gname, target, targetsubtype, attacktype, weapdetail, weapontype, wounded, killed]
    state.table = test[0].map((_, colIndex) => test.map(row => row[colIndex]))
    state.table_headers = ['Month', 'Day', 'Year', 'City of Attack', 
    'Organization Name', 'Target of Attack', 'Target Category', 
    'Attack Type', 'Weapon Details', 'Weapon Type', 'Number Wounded', "Number Killed"
]
    var columns = [
        {head: 'Month', cl: 'num', html: function(row) {return f[0]}},
        {head: 'Day', cl: 'num', html: function(row) {return f[1]}},
        {head: 'Year', cl: 'num', html: function(row) {return f[2]}},
        {head: 'City of Attack', cl: 'center', html: function(row) {return row[3]}},
        {head: 'Organization Name', cl: 'center', html: function(row) {return row[4]}},
        {head: 'Target of Attack', cl: 'center', html: function(row) {return row[5]}},
        {head: 'Target Category', cl: 'center', html: function(row) {return row[6]}},
        {head: 'Attack Type', cl: 'center', html: function(row) {return row[7]}},
        {head: 'Weapon Details', cl: 'center', html: function(row) {return row[8]}},
        {head: 'Weapon Type', cl: 'center', html: function(row) {return row[9]}},
        {head: 'Number Wounded', cl: 'num', html: function(row) {return row[10]}},
        {head: 'Number Killed', cl: 'num', html: function(row) {return row[11]}}
    ]

    state.table_test = [
        {'Month':month, 'Day':day, 'Year':year, 'City': city, 
        'Oraganization Name': gname, 'Target of Attack': target, 'Target Category': targetsubtype, 
        'Attack Type': attacktype, 'Weapon Details': weapdetail, 'Weapon Type':weapontype, 
        'Number Wounded': wounded, 'Number Killed': killed}
    ]

    table = d3.select('#Information').append('table')
    var thead = table.append('thead')
    var tbody = table.append('tbody')

    thead.append('tr')
        .selectAll('th')
        .data(state.table_headers).enter()
        .append('th')
            .text(function(d){return d})
    var rows = tbody.selectAll('tr')
        .data(state.table)
        .enter()
        .append('tr');

    console.log(state.table)


    // table.append('tbody')
    //     .selectAll('tr')
    //     .data(state.table).enter()
    //     .append('tr')
    //     .selectAll('td')
    //     .data(function(row, i){
    //         return columns.map(function(c){
    //             var cell = {}
    //             d3.keys(c).forEach(function(k){
    //                 cell[k] = typeof c[k] == 'function' ? c[k](row,i) : c[k];
    //             });
    //             return cell;
    //         })
    //     }).enter()
    //     .append('td')
    //     .html(function())
    // var header = table.createTHead();
    // for (let row of state.table){
    //     table.insertRow();
    //     for (let cell of row){
    //         let newCell = table.rows[table.rows.length - 1].insertCell();
    //         newCell.textContent = cell; 
    //     }
    // }
    // document.body.appendChild(table);
    // console.dir(table)
    //
    // let table = document.createElement('table');
    // let headerRow = document.createElement('tr')

}