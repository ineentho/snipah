let idCounter = 0

module.exports = class Lobby {
  constructor () {
    this.id = idCounter++

    this.lobbyOptions = {
      scopeZoom: 2,
      map: 'random'
    }

    this.log('created')

    this.clients = []
  }

  addClient (client) {
    this.log(`client joined: ${client.id}`)

    this.clients.push({client: client, ready: false})

    setTimeout(() => {
      this.sendClientList()
      this.sendLobbyOptions(client)

      if (this.clients.length === 2) {
        this.enterReadyCheck()
      }
    }, 200)
  }

  sendClientList () {
    this.sendMessage('client-list', this.clients.map(({client, ready}) => ({ id: client.id, ready })))
  }

  sendLobbyOptions (client) {
    this.sendMessageToClient(client, 'lobby-options', this.lobbyOptions)
  }

  setReady (clientId, status) {
    this.log(`${clientId} ready: ${status}`)

    const clientObj = this.clients.find(({client}) => client.id === clientId)

    if (!clientObj) {
      return false
    }

    clientObj.ready = status

    this.sendClientList()

    if (!this.clients.find(clientObj => !clientObj.ready)) {
      this.sendMessage('start-game')
    }
  }

  setLobbyOptions (clientId, lobbyOptions) {
    this.lobbyOptions = lobbyOptions

    this.clients.filter(({client}) => client.id !== clientId).forEach(({client}) => {
      this.sendLobbyOptions(client)
    })
  }

  enterReadyCheck () {
    this.log('enter ready check')
    this.sendMessage('enter-ready-check')
  }

  sendMessage (message, params) {
    this.clients.forEach(({client}) => {
      this.sendMessageToClient(client, message, params)
    })
  }

  sendMessageToClient (client, message, params) {
    client.emit('lobby-update', { id: this.id, message, params })
  }

  log (msg) {
    console.log(`[Lobby ${this.id}] ${msg}`)
  }

  isFull () {
    return this.clients.length > 1
  }
}
