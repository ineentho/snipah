import io from 'socket.io-client'
import { EventEmitter } from 'events'

let i = Date.now()

export default class ServerSocket extends EventEmitter {
  constructor () {
    super()
    this.socket = io(`${window.location.protocol}//${window.location.host}`)

    this.socket.on('connect', () => {
      this.emit('connect')
    })

    this.socket.on('respone', this.onResponse.bind(this))

    this.requestMap = {}
  }

  createNewRequest () {
    let respond
    const promise = new Promise((resolve, reject) => {
      respond = (message) => {
        resolve(message)
      }
    })
    return {
      ticket: i++,
      promise,
      respond
    }
  }

  request (method, params) {
    const { ticket, promise, respond } = this.createNewRequest()

    this.socket.emit('request', { ticket, method, params })
    this.requestMap[ticket] = { promise, respond }

    return promise
  }

  onResponse ({ticket, message}) {
    if (this.requestMap[ticket]) {
      this.requestMap[ticket].respond(message)
      delete this.requestMap[ticket]
    }
  }

  destroy () {
    this.socket.disconnect()
  }

}
