const csvUrl = "https://raw.githubusercontent.com/sab2232/narrative-viz/main/nba_data.csv"

// we use .then because d3.csv is "asynchronous"

d3.csv(csvUrl).then(function(csv) {
    const margin = {top: 20, left: 40, bottom: 20, right: 20}
    const width = window.innerWidth * 0.85 - margin.left - margin.right;
    const height = window.innerHeight * 0.85 - margin.top - margin.bottom;
    const leagueData = csv.filter(function(d) {
        if (+d.Team === "League Avg") {
            return true
        } else {
            return false
        }
    })
    //This function is for transitioning between years.
    function stepTransition(year) {
        const yearData = csv.filter(function(d) {
            if (+d.Year === year) {
                return true
            } else {
                return false
            }
        })
        d3.selectAll('circle')
                        .data(yearData)
                        .transition(300).delay(50)
                        .attr('cy', function(d) {
                            const conf= d.Conf
                            if (conf === "NBA"){
                                return yScale(77)
                            }else{
                            const wins = +d.prorated_win
                            return yScale(wins)
                            }
                        })
                        .attr('cx', function(d) {
                            const sal = d.salary
                            const conf= d.Conf
                            if (conf === "NBA"){
                                return leaguexScale(d.Year)
                            }else{
                            return xScale(sal)
                            }
                        })
                        .attr('r', function(d) {
                            const conf= d.Conf
                            if (conf === "NBA"){
                                const sal = +d.salary
                                return leaguerScale(sal)
                            }else{
                            const cost = +d.cost_per_win
                            return rScale(cost)
                            }
                        })
    
    }

    var allTeams = ["All NBA","Atlanta Hawks","Boston Celtics",
        "Brooklyn Nets", "Charlotte Hornets","Chicago Bulls","Cleveland Cavaliers",
        "Dallas Mavericks","Denver Nuggets","Detroit Pistons","Golden State Warriors",
        "Houston Rockets","Indiana Pacers","Los Angeles Clippers","Los Angeles Lakers",
        "Memphis Grizzlies","Miami Heat","Milwaukee Bucks","Minnesota Timberwolves",
        "New Orleans Pelicans","New York Knicks","Oklahoma City Thunder","Orlando Magic",
        "Philadelphia 76ers","Phoenix Suns", "Portland Trail Blazers","Sacramento Kings",
        "San Antonio Spurs","Toronto Raptors", "Utah Jazz","Washington Wizards",
        "League Avg"];
    console.log(allTeams)
    d3.select("#selectButton")
      .selectAll('myOptions')
     	.data(allTeams)
    .enter()
    	.append('option')
      .text(function (d) { return d; })
      .attr("value", function (d) { return d; })
      .attr("transform", "translate(" + margin.left + ","+ width -margin.top + ")")

    const svg = d3.select('#chart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    const salExtent = d3.extent(leagueData, function(d){
        return +d.salary
    })
    const leagueExtent = d3.extent(csv, function(d) {
        return +d.salary
    })
    const proWinExtent = d3.extent(csv, function(d) {
        return +d.prorated_win
    })

    const yearExtent = d3.extent(csv, function(d) {
        return +d.Year
    })

    const costExtent = d3.extent(csv, function(d) {
        return +d.cost_per_win
    })
    
    const leaguexScale = d3.scaleLinear().domain([2006,2022]).range([0,width])
    const leaguerScale = d3.scaleSqrt().domain(leagueExtent).range([10, 50])
    const xScale = d3.scaleLinear().domain([0,200000000]).range([0, width])
    const yScale = d3.scaleLinear().domain([0,82]).range([height, 0])
    const rScale = d3.scaleSqrt()
        .domain(costExtent)
        .range([20, 5])



    const confColors = {
        "Atlantic": "#102646",
        "Southeast": "#17698E",
        "Central": "#27DBF5",
        "Pacific": "#EE82EE",
        "Northwest": "#FF00FF",
        "Southwest": "Indigo ",
        "NBA":"Black"
    }

    let year = yearExtent[0]
    const earliestYearData = csv.filter(function(d) {
        if (+d.Year === year) {
            return true
        } else {
            return false
        }
    })

    svg.selectAll('circle').data(earliestYearData)
        .enter()
        .append('circle')
        .attr('cy', function(d) {
            const conf= d.Conf
            if (conf === "NBA"){
                return yScale(77)
            }else{
            const wins = +d.prorated_win
            return yScale(wins)
            }
        })
        .attr('cx', function(d) {
            const sal = d.salary
            const conf= d.Conf
            if (conf === "NBA"){
                return leaguexScale(d.Year)
            }else{
            return xScale(sal)
            }
        })
        .attr('r', function(d) {
            const conf= d.Conf
            if (conf === "NBA"){
                const sal = +d.salary
                return leaguerScale(sal)
            }else{
            const cost = +d.cost_per_win
            return rScale(cost)
            }
        })
        .attr('stroke', 'black')
        .on("mouseover", function(){
            d3.select(this).raise(); 
        });
    svg.append('text')
        .attr('id', 'year')
        .attr('dy', height * .8)
        .attr('dx', 20)
        .attr('font-size', '100px')
        .attr('opacity', .4)
        .text(year)



    const tAxis = d3.axisTop().scale(leaguexScale).ticks(16, d3.format(''))
    const xAxis = d3.axisBottom().scale(xScale).ticks(5, d3.format('.2s'))
    const yAxis = d3.axisLeft().scale(yScale)

    svg.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', 'translate(0 ' + height + ')').call(xAxis)
    svg.append('g')
        .attr('class', 'axis y-axis')
        .call(yAxis)
    svg.append('g')
        .attr('class', 'axis t-axis')
        .call(tAxis)

    // set everything to invisible at beginning
    svg.select('.x-axis').attr('opacity', 0)
    svg.select('.t-axis').attr('opacity', 0)
    svg.select('.y-axis').attr('opacity', 0)
    svg.select('#year').attr('opacity', 0)
    svg.selectAll('circle').attr('opacity', 0)

    const scroller = scrollama()

    function hide(selector) {
        svg.selectAll(selector).transition(1000).attr('opacity', 0)
    }

    function show(selector, opacity = 1) {
        svg.selectAll(selector).transition(200).attr('opacity', opacity)
    }

    let interval = null

    scroller.setup({
        step: '.step',
        offset: .75,
        debug: true
    }).onStepEnter(function(response) {
        const index = response.index

        if (index === 0) { //nothing
            hide('.x-axis')
            hide('.t-axis')
            hide('.y-axis')
            hide('#year')
            hide('circle')
        } else if (index === 1) { 
            show('.x-axis') //show x axis
            hide('.y-axis')
            hide('#year')
            hide('circle')
            hide('.t-axis')
        } else if (index === 2) {
            show('.x-axis') //show y axis
            show('.y-axis')
            hide('#year')
            hide('circle')
            hide('.t-axis')
        } else if (index === 3) {
            show('.x-axis')
            hide('.t-axis')
            show('.y-axis')
            hide('#year')
            show('circle') 
            
            d3.selectAll('circle') 
            .attr('fill', function(d) {
                const conf = d.Conf
                const fill = confColors[conf]
                return fill
            })//show circles and allow hovering function???
            //MAKES COLOR RETURN WHEN REVERSING DIRECTION

        } else if (index === 4) {
            show('.x-axis')
            hide('.t-axis')
            show('.y-axis')
            show('circle')
            hide('#year')

            //color highlight NBA teams with conf tag: Atlantic
            d3.selectAll('circle') 
            .attr('fill', function(d) {
                const conf = d.Conf
                if(conf==='Atlantic') {
                    const fill = confColors[conf]
                    return fill
                } else {
                    const fill = "LightGrey"
                    return fill
                }
            })

        } else if (index === 5) {
            show('.x-axis')
            show('.y-axis')
            show('circle')
            hide('#year')
            hide('.t-axis')

            //color highlight NBA teams with conf tag: Southeast
            d3.selectAll('circle') 
            .attr('fill', function(d) {
                const conf = d.Conf
                if(conf==='Southeast') {
                    const fill = confColors[conf]
                    return fill
                } else {
                    const fill = "LightGrey"
                    return fill
                }
            })

        } else if (index === 6) {
            show('.x-axis')
            hide('.t-axis')
            show('.y-axis')
            show('circle')
            hide('#year')

            //color highlight NBA teams with conf tag:Central
            d3.selectAll('circle') 
            .attr('fill', function(d) {
                const conf = d.Conf
                if(conf==='Central') {
                    const fill = confColors[conf]
                    return fill
                } else {
                    const fill = "LightGrey"
                    return fill
                }
            })

        } else if (index === 7) {
            hide('.t-axis')
            show('.x-axis')
            show('.y-axis')
            show('circle')
            hide('#year')

            // highlight NBA teams with conf tag: Pacific
             d3.selectAll('circle') 
             .attr('fill', function(d) {
                 const conf = d.Conf
                 if(conf==='Pacific') {
                     const fill = confColors[conf]
                     return fill
                 } else {
                     const fill = "LightGrey"
                     return fill
                 }
             })

        } else if (index === 8) {
            hide('.t-axis')
            show('.x-axis')
            show('.y-axis')
            show('circle')
            hide('#year',.5)

            // highlight teams with conf tag: Northwest
             d3.selectAll('circle') 
             .attr('fill', function(d) {
                 const conf = d.Conf
                 if(conf==='Northwest') {
                     const fill = confColors[conf]
                     return fill
                 } else {
                     const fill = "LightGrey"
                     return fill
                 }
             })

            } else if (index === 9) {
                year = 2007
                hide('.t-axis')
                show('.x-axis')
                show('.y-axis')
                show('circle')
                hide('#year',.5)
                d3.select('#year').text(year)
                stepTransition(2007)
                // highlight teams with conf tag: Southwest
                 d3.selectAll('circle') 
                 .attr('fill', function(d) {
                     const conf = d.Conf
                     if(conf==='Southwest') {
                         const fill = confColors[conf]
                         return fill
                     } else {
                         const fill = "LightGrey"
                         return fill
                     }

                })
            } else if (index === 10) {
                year = 2007
                show('.x-axis')
                show('.y-axis')
                show('circle')
                show('#year', .5) 
                show('.t-axis')
                d3.select('#year').text(year)
                d3.selectAll('circle') //return colors
                .attr('fill', function(d) {
                    const conf = d.Conf
                    const fill = confColors[conf]
                    return fill
                })
                stepTransition(year)
        } else if (index === 12) { 
            year = 2008
            show('.x-axis')
            show('.y-axis')
            show('circle')
            show('#year', .5)
            console.log({ year })
            d3.select('#year').text(year)        
            stepTransition(year)
        } else if (index === 13) { 
            year = 2009
            show('.x-axis')
            show('.y-axis')
            show('circle')
            show('#year', .5)
            console.log({ year })
            d3.select('#year').text(year)        
            stepTransition(year)
        } else if (index === 14) { 
            year = 2010
            show('.x-axis')
            show('.y-axis')
            show('circle')
            show('#year', .5)
            console.log({ year })
            d3.select('#year').text(year)        
            stepTransition(year)
        } else if (index === 15) { 
            year = 2011
            show('.x-axis')
            show('.y-axis')
            show('circle')
            show('#year', .5)
            console.log({ year })
            d3.select('#year').text(year)        
            stepTransition(year)
        } else if (index === 16) { 
            year = 2012
            show('.x-axis')
            show('.y-axis')
            show('circle')
            show('#year', .5)
            console.log({ year })
            d3.select('#year').text(year)        
            stepTransition(year)
        } else if (index === 17) { 
            year = 2013
            show('.x-axis')
            show('.y-axis')
            show('circle')
            show('#year', .5)
            console.log({ year })
            d3.select('#year').text(year)        
            stepTransition(year)
        } else if (index === 18) { 
            year = 2014
            show('.x-axis')
            show('.y-axis')
            show('circle')
            show('#year', .5)
            console.log({ year })
            d3.select('#year').text(year)        
            stepTransition(year)
        } else if (index === 19) { 
            year = 2015
            show('.x-axis')
            show('.y-axis')
            show('circle')
            show('#year', .5)
            console.log({ year })
            d3.select('#year').text(year)        
            stepTransition(year)
        } else if (index === 20) { 
            year = 2016
            show('.x-axis')
            show('.y-axis')
            show('circle')
            show('#year', .5)
            console.log({ year })
            d3.select('#year').text(year)        
            stepTransition(year)
        } else if (index === 21) { 
            year = 2017
            show('.x-axis')
            show('.y-axis')
            show('circle')
            show('#year', .5)
            console.log({ year })
            d3.select('#year').text(year)        
            stepTransition(year)
        } else if (index === 22) { 
            year = 2018
            show('.x-axis')
            show('.y-axis')
            show('circle')
            show('#year', .5)
            console.log({ year })
            d3.select('#year').text(year)        
            stepTransition(year)
        } else if (index === 23) { 
            year = 2019
            show('.x-axis')
            show('.y-axis')
            show('circle')
            show('#year', .5)
            console.log({ year })
            d3.select('#year').text(year)        
            stepTransition(year)
        } else if (index === 24) { 
            year = 2020
            show('.x-axis')
            show('.y-axis')
            show('circle')
            show('#year', .5)
            console.log({ year })
            d3.select('#year').text(year)        
            stepTransition(year)
        } else if (index === 25) { 
            year = 2021
            show('.x-axis')
            show('.y-axis')
            show('circle')
            show('#year', .5)
            console.log({ year })
            d3.select('#year').text(year)        
            stepTransition(year)
        } 

    })

    function highlight(team) {
        d3.selectAll('circle') 
             .attr('fill', function(d) {
                 const conf = d.Conf
                 const t = d.Team
                 if(team===t) {
                     const fill = confColors[conf]
                     d3.select(this).raise(); 
                     return fill
                 } else if (team ==="All NBA"){
                    const fill = confColors[conf]
                    return fill
                 }else{
                    const fill = "LightGrey"
                    return fill
                 }
             })

    }
    
    d3.select("#selectButton").on("change", function(d) {
        // recover the option that has been chosen
        var selectedOption = d3.select(this).property("value")
        // run the updateChart function with this selected option
        highlight(selectedOption)
    })
      
})
