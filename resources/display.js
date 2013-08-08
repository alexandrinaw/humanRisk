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
    turnPrompt(actions, me); 
};

var notTurn = function (receivedData) {
    var data = receivedData.data; 
    var game = data.game; 
    var players = game.players; 
    var me = data.you;
    createPlayerInfo(players);
    updateNodes(game); 
};

var createPlayerInfo = function (players) {
    var p = [];
    var i = 0; 
    // Makes players into an array 'p'
    for (player in players) {
        current = players[player];
        current["name"] = player; 
        current["colorID"] = i;
        current["color"] = playerColors[i];  
        current["cards"] = players[player]["cards"]; 
        playerList[player]=i; 
        i+=1; 
        p.push(current); 
    }
    //adds .player div for each player
    var player = d3.select("#turnControls").selectAll(".player")
        .data(p)
        .enter()
        .insert("div", "#actionArea")
        .style("display", "inline-block")
        .style("padding", "2px")
        .style("margin", "2px")
        .style("width", "100px")
        .style("border", "solid black")
        .style("background-color", function(d) { 
            return d.color; 
        })
        .classed("player", true);
    player.append("p")
        .style("font-weight", "bold")
        .text(function(d) {return d.name;})
    player.append("p")
        .attr("id", function(d) { return d.name.split(" ").join("") + "_cards";})
        .text(function(d) {return "Cards: " + d.cards; });
}; 

var updatePlayerInfo = function (players) {
    var updatedData = [];
    var playerData = d3.selectAll(".player").data(); 
    for (player in playerData) {
        p = playerData[player];
        p.cards = players[p.name][cards];
        updatedData.push(p); 
    }
    d3.selectAll(".player").data(updatedData, function (d) {return d.name});
    d3.selectAll(".player").select(function(d) {
        return d.name + "_cards";     
    }).text(function(d) {
        return "Cards: " + d.cards; 
    }); 
};

var turnPrompt = function (actions, me) {
    var div = d3.select("#turnControls").select("#actionArea")
        .style("display", "inline-block"); 
    div.html(""); 
    for (i in actions) {
        if (actions[i] == "choose_country") {
            chooseCountry(); 
        } else if (actions[i] == "deploy_troops") {
            deployTroops(me); 
        } else if (actions[i] == "attack") {
            chooseAttack(me); 
        } else if (actions[i] == "reinforce") {
            chooseReinforce(); 
        } else if (actions[i] == "spend_cards") {
            spendCards(me); 
        }

        div.append("button")
            .text(actions[i])
            .on("click", function () {
                var chosenAction = d3.select(this).text(); 
                if (chosenAction == "choose_country") 
                    chooseCountryResponse();
                if (chosenAction == "deploy_troops")
                    deployTroopsResponse(); 
                if (chosenAction == "attack")
                    chooseAttackResponse(); 
                if (chosenAction == "end_attack_phase")
                    endAttackResponse();
                if (chosenAction == "reinforce")
                    chooseReinforceResponse(); 
                if (chosenAction == "end_turn")
                    endTurnResponse(); 
                if (chosenAction == "spend_cards")
                    spendCardsResponse(); 
                if (chosenAction == "pass")
                    passResponse(); 
            })
    }
};

var chooseAttack = function (me) {
    d3.select("#actionArea")
        .insert("p", "button")
        .text("Attacking: ")
        .append("span")
            .attr("id", "defending"); 
    d3.select("#actionArea")
        .insert("p", "button")
        .text("from: ")
        .append("span")
            .attr("id", "attacking"); 
    d3.select("#actionArea")
        .insert("input", "button")
        .attr("type", "number")
        .attr("id", "attackingTroops");
    d3.select("#actionArea")
        .insert("input", "button")
        .attr("type", "number")
        .attr("id", "movingTroops");
    d3.selectAll(".node")
        .on("click", function (d) {
            if (d.owner == me.name) {
                d3.select("#attacking")
                    .text(d.name); 
            } else {
                d3.select("#defending")
                    .text(d.name); 
            }
        }); 
}

var chooseAttackResponse = function () {
    var attacking_country = d3.select("#attacking").text(); 
    var defending_country = d3.select("#defending").text(); 
    var attacking_troops = parseInt(d3.select("#attackingTroops").property("value")); 
    var moving_troops = parseInt(d3.select("#movingTroops").property("value")); 
    var response = JSON.stringify({"action": "attack", "data": {"attacking_country": attacking_country, "defending_country": defending_country, "attacking_troops":   attacking_troops, "moving_troops": moving_troops}}); 
    socket.emit('response', {data: response}); 
}

