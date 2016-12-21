import { EventEmitter } from 'events'

export default class Game extends EventEmitter {
  constructor (serverSocket, client) {
    super()
    this.element = document.createElement('div')

    this.client = client
    this.serverSocket = serverSocket
    serverSocket.socket.on('lobby-update', ({id, message, params}) => {
      if (id === this.id) {
        this.handleMessage(message, params)
      }
    })
  }

  load () {

  }
}
