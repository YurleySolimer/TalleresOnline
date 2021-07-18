import { RequestHandler } from 'express'
import { Document, Types } from 'mongoose'
import path from 'path'
import fs from 'fs-extra'

import Cars from './Cars.model'

export async function createCar(
  data: any,
  files: any
): Promise<Document | null> {
  //Revisar si ya existe el carro
  const car = await Cars.findOne({ placa: data.placa })

  if (car) {
    return car
  } else if (!car) {
    const fotos: any = files
    var pics: Array<Object> = []

    if (files) {
      for (var i = 0; i < fotos.length; i++) {
        const pathPic = fotos[i].path
        const originalname = fotos[i].originalname
        pics[i] = {
          fotoNombre: originalname,
          fotoUbicacion: pathPic,
        }
      }
    }

    const newCar = {
      placa: data.placa,
      modelo: data.modelo,
      marca: data.marca,
      carType: data.carType,
      año: data.año,
      nivel_gasolina: data.nivel_gasolina,
      observacion: data.observacion,
      description: data.description,
      kilometraje: data.kilometraje,
      pics,
    }

    //Insertar en la BD
    const newcar = new Cars(newCar)
    const savedCar = await newcar.save()
    return savedCar
  }
  return null
}

export async function getCar(carId: string): Promise<Document | null> {
  try {
    const car = await Cars.findById(carId)
    if (!car) {
      return null
    }
    return car
  } catch (error) {
    return Promise.reject(error)
  }
}

export async function getCars(): Promise<Document> {
  try {
    const cars = await Cars.find()
    return cars
  } catch (error) {
    return Promise.reject(error)
  }
}

export async function deleteCar(carId: string): Promise<Document | null> {
  try {
    const car = await Cars.findByIdAndDelete(carId)
    if (!car) {
      return null
    }
    if (car.pic.length > 0) {
      for (var i = 0; i < car.pic.length; i++) {
        await fs.unlink(path.resolve(car.pic[i].picPath))
      }
    }
    return car
  } catch (error) {
    return Promise.reject(error)
  }
}

export async function updateCar(
  data: any,
  file: any,
  carId: string
): Promise<Document | null | undefined> {
  const fotos: any = file

  if (file) {
    var pics: Array<Object> = []

    for (var i = 0; i < fotos.length; i++) {
      const pathPic = fotos[i].path
      const originalname = fotos[i].originalname
      pics[i] = {
        fotoNombre: originalname,
        fotoUbicacion: pathPic,
      }
    }

    const car = {
      data,
      pics,
    }

    const carUpdated = await Cars.findByIdAndUpdate(carId, car)
    if (!carUpdated) {
      return null
    }
    await fs.unlink(path.resolve(carUpdated.pic.picPath))
    return carUpdated
  } else if (!file) {
    const carUpdated = await Cars.findByIdAndUpdate(carId, data)
    if (!carUpdated) {
      return null
    }
    return carUpdated
  }
}
