var Client = {};
Client.socket = io.connect();

Client.askNewPlayer = function(textEntry){
    Client.socket.emit('newplayer', textEntry);
};

Client.askNewHost = function(){
    Client.socket.emit('newhost');
};

Client.sendPie = function(x,xVel,yVel){
    console.log("x: " + x + ", xVel: " + xVel + ", yVel: " + yVel);
    Client.socket.emit('piethrow',{x:x,xVel:xVel,yVel:yVel});
};

Client.socket.on('newplayer',function(data){
    addNewPlayer(data.id,data.x,data.y,data.color,data.name);
});

Client.socket.on('yourdata',function(data){
    activatePlayer(data.color, data.name);
});

Client.socket.on('allplayers',function(data){
    for(var i = 0; i < data.length; i++){
        if (typeof data[i].x !== 'undefined') {
            addNewPlayer(data[i].id,data[i].x,data[i].y);
        }
    }

    Client.socket.on('piecatch',function(data){
        console.log(data);
        publicPie(data.x,data.xVel,data.yVel);
    });

    Client.socket.on('remove',function(id){
        removePlayer(id);
    });
});
