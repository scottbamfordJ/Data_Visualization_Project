function bargraph_init(){
    const storage_Graph2 = state.click_info
    yScale = d3.scaleBand ()
    //Order the data
    //Make bar pop out 
        .domain(state.bargraph.Organizations)
        .range([ height_1 - margin_1, margin_1])
        .padding(0.2)
    xScale = d3.scaleLinear()
        // Using the 0, as the starting point, and having to duble subtract margins ( Look a tbargraph.append("g" style.) )
        .domain([0, d3.max(state.bargraph.Attacks_Done)])
        .range([ 0, width_1 - margin_1 - margin_1])  
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
        .join()
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
            state.scatter_plot_kills = d3.rollup(storage_scatter, v => d3.sum( v , d => +d.nkill), d => d.iyear)
            state.scatter_plot_kills.key = Array.from(state.scatter_plot_kills.keys())
            state.scatter_plot_kills.value = Array.from(state.scatter_plot_kills.values())
            state.scatter_plot_wounded = d3.rollup(storage_scatter, v => d3.sum(v , d => +d.nwound), d => new Date(+d.iyear, 0 ,1))
            state.scatter_plot_wounded.value = Array.from(state.scatter_plot_wounded.values())
            state.scatter_plot_wounded.key = Array.from(state.scatter_plot_wounded.keys())
            console_area()

        })
    bargraph.append('g')
        .call( xAxis )
        .attr('class', 'x-axis')
        .style("transform", `translate(${margin_1}px,${height_1 - margin_1}px)`)
        // .attr("dx", "2em")
    
    bargraph.append('g')
        .call(yAxis)
        .attr('class', 'y-axis')
        .style("transform", `translate(${margin_1}px,0px)`)   
    console_area()    
}




function init(){
    const storage_Graph2 = state.click_info
    yScale = d3.scaleBand ()
    //Order the data
    //Make bar pop out 
        .domain(state.bargraph.Organizations)
        .range([ height_1 - margin_1, margin_1])
        .padding(0.2)
    xScale = d3.scaleLinear()
        // Using the 0, as the starting point, and having to duble subtract margins ( Look a tbargraph.append("g" style.) )
        .domain([0, d3.max(state.bargraph.Attacks_Done)])
        .range([ 0, width_1 - margin_1 - margin_1])  
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
        .join()
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
    bargraph.append('g')
        .call( xAxis )
        .attr('class', 'x-axis')
        .style("transform", `translate(${margin_1}px,${height_1 - margin_1}px)`)
        // .attr("dx", "2em")
    
    bargraph.append('g')
        .call(yAxis)
        .attr('class', 'y-axis')
        .style("transform", `translate(${margin_1}px,0px)`)   
    xAxisGroup = svg.append("g")
        .attr("class", 'xAxis')
        .attr("transform", `translate(${0}, ${height - 20})`) // move to the bottom
        .call(xAxis)
    
    yAxisGroup = svg.append("g")
        .attr("class", 'yAxis')
        .attr("transform", `translate(${20}, ${0})`) // align with left margin
        .call(yAxis)
}
function draw(){
    let prevXScale = xScale.copy();
    let prevYScale = yScale.copy();

    xScale = xScale.domain([0, d3.max(state.bargraph.Attacks_Done)])
    xAxisGroup 
        .transition()
        .duration(1000)
        .call(xAxis.scale(xScale))
    yScale = yScale.domain(state.bargraph.Organizations)
    yAxisGroup  
        .transition()
        .duration(1000)
        .call(yAxis.scale(yScale))
    const bars = bargraph.append("rect")
        .data(state.bargraph)
        .join(
            enter => enter.append("rect")
                .attr("y", d => {
                    return yScale(d[0])
                } )
                .attr("x",  margin_1)
                .attr("width", d => xScale(d[1]))
                .attr("height", yScale.bandwidth)
                .attr("fill", "lightblue")
                .attr("class", "bar")
                .call(sel => sel.transition().duration(1000)
                    .attr("y", d => {
                        return yScale(d[0])
                    } )
                    .attr("x",  margin_1)
                    .attr("width", d => xScale(d[1]))
                    .attr("height", yScale.bandwidth)
                ),
            update => update.call(sel => sel.transition()
                .duration(1000)
                .attr("y", d => {
                    return yScale(d[0])
                } )
                .attr("x",  margin_1)
                .attr("width", d => xScale(d[1]))
                .attr("height", yScale.bandwidth)
            ),
            exit => exit.call(exit => exit.transition()
                        .duration(1000)
                        .attr("y", d => {
                            return yScale(d[0])
                        } )
                        .attr("x",  margin_1)
                        .attr("width", d => xScale(d[1]))
                        .attr("height", yScale.bandwidth)
                        .remove()),
            
            )
}