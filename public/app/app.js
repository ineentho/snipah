import 'systemjs-hot-reloader/default-listener.js'
import Menu from './menu/Menu.js'
import Lobby from './lobby/Lobby.js'
import ServerSocket from './serverSocket.js'
import template from './app.hbs'
import Game from './game/Game.js'

import './app.scss'

const appElement = document.querySelector('#game')

appElement.innerHTML = template()

const gameElement = appElement.querySelector('[name="game"]')
const statusElement = appElement.querySelector('[name="status"]')

const setView = (element) => {
  gameElement.innerHTML = ''
  gameElement.appendChild(element)
}

const serverSocket = new ServerSocket()

let client

serverSocket.socket.on('identity', (id) => {
  statusElement.innerHTML = `connected as ${id}`
  client = id

  bootstrap()
})

const createGame = () => {
  const game = new Game(serverSocket, client)

  setView(game.element)
}

const createLobby = () => {
  const lobby = new Lobby(serverSocket, client)
  setView(lobby.element)

  lobby.on('start-game', () => {
    createGame()
  })

  return lobby
}

const createMenu = () => {
  const menu = new Menu()
  setView(menu.element)

  menu.on('select-level', level => {
    const lobby = createLobby()
    lobby.create()
  })
}

const bootstrap = () => {
  const routeJoinGame = /^\/g\/([0-9]*)$/.exec(window.location.pathname)

  if (routeJoinGame) {
    const lobby = createLobby()
    lobby.join(parseInt(routeJoinGame[1]))
  } else if (window.location.pathname === '/sp') {
    createGame()
  } else if (window.location.pathname !== '/') {
    window.history.pushState({}, '', '/')
    createMenu()
  } else {
    createMenu()
  }
}
