const Koa = require('koa')
const Router = require('koa-router')

const app = new Koa()


const router = new Router()

app.use(require('koa-static')('./public'))

app
  .use(router.routes())
  .use(router.allowedMethods())


const port = process.env.PORT || 3000

console.log(`Listening on port ${port}`)
app.listen(port)
