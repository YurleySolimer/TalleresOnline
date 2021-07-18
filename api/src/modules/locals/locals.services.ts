import { Document, Types } from 'mongoose'
import path from 'path'
import fs from 'fs-extra'

import Local from './Locals.models'

export async function createLocal(
  data: any,
  file: any
): Promise<Document | null> {
  try {
    const { name, address, district, phone, ruc, email, user } = data

    //Suscription Object

    const suscripcion = {
      suscriptionType: 'N/A',
      payDate: new Date(),
      plan: {
        name: 'Free',
        access: 5,
        estadisticas: true,
        orders: true,
        proforms: true,
        invoices: true,
      },
    }

    var newLocal = {}

    if (file) {
      const { originalname, path } = file

      //Pic Object
      const pic = {
        picName: originalname,
        picPath: path,
      }

      newLocal = {
        name,
        address,
        district,
        phone,
        ruc,
        email,
        user,
        pic,
        suscripcion,
      }
    } else if (!file) {
      //Local
      newLocal = {
        name,
        address,
        district,
        phone,
        ruc,
        email,
        user,
        suscripcion,
      }
    }

    //Insert into BD

    const local = new Local(newLocal)
    const savedLocal = await local.save()
    if (!savedLocal) {
      return null
    }
    return savedLocal
  } catch (error) {
    return Promise.reject(error)
  }
}

export async function getLocal(localId: string): Promise<Document | null> {
  try {
    const local = await Local.findById(localId)
    if (!local) {
      return null
    }
    return local
  } catch (error) {
    return Promise.reject(error)
  }
}

export async function getLocals(): Promise<Document> {
  try {
    const locals = await Local.find()
    return locals
  } catch (error) {
    return Promise.reject(error)
  }
}

export async function deleteLocal(localId: string): Promise<Document | null> {
  try {
    const local = await Local.findByIdAndDelete(localId)
    if (!local) {
      return null
    }
    if (local.pic.picPath) {
      await fs.unlink(path.resolve(local.pic.picPath))
    }
    return local
  } catch (error) {
    return Promise.reject(error)
  }
}

export async function updateLocal(
  data: any,
  file: any,
  localId: string
): Promise<Document | null | undefined> {
  const { name, address, district, phone, ruc, email } = data

  if (file) {
    const pic = {
      picName: file.originalname,
      picPath: file.path,
    }

    const local = {
      name,
      address,
      district,
      phone,
      ruc,
      email,
      pic,
    }

    const localUpdated = await Local.findByIdAndUpdate(localId, local)
    if (!localUpdated) {
      return null
    }
    await fs.unlink(path.resolve(localUpdated.pic.picPath))
    return localUpdated
  } else if (!file) {
    const localUpdated = await Local.findByIdAndUpdate(localId, data)
    if (!localUpdated) {
      return null
    }
    return localUpdated
  }
}
