const Lobby = require('./Lobby.js')

const lobbys = {}

const createNewLobby = () => {

  const lobby = new Lobby()

  lobbys[lobby.id] = lobby

  return lobby
}


const findLobby = (id) => {
  return lobbys[lobby.id]
}

const joinLobby = (id) => {
  
}

module.exports = { createNewLobby, findLobby }
