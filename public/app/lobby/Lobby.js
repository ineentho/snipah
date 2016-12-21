import template from './lobby.hbs'
import readyCheckTemplate from './readyCheck.hbs'
import { EventEmitter } from 'events'

export default class Lobby extends EventEmitter {
  constructor (serverSocket, client) {
    super()
    this.element = document.createElement('div')

    this.client = client
    this.serverSocket = serverSocket
    this.clientList = []

    serverSocket.socket.on('lobby-update', ({id, message, params}) => {
      if (id === this.id) {
        this.handleMessage(message, params)
      }
    })
  }

  handleMessage (message, params) {
    switch (message) {
      case 'client-list':
        return this.handleClientListUpdate(params)
      case 'enter-ready-check':
        return this.handleEnterReadyCheck()
      case 'start-game':
        return this.handleStartGame()
    }
  }

  handleStartGame () {
    this.emit('start-game')
  }

  handleEnterReadyCheck () {
    this.isInReadyCheck = true

    this.render()
  }

  handleClientListUpdate (clients) {
    this.clientList = clients

    this.render()
  }

  renderReadyCheck () {
    this.element.innerHTML = readyCheckTemplate({
      clients: this.clientList.map(client => ({id: client.id, ready: client.ready}))
    })

    const readyCheckbox = this.element.querySelector('[name="readyCheck"]')

    const client = this.clientList.find(client => client.id === this.client)

    if (client) {
      readyCheckbox.checked = client.ready
    }

    readyCheckbox.addEventListener('click', e => {
      this.serverSocket.request('lobby-ready', { lobbyId: this.id, ready: readyCheckbox.checked })
    })
  }

  render () {
    if (this.isInReadyCheck) {
      this.renderReadyCheck()
    } else {
      this.renderLobby()
    }
  }

  renderLobby () {
    const clientList = this.clientList.map(client => client.id).join(', ')
    this.element.innerHTML = template({lobbyId: this.id, clientList})
  }

  showLobby ({lobbyId}) {
    this.id = lobbyId

    this.render()
  }

  lobbyCreated ({lobbyId}) {
    this.showLobby({lobbyId})
  }

  lobbyJoined ({lobbyId}) {
    this.showLobby({lobbyId})
  }

  join (lobby) {
    this.element.innerHTML = 'Joining lobby...'

    this.serverSocket.request('join-lobby', { lobbyId: lobby }).then(resp => {
      if (resp.error) {
        this.element.innerHTML = `Could not join lobby: ${resp.error}`
        return
      }

      this.lobbyJoined(resp)
    }).catch(err => {
      window.alert('Could not join lobby ' + lobby)

      throw err
    })
  }

  create () {
    this.element.innerHTML = 'Creating lobby....'
    this.serverSocket.request('create-lobby').then(this.lobbyCreated.bind(this)).catch(err => {
      window.alert('Could not create lobby :(')
      throw err
    })
  }
}
