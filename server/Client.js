const lobbyManager = require('./lobbyManager.js')

let counter = 0

module.exports = class Client {

  constructor (socket) {
    this.socket = socket
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
    lobby.addClient(this)

    return { lobbyId: lobby.id }
  }

  handleJoinLobby ({lobbyId}) {
    const lobby = lobbyManager.findLobby(lobbyId)

    if (!lobby) {
      return { error: 'no_such_lobby' }
    }

    if (lobby.isFull()) {
      return { error: 'lobby_full' }
    }

    lobby.addClient(this)

    return { lobbyId: lobby.id }
  }

  handleLobbyReady ({lobbyId, ready}) {
    const lobby = lobbyManager.findLobby(lobbyId)

    if (!lobby) {
      return { error: 'no_such_lobby' }
    }

    lobby.setReady(this.id, ready)

    return true
  }

  handleSetLobbyOptions ({lobbyId, lobbyOptions}) {
    const lobby = lobbyManager.findLobby(lobbyId)

    if (!lobby) {
      return { error: 'no_such_lobby' }
    }

    lobby.setLobbyOptions(this.id, lobbyOptions)

    return true
  }

  emit (id, params) {
    this.socket.emit(id, params)
  }

  handleRequest (method, params) {
    switch (method) {
      case 'create-lobby':
        return this.handleCreateLobby(params)
      case 'join-lobby':
        return this.handleJoinLobby(params)
      case 'lobby-ready':
        return this.handleLobbyReady(params)
      case 'set-lobby-options':
        return this.handleSetLobbyOptions(params)
    }
  }

  onRequest ({ticket, method, params}) {
    this.log(`request ${method}`)

    Promise.resolve(this.handleRequest(method, params)).then(message => {
      this.socket.emit('respone', { ticket, message })
    })
  }
}
