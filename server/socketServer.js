const Client = require('./Client.js')
const Lobby = require('./Lobby.js')

let clients = []

module.exports = (server) => {
  const io = require('socket.io')(server);


  io.on('connect', (socket) => {

    const client = new Client(socket)
    clients.push(client)

    socket.on('disconnect', () => {
      clients.splice(clients.indexOf(client))
      client.onDisconnect()
    })
  })
}
