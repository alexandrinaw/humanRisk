var app = require('http').createServer(handler); 
var io = require('socket.io').listen(app); 
var fs = require('fs'); 
var path = require('path'); 
var url = require('url'); 

var skt; 
var resp; 
var game_history = []; //TODO: use the slider to get older moves; 
//related - maybe request from /game_history/broadcast_id
// == make new handler for /game_history


function handler (req, res) {
    console.log("Received request for: " + req.url); 
    var my_path = url.parse(req.url).pathname; 
    var full_path = path.join(process.cwd(), my_path); 
    
    // Need to send 200 to sever to start game
    if (req.url == "/status") {
        //TODO: Emit message to /play to see if player is ready - send 200 after confirmation
        console.log("Replying to /status with 200"); 
        res.writeHead(200); 
        res.end(""); 
        return; 
    }
    // Game data when not our turn
    else if (req.url == "/not_turn") {
        var body = ""
        req.on('data', function(chunk) {
            body += chunk; 
        }); 
        req.on('end', function() {
            body = JSON.parse(decodeURIComponent(body).substring(5).replace(/\+/g,  " ")); 
            console.log("It's not your turn"); 
            console.log(body);
            game_history.push(body); 
            if (skt) {
                skt.emit('not_turn', {data: body});
            }
        }); 
    }
    
    else if (req.url == "/turn") {
        var body = ""
        req.on('data', function(chunk) {
            body += chunk; 
        }); 
        req.on('end', function() {
            body = JSON.parse(decodeURIComponent(body).substring(5).replace(/\+/g,  " ")); 
            console.log("It's your turn"); 
            console.log(body);
            game_history.push(body); 
            resp = res; 
            if (skt) {
                skt.emit('turn', {data: body});
            }
        }); 
    }
    
    // If user wants to play a game
    else if (req.url == "/play") {
        fs.readFile(__dirname + '/index.html', function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }
            res.writeHead(200);
            res.end(data);
        });
    }
    else if (req.url.indexOf("/resources") > -1) {
        path.exists(full_path, function (exists) {
            if (!exists) {
                res.writeHead(404, {"Content-Type": "text/plain"});
                res.write("404 Not Found\n"); 
                res.end(); 
            } else {
                fs.readFile(full_path, "binary", function (err, file) {
                    if (err) {
                        res.writeHead(500, {"Content-Type": "text/plain"});
                        res.write(err + '\n Error loading content');
                    } else {
                        res.writeHead(200); 
                        res.write(file, "binary"); 
                        res.end(); 
                    }
                }); 
            }
        }); 
    }
}

io.sockets.on('connection', function (socket) {
    skt = socket; 
    socket.emit('news', { hello: 'world' }); // emits to all connected clients
    console.log(socket.handshake); 
    socket.on('response', function (data) { // does this when 'event' is received
        console.log("++++++++++++++++++++++++"); 
        console.log(data.data); 
        resp.writeHead(200); 
        resp.write(data.data); 
        resp.end(); 
    }); 
    socket.on('my other event', function (data) { // does this when 'my other event' is received
        console.log(data);
    });
    socket.on('disconnect', function(){ // ...on disconnect

    }); 
});

app.listen(8080);
