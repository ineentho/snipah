const lobbyManager = require('./lobbyManager.js')
let idCounter = 0

module.exports = class Lobby {
  constructor () {
    this.id = idCounter++
  }
}
