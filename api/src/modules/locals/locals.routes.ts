import { Router } from 'express'

const router = Router()

import multer from '../../libs/multer'
import * as localCtrl from './locals.services'
import { verifyId } from '../../middlewares/verifyId'


//Create a Local
router.post('/local', multer.single('image'), async (req, res) => {
  try {
    const data = req.body
    const file = req.file
    const local = await localCtrl.createLocal(data, file)
    res.status(201).json({ message: 'Local saved', local })
  } catch (error) {
    res.status(400).json(error)
  }
})

//Get a Local by Id
router.get('/local/:id', verifyId, async (req, res) => {
  try {
    const localId = req.params.id
    const local = await localCtrl.getLocal(localId)
    if (!local) {
      res.status(204).json({})
    } else if (local) {
      res.status(200).json(local)
    }
  } catch (error) {
    res.status(400).json(error)
  }
})

//Get all Locals
router.get('/locals', async (req, res) => {
  try {
    const locals = await localCtrl.getLocals()
    res.status(200).json(locals)
  } catch (error) {
    res.status(400).json(error)
  }
})

//Delete a Local by Id
router.delete('/local/:id', verifyId, async (req, res) => {
  try {
    const localId = req.params.id
    const local = await localCtrl.deleteLocal(localId)
    if (!local) {
      res.status(204).json({})
    } else if (local) {
      res.status(200).json(local)
    }
  } catch (error) {
    console.log(error)
    res.status(400).json(error)
  }
})

//Update a Local by Id
router.put('/local/:id', verifyId, multer.single('image'), async (req, res) => {
  try {
    const localId = req.params.id
    const data = req.body
    const file = req.file
    const local = await localCtrl.updateLocal(data, file, localId)
    res.status(200).json({ message: 'Local updated', local })
  } catch (error) {
    res.status(400).json(error)
  }
})

export default router
