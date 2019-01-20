var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var hosts = [];

// red, blue, green, deeppink, yellow, gray, orange, cyan, purple, brown
var colors = [0xFF0000, 0x0000FF, 0x008000, 0xFF1493, 0xFFFF00, 0x808080, 0xFFA500, 0x00FFFF, 0x800080, 0xA52A2A ];
var usedColors = [];

app.use('/css',express.static(__dirname + '/css'));
app.use('/js',express.static(__dirname + '/js'));
app.use('/assets',express.static(__dirname + '/assets'));

app.get('/',function(req,res){
    res.sendFile(__dirname+'/index.html');
});

server.lastPlayerID = 0;

server.listen(process.env.PORT || 8081,function(){
    console.log('Listening on '+server.address().port);
});

io.on('connection',function(socket){
    socket.on('newplayer',function(textEntry){
        var thisColor;
        for (c in colors) {
            if (!usedColors.includes(c)) {
                thisColor = c;
                usedColors.push(c);
                break;
            }
        }
        socket.player = {
            id: server.lastPlayerID++,
            x: randomInt(100,400),
            y: randomInt(100,400),
            color: thisColor,
            name: textEntry
        };

//        socket.join(textEntry);

        socket.emit('allplayers',getAllPlayers());
        socket.broadcast.emit('newplayer',socket.player);
        socket.emit('yourdata',socket.player);
//        socket.broadcast.to(textEntry)

        socket.on('piethrow',function(data){
//            socket.player.x = socket.player.x + data.x;
//            socket.player.y = socket.player.y + data.y;
            console.log(data);
            io.emit('piecatch',data);
        });

        socket.on('disconnect',function(){
            io.emit('remove',socket.player.id);
            usedColors.remove(socket.player.color);
        });
    });

    socket.on('newhost',function(){
        socket.player = {
            id: server.lastPlayerID++
        };
        hosts.push(socket.player.id);

        socket.emit('allplayers',getAllPlayers());

        socket.on('disconnect',function(){
            io.emit('remove',socket.player.id);
            if(hosts.indexOf(id) >= 0) {
                hosts.splice(hosts.indexOf(id), 1);
            }
        });
    });
});

function getAllPlayers(){
    var players = [];
    Object.keys(io.sockets.connected).forEach(function(socketID){
        var player = io.sockets.connected[socketID].player;
        if(player) players.push(player);
    });
    return players;
}

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}
