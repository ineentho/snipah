import template from './lobby.hbs'
import readyCheckTemplate from './readyCheck.hbs'
import optionsTemplate from './options.hbs'
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
      case 'lobby-options':
        return this.handleLobbyOptions(params)
    }
  }

  handleLobbyOptions (lobbyOptions) {
    this.lobbyOptions = lobbyOptions
    this.render('lobby-options')
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

    this.element.querySelector('[name="options"]').appendChild(this.renderOptions())
  }

  render (cause) {
    if (cause === 'lobby-options') {
      const optionsElement = this.element.querySelector('[name="options"]')
      if (optionsElement) {
        optionsElement.innerHTML = ''
        optionsElement.appendChild(this.renderOptions())
      }
    } else {
      if (this.isInReadyCheck) {
        this.renderReadyCheck()
      } else {
        this.renderLobby()
      }
    }
  }

  renderLobby () {
    const clientList = this.clientList.map(client => client.id).join(', ')
    this.element.innerHTML = template({lobbyId: this.id, clientList})

    this.element.querySelector('[name="options"]').appendChild(this.renderOptions())
  }

  isHost () {
    return this.clientList && this.clientList[0] && this.clientList[0].id === this.client
  }

  renderOptions () {
    const disabled = !this.isHost()

    const element = document.createElement('div')

    if (!this.lobbyOptions) {
      return element
    }

    element.innerHTML = optionsTemplate()

    const scopeZoomSlider = element.querySelector('[name="scopeZoomLevel"]')
    const scopeZoomLabel = element.querySelector('[name="scopeZoomLevelText"]')
    const mapSelect = element.querySelector('[name="mapSelect"]')

    scopeZoomSlider.value = this.lobbyOptions.scopeZoom

    const zoomLabel = val => `${val}x`

    scopeZoomLabel.innerText = zoomLabel(scopeZoomSlider.value)

    mapSelect.value = this.lobbyOptions.map

    scopeZoomSlider.disabled = mapSelect.disabled = disabled

    scopeZoomSlider.addEventListener('input', () => {
      scopeZoomLabel.innerText = zoomLabel(scopeZoomSlider.value)

      this.lobbyOptions.scopeZoom = scopeZoomSlider.value
      this.sendLobbyOptions()
    })

    mapSelect.addEventListener('change', () => {
      this.lobbyOptions.map = mapSelect.value
      this.sendLobbyOptions()
    })

    return element
  }

  sendLobbyOptions () {
    this.serverSocket.request('set-lobby-options', { lobbyId: this.id, lobbyOptions: this.lobbyOptions })
  }

  showLobby ({lobbyId}) {
    this.id = lobbyId

    this.render()
  }

  lobbyCreated ({lobbyId}) {
    this.showLobby({lobbyId})

    window.history.pushState({}, '', `/g/${lobbyId}`)
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
