import { Document, Types } from 'mongoose'

import Proform from './Proforms.modesl'

export async function createProform(data: any): Promise<Document | null> {
    //Inserto en la BD
    const proform = new Proform(data)
    const savedProform = await proform.save()
    return savedProform
}

export async function getProform(proformId: string): Promise<Document | null> {
  try {
    const proform = await Proform.findById(proformId)
    if (!proform) {
      return null
    }
    return proform
  } catch (error) {
    return Promise.reject(error)
  }
}

export async function getProforms(): Promise<Document> {
  try {
    const proforms = await Proform.find()
    return proforms
  } catch (error) {
    return Promise.reject(error)
  }
}

export async function deleteProform(proformId: string): Promise<Document | null> {
  try {
    const proform = await Proform.findByIdAndDelete(proformId)
    if (!proform) {
      return null
    }
    return proform
  } catch (error) {
    return Promise.reject(error)
  }
}

export async function updateProform(
  data: any,
  proformId: string
): Promise<Document | null> {
  const proformUpdated = await Proform.findByIdAndUpdate(proformId, data)
  if (!proformUpdated) {
    return null
  }
  return proformUpdated
}
