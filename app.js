const Koa = require('koa')
const Router = require('koa-router')
const send = require('koa-send')

const app = new Koa()

const server = require('http').Server(app.callback())

const router = new Router()

app.use(require('koa-static')('./public'))

const indexFile = process.env.NODE_ENV === 'production' ? './index-production.html' : './index-development.html'

const fallbackRoute = () => {
  return ctx => {
    return send(ctx, indexFile)
  }
}

app
  .use(router.routes())
  .use(router.allowedMethods())
  .use(fallbackRoute())

const port = process.env.PORT || 3000

console.log(`Listening on port ${port}`)
server.listen(port)

require('./server/socketServer.js')(server)
