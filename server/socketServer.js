const Client = require('./Client.js')

let clients = []

module.exports = (server) => {
  const io = require('socket.io')(server)

  io.on('connect', (socket) => {
    const client = new Client(socket)
    clients.push(client)

    socket.emit('identity', client.id)

    socket.on('disconnect', () => {
      clients.splice(clients.indexOf(client))
      client.onDisconnect()
    })
  })
}