var endAttackResponse = function () {
    var response = JSON.stringify({"action": "end_attack_phase"}); 
    socket.emit('response', {data: response}); 
}

var chooseReinforce = function () {
    var countries = []; 
    d3.select("#actionArea")
        .insert("p", "button")
        .text("Reinforce From: ")
        .append("span")
            .attr("id", "reinforceFrom"); 
    d3.select("#actionArea")
        .insert("p", "button")
        .text("To: ")
        .append("span")
            .attr("id", "reinforceTo");
    d3.select("#actionArea")
        .insert("input", "button")
        .attr("id", "reinforceTroops")
    d3.selectAll(".node")
        .on("click", function(d) {
            if (countries.indexOf(d.name) != -1) {
                var r1 = d3.select("#reinforceFrom"); 
                var r2 = d3.select("#reinforceTo"); 
                var c1 = r1.text(); 
                var c2 = r2.text();
                r1.text(c2); 
                r2.text(c1); 
            } else {
                var existing = d3.select("#reinforceFrom").text(); 
                countries.splice(countries.indexOf(existing), 1);
                countries.push(d.name);
                d3.select("#reinforceFrom").text(d.name); 
            }
        }); 
}

var chooseReinforceResponse = function () {
    var origin_country = d3.select("#reinforceFrom").text(); 
    var destination_country = d3.select("#reinforceTo").text(); 
    var troops = parseInt(d3.select("#reinforceTroops").property("value"));
    var response = JSON.stringify({"action": "reinforce", "data": {"origin_country": origin_country, "destination_country": destination_country, "moving_troops": troops}});
    socket.emit('response', {data: response}); 
}

var endTurnResponse = function () {
    var response = JSON.stringify({"action": "end_turn"}); 
    socket.emit('response', {data: response}); 
}

//TODO - make cards know their symbols, too. 
var spendCards = function (me) {
    var cards = me.cards; 
    d3.select("#actionArea").selectAll(".cards")
        .data(cards)
        .enter()
        .insert("p", "button")
        .classed("cards", true)
        .text(function(d) {
            return d.country_name + " - " + d.value;     
        })
        .on("click", function() {
            d3.select(this).classed("chooseCard", function(d) {
                return !d3.select(this).classed("chooseCard");
            });
        });
}

var passResponse = function () {
    var response = JSON.stringify({"action": "pass"}); 
    socket.emit('response', {data: response}); 
}

var spendCardsResponse = function () { 
    var cards = d3.selectAll(".chooseCard").data();
    var cardNames = cards.map(function(card) {
        return card.country_name;
    }); 
    var response = JSON.stringify({"action": "spend_cards", "data": cardNames}); 
    socket.emit('response', {data: response}); 
}

var chooseCountry = function () {
    var a = d3.select("#turnControls").select("#actionArea")
        .insert("div", "button")
        .attr("id", "chosenCountry");
    d3.selectAll(".node")
        .on("click", function (d) {
            a.text(d.name);
        }); 
}

var chooseCountryResponse = function () {
    var country = d3.select("#chosenCountry").text(); 
    var response = JSON.stringify({"action": "choose_country", "data": country}); 
    socket.emit('response', {data: response}); 
}

var deployTroops = function (me) {
    var countries = [];
    d3.select("#actionArea")
        .insert("p", "button")
        .text("Troops to Deploy: " + me.troops_to_deploy); 
    d3.selectAll(".node")
        .on("click", function (d) {
            if(d.owner == me.name) {
                if (countries.indexOf(d.name) == -1)  {
                    countries.push(d.name); 
                    var div = d3.select("#turnControls").select("#actionArea")
                        .insert("div", "button")
                        .classed("deployTo", true);
                    div.append("span")
                        .text(d.name)
                        .on("click", function () {
                            d3.select(this.parentNode).remove(); 
                            countries.splice(countries.indexOf(d.name), 1); 
                        })
                    div.append("input")
                        .attr("type", "number")
                        .attr("value", 1)
                        .attr("id", d.name + "_troops"); 
                } else {
                    // value of that box ++ 
                    // remaining troops to deploy --; 
                }
            }
        }); 
};

var deployTroopsResponse = function () {
    var orders = {"action": "deploy_troops", "data": {}};
    d3.selectAll(".deployTo").each(function (d, i) {
        var country = d3.select(this).text(); 
        var troops = parseInt(d3.select(this).select("input").property("value"));
        orders["data"][country] = troops; 
    }); 
    var response = JSON.stringify(orders);
    socket.emit("response", {data: response});
};

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


