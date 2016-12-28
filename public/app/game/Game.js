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

    this.sensitivity = 1

    this.stats = new Stats()

    this.element.appendChild(this.stats.dom)

    loadMap('floaty').then(map => {
      this.map = map

      console.log(map)

      this.initialize()
    })

    this.gameLoop = this.gameLoop.bind(this)
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

    window.addEventListener('resize', this.resize.bind(this))
    document.addEventListener('mousemove', this.updatePosition.bind(this), false)

    this.backgroundSpites = this.map.layers.map(layer => new Sprite(layer.texture))
    this.backgroundSpites.forEach(sprite => {
      this.stage.addChild(sprite)
    })

    this.gameLoop()
  }

  resize () {
    this.renderer.resize(window.innerWidth, window.innerHeight)
  }

  updatePosition (e) {
    this.stage.x -= e.movementX * this.sensitivity
    this.stage.y -= e.movementY * this.sensitivity
  }

  requestPointerLock () {
    this.element.requestPointerLock()
  }

  gameLoop () {
    window.requestAnimationFrame(this.gameLoop)
    this.stats.begin()

    this.renderer.render(this.stage)

    this.stats.end()
  }
}
