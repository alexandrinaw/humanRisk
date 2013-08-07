var force; 

var turn = function (receivedData) {
    var data = receivedData.data; 
    var game = data.game; 
    var me = data.you; 
    var actions = me.available_actions; 
    var players = game.players; 
    createPlayerInfo(players); 
    updateNodes(game); 
    updateStats(game); 
    turnPrompt(actions); 
};

var notTurn = function (receivedData) {
    var data = receivedData.data; 
    var game = data.game; 
    var players = game.players; 
    var me = data.you;
    createPlayerInfo(players);
};

var createPlayerInfo = function (players) {
    var p = [];
    // Makes players into an array 'p'
    for (player in players) {
        current = players[player];
        current["name"] = player; 
        p.push(current); 
    }
    //adds .player div for each player
    var player = d3.select("#turnControls").selectAll(".player")
        .data(p)
        .enter()
        .append("div")
        .style("display", "inline-block")
        .style("padding", "5px")
        .classed("player", true);
    player.append("h3")
        .text(function(d) {return d.name;})
    player.append("p")
        .text(function(d) {return "Cards: " + d.cards; })
        .style("color", "red"); 
}; 

var turnPrompt = function (actions) {
    var div = d3.select("#turnControls").append("div")
        .style("display", "inline-block"); 
    div.html(""); 
    for (i in actions) {
        div.append("button")
            .text(actions[i])
            .on("click", function () {
                //do whatever the button says
            })
    }
};

var chooseCountry = function () {
    d3.selectAll(".node")
        .on("click", function (d) {
            d3.select("#turnControls")
                .insert("div", "button")
                .text("test");
        }); 
}

var deployTroops = function () {
    d3.selectAll(".node")
        .on("click", function (d) {
            d3.select("#turnControls")
                .insert("div")
                .text(d.name);
        }); 

}

function forceLayout(height, width) {
    var height = height; 
    var width = width; 

    var contColors = {
            "europe": "#0044FF",
            "asia": "#00A231",
            "north america": "#F7FF01",
            "south america": "#FF0000",
            "africa": "#FF8901",
            "australia": "#9D00A2"
        };
        
    // Creates groups based on continents of countries
    var groups = d3.nest().key(function(d) {return d.continent}).entries(nodeList);
    
    // Creates paths around continents (convex hull)
    var groupPath = function(d) {
        return "M" +
            d3.geom.hull(d.values.map(function(i) {return [i.x, i.y]; }))
                .join("L")
            + "Z";
    };

    // Starts force layout
    force = d3.layout.force()
        .nodes(nodeList)
        .links(linkList)
        .size([width, height])
        .linkDistance(30)
        .charge(-500)
        .linkStrength(0.7)
        .on("tick", tick)
        .start(); 
        
    // Create D3 Layout Container
    var svg = d3.select("#map").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("style", "z-index: 1")
        .attr("id", "d3Layout"); 

    //adds adds continents to svg
    var continentBoundary = svg.selectAll("path.group")
        .data(groups)
            .attr("d", groupPath)
            .attr("class", "group")
        // Insert used here to place background continents before the circles(countries), because elements drawn first are furthest back. Nifty :)
        .enter().insert("path", "circle")
            .style("fill", function(d) {return contColors[d.key];})
            .attr("class", "group")
            .style("stroke", function(d) {return contColors[d.key];})
            .attr("class", "group")
            .style("stroke-width", 50)
            .style("stroke-linejoin", "round")
            .style("opacity", 0.4)
            .attr("d", groupPath);

    // Add links between bordering countries 
    var path = svg.append("svg:g").selectAll("path.link")
        .data(force.links())
        .enter().append("svg:path")
        .attr("class", "link")
    
    // Define nodes/countries
    var node = svg.selectAll(".node")
        .data(force.nodes())
        .enter().append("g")
        .attr("class", "node")
        .attr("value", 0)
        .attr("owner", null)
        .attr("id", function(d) {
            var id = d.name; 
            return id.split(" ").join(""); 
        })
        //.call(force.drag); 

    // Adds countries to map    
    var circle = node.append("circle")
        .attr("r", 7)
        .attr("class", "countryCircle")
        .style("stroke", "black"); 

    // Add text lables
    var label = node.append("text")
        .attr("x", 12)
        .classed ("label", true)
        .style("fill", "black")
        .attr("dy", ".35em")
        .text(function(d) {return d.name;});

    // Add troop count number
    var troopCount = node.append("text")
        .attr("dx", -3)
        .attr("dy", 3)
        .text(function(d) {return d.troops;}); 

    function tick() {
        continentBoundary.attr("d", groupPath); 

        path.attr("d", function(d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
            return "M" + 
                d.source.x + "," + 
                d.source.y + "L" + 
                d.target.x + "," + 
                d.target.y;
        });

        circle.attr("r", function(d) {
            var troops = d.troops || 1; 
            var radius = 7 * (Math.sqrt(troops));
            return radius; 
        });
        
        node.attr("transform", function(d) { 
            return "translate(" + d.x + "," + d.y + ")"; 
        });
        
        troopCount.text(function(d) {return d.troops;}); 
        
        label.attr("x", function(d) {
            var troops = d.troops || 1; 
            var circleRadius = 7 * (Math.sqrt(troops));
            var offset = 2 + circleRadius; 
            return offset;
        }); 
    }
}; 


