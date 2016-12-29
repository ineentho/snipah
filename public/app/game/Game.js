import {EventEmitter} from 'events'
import {loadMap} from 'app/util/mapLoader.js'
import Stats from 'stats.js'
import './game.scss'
import {autoDetectRenderer, Container, Sprite} from 'pixi.js'

export default class Game extends EventEmitter {
  constructor (serverSocket, client) {
    super()

    this.element = document.createElement('div')
    this.element.classList.add('snipah-game')

    this.resize = this.resize.bind(this)
    this.updatePosition = this.updatePosition.bind(this)

    this.sensitivity = 1

    this.stats = new Stats()

    this.element.appendChild(this.stats.dom)

    loadMap('floaty').then(map => {
      this.map = map

      this.initialize()
      this.setZoom(.5)
    })

    this.gameLoop = this.gameLoop.bind(this)
  }

  setZoom (zoom) {
    this.zoom = this.stage.scale.x = this.stage.scale.y = zoom
    this.updatePosition()
  }

  initialize () {
    this.element.addEventListener('click', () => this.requestPointerLock())
    this.renderer = autoDetectRenderer(1920, 1080)
    this.element.appendChild(this.renderer.view)

    this.renderer.view.style.position = 'absolute'
    this.renderer.view.style.display = 'block'
    this.renderer.autoResize = true
    this.resize()

    this.stage = new Container()

    window.addEventListener('resize', this.resize)
    document.addEventListener('mousemove', this.updatePosition)

    const layers = this.map.layers

    this.backgroundSpites = layers.map(layer => new Sprite(layer.texture))
    this.backgroundSpites.forEach(sprite => {
      this.stage.addChild(sprite)
    })

    this.mapSize = [
      Math.max(...layers.map(l => l.texture.width)),
      Math.max(...layers.map(l => l.texture.height))
    ]

    this.done = true

    this.updatePosition()
    this.gameLoop()
  }

  resize () {
    this.renderer.resize(window.innerWidth, window.innerHeight)
    if (this.done) {
      this.updatePosition()
    }
  }

  updatePosition (e) {
    if (e) {
      this.stage.x -= e.movementX * this.sensitivity
      this.stage.y -= e.movementY * this.sensitivity
    }

    const rightBoundary = this.mapSize[0] * this.zoom - window.innerWidth

    if (rightBoundary < 0) {
      this.stage.x = -rightBoundary / 2
    } else {
      if (this.stage.x > 0) {
        this.stage.x = 0
      }
      if (this.stage.x < -rightBoundary) {
        this.stage.x = -rightBoundary
      }
    }

    const bottomBoundary = this.mapSize[1] * this.zoom - window.innerHeight

    if (bottomBoundary < 0) {
      this.stage.y = -bottomBoundary / 2
    } else {
      if (this.stage.y > 0) {
        this.stage.y = 0
      }
      if (this.stage.y < -bottomBoundary) {
        this.stage.y = -bottomBoundary
      }
    }
  }

  requestPointerLock () {
    this.element.requestPointerLock()
  }

  gameLoop () {
    if (this.destroyed) {
      return
    }

    window.requestAnimationFrame(this.gameLoop)
    this.stats.begin()

    this.renderer.render(this.stage)

    this.stats.end()
  }

  destroy () {
    this.destroyed = true
    window.removeEventListener('resize', this.resize)
    document.removeEventListener('mousemove', this.updatePosition)
  }
}
