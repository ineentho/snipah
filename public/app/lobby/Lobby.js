import template from './lobby.hbs'

export default class Lobby {
  constructor (serverSocket) {
    this.element = document.createElement('div')

    this.element.innerHTML = 'Creating lobby....'

    this.serverSocket = serverSocket

    const lobby = serverSocket.request('create-lobby').then(this.lobbyCreated.bind(this)).catch(err => {
      alert('Could not create lobby :(')
      throw err
    })
  }

  lobbyCreated ({lobbyId}) {
    this.element.innerHTML = template({lobbyId})
  }
}
