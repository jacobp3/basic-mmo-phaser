/**
 * Created by Jerome on 03-03-17.
 */

var Client = {};
Client.socket = io.connect();

Client.sendTest = function(){
    console.log("test sent");
    Client.socket.emit('test');
};

Client.askNewPlayer = function(){
    Client.socket.emit('newplayer');
};

Client.askNewHost = function(){
    Client.socket.emit('newhost');
};

Client.sendClick = function(x,y){
  Client.socket.emit('click',{x:x,y:y});
};

Client.socket.on('newplayer',function(data){
    addNewPlayer(data.id,data.x,data.y);
});

Client.socket.on('allplayers',function(data){
    for(var i = 0; i < data.length; i++){
        if (typeof data[i].x !== 'undefined') {
            addNewPlayer(data[i].id,data[i].x,data[i].y);
        }
    }

    Client.socket.on('move',function(data){
        console.log('got move emission')
        movePlayer(data.id,data.x,data.y);
    });

    Client.socket.on('remove',function(id){
        console.log('got remove emission')
        removePlayer(id);
    });
});
