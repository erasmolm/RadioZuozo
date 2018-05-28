//richiamo la libreria express
var express = require('express');

//inizializzo il server
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//definisco l'array che contiene gli usernames degli utenti che si uniscono alla chat
var usernames = {};

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
	
	//quando il client invia un evento di send, si invia a tutti i client in ascolto su quella socket un evento di updatechat, l'username di chi ha inviato il messaggio e il messaggio
	socket.on('send', function(data){
		io.sockets.emit('updatechat', socket.username, data);
	});
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
    	usernames[username] = username
    	//invio al client un messaggio di echo per la conferma della connessione
    	socket.emit('updatechat', 'SERVER', 'ora sei connesso alla chat');
    	//invio a tutti gli altri client che sono connessi alla chat room che questo utente si è connesso
    	//NOTA: con broadcast si invia il messaggio a tutti gli altri client tranne chi lo invia
    	socket.broadcast.emit('updatechat', 'SERVER', username + 'si è connesso alla chat');
    	//invio un evento di aggiornamento della lista degli utenti, in modo che lato client verrà aggiornata la lista degli utenti connessi
    	io.sockets.emit('updateusers', usernames)
	});
	socket.on('disconnect', function(){
		//elimino dall'array l'utente che si è disconnesso
		delete usernames[socket.username];
    	//invio un evento di aggiornamento della lista degli utenti, in modo che lato client verrà aggiornata la lista degli utenti connessi
		io.sockets.emit('updateusers', usernames);
		//invio agli altri client che l'utente si è disconnesso
		socket.broadcast.emit('updatechat', 'SERVER', socket.username+'ha abbandonato la chat');
	})
	socket.on('isTyping', function(data){
		socket.broadcast.emit('typing', data);
	});
});

