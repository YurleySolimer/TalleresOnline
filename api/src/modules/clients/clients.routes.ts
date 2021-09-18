import { Router } from 'express'
const router = Router()

import * as clientCtrl from './clients.services'
import { verifyId } from '../../middlewares/verifyId'


//Create a Client
router.post('/client', async (req, res) => {
  try {
    const data = req.body
    const client = await clientCtrl.createClient(data)
    res.status(201).json({ message: 'Client saved', client })
  } catch (error) {
    res.status(400).json(error)
  }
})

//Get a Client by Id
router.get('/client/:id', verifyId, async (req, res) => {
  try {
    const clientId = req.params.id
    const client = await clientCtrl.getClient(clientId)
    if (!client) {
      res.status(204).json({})
    } else if (client) {
      res.status(200).json(client)
    }
  } catch (error) {
    res.status(400).json(error)
  }
})

//Get all Clients
router.get('/clients', async (req, res) => {
  try {
    const client = await clientCtrl.getClients()
    res.status(200).json(client)
  } catch (error) {
    res.status(400).json(error)
  }
})

//Delete a Client by Id
router.delete('/client/:id', verifyId, async (req, res) => {
  try {
    const clientId = req.params.id
    const client = await clientCtrl.deleteClient(clientId)
    if (!client) {
      res.status(204).json({})
    } else if (client) {
      res.status(200).json(client)
    }
  } catch (error) {
    console.log(error)
    res.status(400).json(error)
  }
})

//Update a Client by Id
router.put('/client/:id', verifyId, async (req, res) => {
  try {
    const clientId = req.params.id
    const data = req.body
    const client = await clientCtrl.updateClient(data, clientId)
    res.status(200).json({ message: 'Client updated', client })
  } catch (error) {
    res.status(400).json(error)
  }
})

export default router
