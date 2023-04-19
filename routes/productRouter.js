const { Router } = require('express')  
const productRouter = Router() 

const { newProductController, getAllProductsController, getProductByIdController, delProductByIdController } = require('../controllers/productsController')
const { mock5 } = require('../DAO/mockFaker')
const { logger, loggererr } = require('../log/logger')



/* ------------------ router productos ----------------- */
//------------- get productos
productRouter.get(
  '/productos',
  async (req, res) => {
    const products = await getAllProductsController()
    logger.info(`Ruta: /api${req.url}, metodo: ${req.method}`)
    res.json( products )
  }
)


//------------ get producto segun id
productRouter.get(
  '/productos/:id',
  async (req, res) => {
    const product = await getProductByIdController( req.params.id )
    if ( product ) {
      logger.info(`Ruta: /api${req.url}, metodo: ${req.method}`)
      res.json( product )
    } else {
      loggererr.error(`Producto id: ${id} no encontrado`) 
      res.status(404).send({ error: 'producto no encontrado'})
    }
  }
)


//--------------------- post producto
productRouter.post(
  '/productos/nuevo',
  async (req, res) => {
    const productToAdd = req.body
    const loaded = await newProductController ( productToAdd )
    if ( loaded ) {
      logger.info(`Producto agregado correctamente`)
    } else {
      logger.info(`No se pudo agregar producto, datos incorrectos`)
    }
    res.redirect('/')
  }
)


//---------------------- put producto
productRouter.put(
  '/productos/:id',
  async (req, res) => {
    if(await modifyProductByIdController( req.params.id, req.body )){
      logger.info(`Ruta: /api${req.url}, metodo: ${req.method}`)
      res.send({ message: 'producto modificado'})
    } else {
      loggererr.error(`Producto id: ${id} no encontrado`) 
      res.status(404).send({ error: 'producto no encontrado'})
    }
  }
)


//------------------------- delete producto
productRouter.delete(
  '/productos/:id',
  async (req, res) => {
    const id = req.params.id
    if (await delProductByIdController(id)) {
      logger.info(`Ruta: /api${req.url}, metodo: ${req.method}`)
      res.send({ message: 'producto borrado'})
    } else {
      loggererr.error(`Producto id: ${id} no encontrado`) 
      res.status(404).send({ error: 'producto no encontrado'})
    }
  }
) 


//---------------- get Test
//------------- get productos
productRouter.get(
  '/productos-test',
  async (req, res) => {
    const allProducts = await mock5.getAll()
    let tabla = '<table>'
    tabla += '<tr><th>Producto</th><th>Precio</th><th>Imagen</th></tr>'
    
    allProducts.forEach((fila) => {
      tabla += `
        <tr>
          <td>${fila.title}</td>
          <td>${fila.price}</td>
          <td><img src="${fila.thumbnail}" alt="${fila.title}" width="64" heigth="48"></td>
        </tr>`
     })
    tabla += '</table>'

    logger.info(`Ruta: /api${req.url}, metodo: ${req.method}`)
    res.send(tabla)

  }
)


module.exports = productRouter