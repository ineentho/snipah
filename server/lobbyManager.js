const Lobby = require('./Lobby.js')

const lobbys = {}

const createNewLobby = () => {

  const lobby = new Lobby()

  lobbys[lobby.id] = lobby

  return lobby
}


const findLobby = (id) => {
  return lobbys[id]
}

module.exports = { createNewLobby, findLobby }
