import { Document, Types } from 'mongoose'

import Client from './Clients.model'

export async function createClient(data: any): Promise<Document | null> {
  //Revisar si ya existe el client
  const rucExist = await Client.findOne({ ruc: data.ruc })

  if (rucExist) {
    //Agregar +1 visita & fecha
    //tipo: recurrente
    //Obtengo _id del cliente
    return rucExist
  } else if (!rucExist) {

    //Creo Cliente - Local  
    const locals = {
      local: data.local,
      visits: 1,
      lastVisit: new Date(),
      clientType: 'Nuevo'
    }

    //Creo Address
    const address = {
      district: data.district,
      department: data.department,
      providence: data. providence
    }

    //Creo nuevo Cliente
    const newClient = {
      name: data.name,
      lastname: data.lastaname,
      email: data.email,
      phone: data.phone,
      gender: data.gender,
      ruc: data.ruc,
      howKnow: data.howKnow,
      address,
      locals
    }

    //Inserto en la BD
    const newclient = new Client(newClient)
    const savedClient = await newclient.save()
    console.log(savedClient)
    return savedClient
  }

  return null
}

export async function getClient(clientId: string): Promise<Document | null> {
  try {
    const client = await Client.findById(clientId)
    if (!client) {
      return null
    }
    return client
  } catch (error) {
    return Promise.reject(error)
  }
}

export async function getClients(): Promise<Document> {
  try {
    const clients = await Client.find()
    return clients
  } catch (error) {
    return Promise.reject(error)
  }
}

export async function deleteClient(clientId: string): Promise<Document | null> {
  try {
    const client = await Client.findByIdAndDelete(clientId)
    if (!client) {
      return null
    }
    return client
  } catch (error) {
    return Promise.reject(error)
  }
}

export async function updateClient(
  data: any,
  clientId: string
): Promise<Document | null> {
  const clientUpdated = await Client.findByIdAndUpdate(clientId, data)
  if (!clientUpdated) {
    return null
  }
  return clientUpdated
}
