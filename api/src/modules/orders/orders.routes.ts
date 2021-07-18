import { Router } from 'express'
const router = Router()

import * as ordersCtrl from './orders.services'
import * as clientCtrl from '../clients/clients.services'
import * as carsCtrl from '../cars/cars.services'
import multer from '../../libs/multer'

//Create a order
router.post('/order', multer.array('image'), async (req, res) => {
  try {
    const data = req.body
    const file = req.files
    const client = await clientCtrl.createClient(data)
    const car = await carsCtrl.createCar(data, file)
    const order = await ordersCtrl.createOrder(data, client, car)
    res.status(201).json({ message: 'Order saved', order })
  } catch (error) {
    console.log(error)
    res.status(400).json(error)
  }
})

//Get a order by Id
router.get('/order/:id', async (req, res) => {
  try {
    const orderId = req.params.id
    const order = await ordersCtrl.getOrder(orderId)
    if (!order) {
      res.status(204).json({})
    } else if (order) {
      res.status(200).json(order)
    }
  } catch (error) {
    res.status(400).json(error)
  }
})

//Get all orders
router.get('/orders', async (req, res) => {
  try {
    const order = await ordersCtrl.getOrders()
    res.status(200).json(order)
  } catch (error) {
    res.status(400).json(error)
  }
})

//Delete a order by Id
router.delete('/order/:id', async (req, res) => {
  try {
    const orderId = req.params.id
    const order = await ordersCtrl.deleteOrder(orderId)
    if (!order) {
      res.status(204).json({})
    } else if (order) {
      res.status(200).json(order)
    }
  } catch (error) {
    console.log(error)
    res.status(400).json(error)
  }
})

//Update a order by Id
router.put('/order/:id', multer.array('image'), async (req, res) => {
  try {
    const orderId = req.params.id
    const data = req.body
    const file = req.files
    const order = await ordersCtrl.updateOrder(data, orderId, file)
    res.status(200).json({ message: 'order updated', order })
  } catch (error) {
    res.status(400).json(error)
  }
})

export default router
