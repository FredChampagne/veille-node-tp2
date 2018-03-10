const util = require('util');
let socketio = require('socket.io')

module.exports.listen = function (server) {
  let io = socketio.listen(server)

  // Traitement du socket
  let objUtilisateur = {}
  io.on('connection', function (socket) {
    console.log(socket.id);
    socket.on('setUser', function (data) {
      objUtilisateur[socket.id] = data.user;
      console.log("objUtilisateur = " + util.inspect(objUtilisateur));
      console.log(util.inspect(data));
      socket.emit('valide_user', data);
      io.sockets.emit('diffuser_list_user', objUtilisateur);
    });
    // Traitement des messages
    socket.on('setMessage', function (data) {
      let infoMessage = {
        user: objUtilisateur[socket.id], 
        message : data.message
      };
      //console.log(util.inspect(infoMessage));
      socket.broadcast.emit('diffuser_message', infoMessage);
      socket.emit('valide_message', infoMessage);
    })
    // Traitement de la déconnexion
    socket.on('disconnect', function () {
      socket.broadcast.emit('deconnexion', objUtilisateur[socket.id]);
      delete objUtilisateur[socket.id];
      io.sockets.emit('diffuser_list_user', objUtilisateur);
    });
  });
  return io;
}