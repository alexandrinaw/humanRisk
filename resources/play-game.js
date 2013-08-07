//var turn = function(receivedData) {
//    var d = receivedData.data;
//    var game = d.game;
//    //TODO: make variable, if false, initialize display, then set to true. 
//    if (game.broadcast_count == 1) {
//        initializeStatusDisplay(game);
//    }
//    var me = d.you;
//    var actions = me.available_actions;

//    updateNodes (game);
//    updateStats(game);
//    updatePlayerStats(me);
//    promptForActions(actions, game, me);
//    countriesOwnedBy(game); 
//};

var countriesOwnedBy = function(gameData, owner) {
    var c = []; 
    for (country in gameData.countries) {
        if (gameData.countries[country].owner == owner) {
            c.push(country); 
        }
    }
    return c; 
};

//var notTurn = function(receivedData) {
    //TODO: make it so the graph doesn't move when the buttons go away
//    d3.select("#turnControls").html("Opponent's Turn");
//    var data = receivedData.data;
//    var game = data.game;
//    if (game.broadcast_count == 1) {
//        initializeStatusDisplay(game);
//    }
//    var me = data.you;
//    updateStats(game);
//    updatePlayerStats(me);
//    updateNodes (game);
//};

var actionTypes = {
        "choose_country": function(game, me) {
        var inputArea = d3.select("#turnControls"); 
        var dropdown = inputArea.append("form").append("select")
            .attr("id", "chooseCountryInput");
        var choices = countriesOwnedBy(game, "none");       
        for (country in choices) {
            dropdown.append("option").attr("value", choices[country]).text(choices[country]); 
        }
        inputArea.append("button")
            .text("Submit")
            .on("click", function () {
                var country = $("#chooseCountryInput").val();
                var response = JSON.stringify({"action": "choose_country", "data": country});
                socket.emit('response', {data: response});
            });
    },

    "deploy_troops": function(game, me) {
        //TODO: Actually let player choose country & number of troops
        var inputArea = d3.select("#turnControls").text("");
        var troops = me.troops_to_deploy;
        // deploy troops button
        // dropdown of my countries
        // dropdown of # of troops
        // + button to add another country
        // new dropdown of # of troops
        var i = 0; 
        var deployTo = function () {
            i += 1; 
            var dropdown = inputArea.append("form").append("select")
                .attr("id", "deployInput"+i);
            var choices = countriesOwnedBy(game, me.name);       
            for (country in choices) {
                dropdown.append("option").attr("value", choices[country]).text(choices[country]); 
            }
            var number = inputArea.append("form").append("select")
                .attr("id", "deployTroops"+i);
            for (var j=0; j<troops; j++) {
                number.append("option").attr("value", j).text(j); 
            }
        }

        var response = JSON.stringify({"action": "deploy_troops", "data": {"egypt": troops}});
        socket.emit("response", {data: response});
    },

    "spend_cards": function(game, me) {
        //example: {"action": "spend_cards", "data": ["argentina", "china", "iceland"]}
        var inputArea = d3.select("#turnControls")
        inputArea.append("input")
            .attr("id", "card1");
        inputArea.append("input")
            .attr("id", "card2");
        inputArea.append("input")
            .attr("id", "card3");
        inputArea.append("button")
            .text("Spend These Cards")
            .on("click", function () {
                var card1 = $("#card1").val();
                var card2 = $("#card2").val();
                var card3 = $("#card3").val();
                var cards = [card1, card2, card3];
                var response = JSON.stringify({"action": "spend_cards", "data": cards});
                socket.emit('response', {data: response});
            });
    },

    "attack": function(game, me) {
        //example: {"action": "attack", "data": {"attacking_country": "western  united states", "defending_country": "eastern united states", "attacking_troops":   3, "moving_troops": 15}}
    },

    "reinforce": function(game, me) {
        //example: {"action": "reinforce", "data": {"origin_country": "greenland", "destination_country": "iceland", "moving_troops": 7}}
    },

    "end_turn": function(game, me) {
        var response = JSON.stringify({"action": "end_turn"});
        socket.emit("response", {data: response});
    },

    "pass": function(game, me) {
        var response = JSON.stringify({"action": "pass"});
        socket.emit("response", {data: response});
    },

    "end_attack_phase": function(game, me) {
        var response = JSON.stringify({"action": "end_attack_phase"});
        socket.emit("response", {data: response});
    }
};

var promptForActions = function(actions, game, me) {
    var div = d3.select("#turnControls");
    div.html("");
    for (i in actions) {
        div.append('button')
            .text(actions[i])
            .attr("id", actions[i])
            .on('click', function() { actionTypes[actions[i]](game, me);});
    }
}

var updatePlayerStats = function(me) {
    var div =  d3.select("#playerStats");
    div.html("");
    var cards = me.cards;
    var ectt = me.earned_cards_this_turn;
    var eliminated = me.is_eliminated;
    var neutral = me.is_neutral;
    var countries = me.countries;
    div.append("p").text("Countries: " + countries);
    div.append("p").text("Cards: " + cards);
}
