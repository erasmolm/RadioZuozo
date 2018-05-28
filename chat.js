//richiamo la libreria express
var express = require('express');

//inizializzo il server
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//definisco l'array che contiene gli usernames degli utenti che si uniscono alla chat
var usernames = {};

//definisco l'array contenente le rooms disponibili
var rooms = ['stazione1', 'stazione2', 'stazione3'];

//metto in ascolto il server sulla porta 4300
http.listen(4300, function(){
  console.log('Il server è in ascolto su http://localhost:4300');
});

//definisco il routing che permette al server di restituire la pagina "index.html" quando lo si contatta
app.get('/',function(req,res){
	 //qui definisco il path del file index.html; in particolare __dirname fa riferimento alla cartella dove si trova il file chat.js
    res.sendFile(__dirname + '/index.html'); 

});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

/*
 *Definisco la callback di gestione dell'evento di connessione di un client
 *Dato che la connection può gestire più socket, devo passare come argomento della
 *callback la socket del client
*/

io.on('connection', function(socket){
	
	socket.on('adduser', function(username){
		if(username == null){
		   app.get('/', function(req, res){
  		   res.sendFile(__dirname + '/index.html');
		  });
		}
    	//memorizzo l'username nella socket session per questo client
    	socket.username = username;
    	console.log( socket.username + ' è entrato nella chat!');
    	//aggiungo l'username del nuovo client alla lista dei client connessi
    	usernames[username] = username;
    	//aggiungo la stanza 1 come quella di default quando un client si connette per la prima volta
    	socket.stazione = 'stazione1';
    	//invio al client un messaggio di echo per la conferma della connessione
    	socket.emit('updatechat', 'SERVER ', 'ora sei connesso alla chat della '+socket.stazione, false);
    	//invio a tutti gli altri utenti della stazione1 che un nuovo utente si è connesso
    	//NOTA: con broadcast si invia il messaggio a tutti gli altri client tranne chi lo invia
    	socket.broadcast.to('stazione1').emit('updatechat', 'SERVER: ', username + 'si è connesso alla chat di questa stazione',false);
    	//invio un evento di aggiornamento della lista degli utenti, in modo che lato client verrà aggiornata la lista degli utenti connessi
    	io.sockets.emit('updateuser', usernames);
    	io.sockets.emit('updaterooms', rooms, 'room1');
	});

	//quando il client invia un evento di send ad una stazione, si invia a tutti i client in ascolto su quella socket un evento di updatechat, l'username di chi ha inviato il messaggio e il messaggio
	socket.on('send', function(data){
		io.sockets.in(socket.room).emit('updatechat', socket.username, data);
	});

	socket.on('switchRoom', function(anotherRoom){
		//lascio la stanza vecchia e mi unisco a quella nuova
		socket.leave(socket.room);
		socket.join(anotherRoom);
    	socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+'ha abbandonato questa stazione');
		socket.room = anotherRoom;
		socket.emit('updatechat', 'SERVER: ', 'ora sei connesso alla chat della '+socket.room, true);
    	socket.broadcast.to(anotherRoom).emit('updatechat', 'SERVER ', socket.username + 'si è connesso alla chat di questa stazione',false);
		socket.emit('updaterooms', rooms, anotherRoom);
	});


	socket.on('disconnect', function(){
		//elimino dall'array l'utente che si è disconnesso
		delete usernames[socket.username];
    	//invio un evento di aggiornamento della lista degli utenti, in modo che lato client verrà aggiornata la lista degli utenti connessi
		io.sockets.emit('updateusers', usernames);
		//invio agli altri client che l'utente si è disconnesso
		socket.broadcast.to(socket.room).emit('updatechat', 'SERVER ', socket.username+'ha abbandonato la chat',false);
	})
	socket.on('isTyping', function(data){
		socket.broadcast.to(socket.room).emit('typing', data);
	});
});

