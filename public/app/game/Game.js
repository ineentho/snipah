import { EventEmitter } from 'events'
import { loadMap } from 'app/util/mapLoader.js'
import Stats from 'stats.js'
import './game.scss'

export default class Game extends EventEmitter {
  constructor (serverSocket, client) {
    super()
    this.element = document.createElement('div')
    this.element.classList.add('snipah-game')

    this.canvas = document.createElement('canvas')
    this.element.appendChild(this.canvas)

    this.stats = new Stats()
    document.body.appendChild(this.stats.dom)

    this.sensitivity = 0.2

    this.client = client
    this.serverSocket = serverSocket
    serverSocket.socket.on('lobby-update', ({id, message, params}) => {
      if (id === this.id) {
        this.handleMessage(message, params)
      }
    })

    this.load()

    this.cameraX = 0
    this.cameraY = 0

    this.canvas.addEventListener('click', () => this.requestPointerLock())
  }

  resize () {
    this.canvas.width = this.canvas.clientWidth
    this.canvas.height = this.canvas.clientWidth
    this.draw()
  }

  updatePosition (e) {
    this.cameraX -= e.movementX * this.sensitivity
    this.cameraY -= e.movementY * this.sensitivity
  }

  requestPointerLock () {
    this.canvas.requestPointerLock()
  }

  load () {
    this.ctx = this.canvas.getContext('2d')

    loadMap('floaty').then(map => {
      this.map = map
      document.addEventListener('mousemove', this.updatePosition.bind(this), false)
      window.addEventListener('resize', this.resize.bind(this))

      this.loop = this.loop.bind(this)
      this.resize()
      this.requestNextLoop()
    })
  }

  requestNextLoop () {
    window.requestAnimationFrame(this.loop)
  }

  draw () {
    const ctx = this.ctx

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    ctx.translate(this.cameraX, this.cameraY)

    this.map.layers.forEach(layer => {
      ctx.drawImage(layer.image, 0, 0)
    })
  }

  loop () {
    this.stats.begin()
    this.draw()
    this.stats.end()
    this.requestNextLoop()
  }
}
