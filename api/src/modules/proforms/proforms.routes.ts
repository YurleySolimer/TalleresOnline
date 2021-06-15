import { Router } from 'express'
const router = Router()

import * as proformCtrl from './proforms.services'

//Create a proform
router.post('/proform', async (req, res) => {
  try {
    const data = req.body
    const proform = await proformCtrl.createProform(data)
    res.status(201).json({ message: 'proform saved', proform })
  } catch (error) {
    res.status(400).json(error)
  }
})

//Get a proform by Id
router.get('/proform/:id', async (req, res) => {
  try {
    const proformId = req.params.id
    const proform = await proformCtrl.getProform(proformId)
    if (!proform) {
      res.status(204).json({})
    } else if (proform) {
      res.status(200).json(proform)
    }
  } catch (error) {
    res.status(400).json(error)
  }
})

//Get all proforms
router.get('/proforms', async (req, res) => {
  try {
    const proform = await proformCtrl.getProforms()
    res.status(200).json(proform)
  } catch (error) {
    res.status(400).json(error)
  }
})

//Delete a proform by Id
router.delete('/proform/:id', async (req, res) => {
  try {
    const proformId = req.params.id
    const proform = await proformCtrl.deleteProform(proformId)
    if (!proform) {
      res.status(204).json({})
    } else if (proform) {
      res.status(200).json(proform)
    }
  } catch (error) {
    console.log(error)
    res.status(400).json(error)
  }
})

//Update a proform by Id
router.put('/proform/:id', async (req, res) => {
  try {
    const proformId = req.params.id
    const data = req.body
    const proform = await proformCtrl.updateProform(data, proformId)
    res.status(200).json({ message: 'proform updated', proform })
  } catch (error) {
    res.status(400).json(error)
  }
})

export default router
