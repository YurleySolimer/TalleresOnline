import { Router } from 'express'
const router = Router()

import * as invoiceCtrl from './invoices.services'

//Create a invoice
router.post('/invoice', async (req, res) => {
  try {
    const data = req.body
    const invoice = await invoiceCtrl.createInvoice(data)
    res.status(201).json({ message: 'invoice saved', invoice })
  } catch (error) {
    res.status(400).json(error)
  }
})

//Get a invoice by Id
router.get('/invoice/:id', async (req, res) => {
  try {
    const invoiceId = req.params.id
    const invoice = await invoiceCtrl.getInvoice(invoiceId)
    if (!invoice) {
      res.status(204).json({})
    } else if (invoice) {
      res.status(200).json(invoice)
    }
  } catch (error) {
    res.status(400).json(error)
  }
})

//Get all invoices
router.get('/invoices', async (req, res) => {
  try {
    const invoice = await invoiceCtrl.getInvoices()
    res.status(200).json(invoice)
  } catch (error) {
    res.status(400).json(error)
  }
})

//Delete a invoice by Id
router.delete('/invoice/:id', async (req, res) => {
  try {
    const invoiceId = req.params.id
    const invoice = await invoiceCtrl.deleteInvoice(invoiceId)
    if (!invoice) {
      res.status(204).json({})
    } else if (invoice) {
      res.status(200).json(invoice)
    }
  } catch (error) {
    console.log(error)
    res.status(400).json(error)
  }
})

//Update a invoice by Id
router.put('/invoice/:id', async (req, res) => {
  try {
    const invoiceId = req.params.id
    const data = req.body
    const invoice = await invoiceCtrl.updateInvoice(data, invoiceId)
    res.status(200).json({ message: 'invoice updated', invoice })
  } catch (error) {
    res.status(400).json(error)
  }
})

export default router
