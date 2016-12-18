const Koa = require('koa')
const Router = require('koa-router')

const app = new Koa()

const server = require('http').Server(app.callback())

const router = new Router()

app.use(require('koa-static')('./public'))

app
  .use(router.routes())
  .use(router.allowedMethods())


const port = process.env.PORT || 3000

console.log(`Listening on port ${port}`)
server.listen(port)

require('./server/socketServer.js')(server)
