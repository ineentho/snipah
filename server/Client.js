const lobbyManager = require('./lobbyManager.js')

let counter = 0

module.exports = class Client {

  constructor (socket) {
    this.socket = socket;
    this.id = counter++

    this.log('connected')

    this.socket.on('request', this.onRequest.bind(this))
  }

  onDisconnect () {
    this.log('disconnected')
  }

  log (msg) {
    console.log(`[Client ${this.id}] ${msg}`)
  }

  handleCreateLobby () {
    const lobby = lobbyManager.createNewLobby()

    return { lobbyId: lobby.id }
  }

  handleRequest (method, params) {
    switch(method) {
    case 'create-lobby':
      return this.handleCreateLobby(params)
    }
  }

  onRequest ({ticket, method, params}) {

    this.log(`request ${method}`)

    Promise.resolve(this.handleRequest(method, params)).then(message => {
      this.socket.emit('respone', { ticket, message })
    })
  }
}
