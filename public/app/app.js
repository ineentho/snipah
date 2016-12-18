import 'systemjs-hot-reloader/default-listener.js'
import Menu from './menu/Menu.js'
import Game from './game/Game.js'
import Lobby from './lobby/Lobby.js'
import ServerSocket from './serverSocket.js'
import template from './app.hbs'

import './app.scss'

const appElement = document.querySelector('#game')

appElement.innerHTML = template()

const gameElement = appElement.querySelector('[name="game"]')
const statusElement = appElement.querySelector('[name="status"]')

const setView = (element) => {
  gameElement.innerHTML = ''
  gameElement.appendChild(element)
}

const menu = new Menu(gameElement)

setView(menu.element)

const serverSocket = new ServerSocket()

menu.on('select-level', level => {
  const lobby = new Lobby(serverSocket)

  setView(lobby.element)
})

serverSocket.on('connect', () => {
  statusElement.innerHTML = 'connected'
})
