/* Consigna: 
----------------------------------------------------------------------------------

-----------------------------------------------------------------------------------------
*/

const { config, staticFiles } = require('../config/environment')
const express = require('express')

const { logger, loggererr } = require('../log/logger')

//--- Para servidor FORK & CLUSTER
const cluster = require('cluster')
const numCPUs = require('os').cpus().length



//-------------------------- PROCESO BASE INICIO -------------------------------  
//------------------------------------------------------------------------------
const baseProcces = () => {

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Proceso ${worker.process.pid} caido!`)
    cluster.fork()
  })

  //--- Servicios Express
  const expressSession = require('express-session')
  const { Server: HttpServer } = require('http')
  const { Server: Socket } = require('socket.io')
  const app = express()
  const httpServer = new HttpServer(app)
  const io = new Socket(httpServer)

  //--- Routes
  const productRouter = require('../routes/productRouter')
  const sessionRouter = require('../routes/sessionRouter')
  const infoRouter = require('../routes/infoRouter')

  //--- Databases
  const MongoStore = require('connect-mongo')
  const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true }

  //--- Objetos locales
  const { newProductController, getAllProductsController } = require('../controllers/productsController')
  const { getAllChatsController, addChatMsgController } = require('../controllers/chatsController')
 

  //--- Middlewares
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(express.static(staticFiles))
  app.use(expressSession({
    store: MongoStore.create({
      mongoUrl: process.env.MONGOCREDENTIALSESSION,
      mongoOptions: advancedOptions
    }),
    secret: 'secret-pin',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 600000
    }
  }))
  
  //app.use(compression())

  
  //--- SOCKET
  io.on('connection', async socket => {
    console.log('Nuevo cliente conectado!')

    //-- Tabla inicial al cliente
    socket.emit('productos', await getAllProductsController())
 
    //-- Nuevo producto desde cliente
    socket.on('update', async producto => {
      await newProductController( producto )
      io.sockets.emit('productos', await getAllProductsController())
    })
  
    //-- Chat inicial al cliente
    socket.emit('mensajes', await getAllChatsController())

    //-- Nuevo mensaje desde el cliente
    socket.on('newMsj', async mensaje => {
      mensaje.date = new Date().toLocaleString()
      await addChatMsgController( mensaje ) 
      io.sockets.emit('mensajes', await getAllChatsController())
    })

  })


  //--- ROUTES
  //--- SESSION ROUTER 
  app.use('/session', sessionRouter)

  //--- API REST ROUTER 
  app.use('/api', productRouter)

  //--- INFO ROUTER
  app.use('/info', infoRouter)

  //--- Rutas no implementadas
  app.get('*', (req, res) => {
    logger.warn(`Ruta: ${req.url}, metodo: ${req.method} no implemantada`)
    res.send(`Ruta: ${req.url}, metodo: ${req.method} no implemantada`)
  })


  //--- SERVER ON
  let PORT = ( config.port) ? config.port : 8080 // puerto por defecto 8080

  if ( config.mode === 'CLUSTER') { // para CLUSTER si la clave same es 1 crea un puerto para cada worker
    PORT = config.same === 1 ? PORT + cluster.worker.id - 1 : PORT
  } 

  const server = httpServer.listen(PORT, () => {
    console.log(`Servidor http escuchando en el puerto ${server.address().port}`)
  })
  server.on('error', error => loggererr.error(`Error en servidor ${error}`))
  
}
//------------------------------ PROCESO BASE FIN -----------------------------------  
//-----------------------------------------------------------------------------------



//---------------------------- LOGICA CLUSTER / FORK  -------------------------------

if ( config.mode != 'CLUSTER' ) { 

  //-- Servidor FORK
  console.log('Server en modo FORK')
  console.log('-------------------')
  baseProcces()
  } else { 

    //-- Servidor CLUSTER   
    if (cluster.isPrimary) {
      console.log('Server en modo CLUSTER')
      console.log('----------------------')
      for (let i = 0; i < numCPUs; i++) { // creo tantos procesos como cpus tengo
        cluster.fork()
      }
    } else {
      baseProcces()
    }
  }




