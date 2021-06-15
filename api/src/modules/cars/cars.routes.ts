import { Router } from 'express'

const router = Router()

import multer from '../../libs/multer'
import * as carsCtrl from './cars.services'

//Create a car
router.post('/car', multer.array('image'), async (req, res) => {
  try {
    const data = req.body
    const files = req.files
    const car = await carsCtrl.createCar(data, files)
    res.status(201).json({ message: 'Car saved', car })
  } catch (error) {
    res.status(400).json(error)
  }
})

//Get a Car by Id
router.get('/car/:id', async (req, res) => {
  try {
    const carId = req.params.id
    const car = await carsCtrl.getCar(carId)
    if (!car) {
      res.status(204).json({})
    } else if (car) {
      res.status(200).json(car)
    }
  } catch (error) {
    res.status(400).json(error)
  }
})

//Get all Cars
router.get('/cars', async (req, res) => {
  try {
    const cars = await carsCtrl.getCars()
    res.status(200).json(cars)
  } catch (error) {
    res.status(400).json(error)
  }
})

//Delete a Car by Id
router.delete('/car/:id', async (req, res) => {
  try {
    const carId = req.params.id
    const car = await carsCtrl.deleteCar(carId)
    if (!car) {
      res.status(204).json({})
    } else if (car) {
      res.status(200).json(car)
    }
  } catch (error) {
    console.log(error)
    res.status(400).json(error)
  }
})

//Update a Car by Id
router.put('/car/:id', multer.array('image'), async (req, res) => {
  try {
    const carId = req.params.id
    const data = req.body
    const file = (req as any).files
    const car = await carsCtrl.updateCar(data, file, carId)
    res.status(200).json({ message: 'Car updated', car })
  } catch (error) {
    res.status(400).json(error)
  }
})

export default router
