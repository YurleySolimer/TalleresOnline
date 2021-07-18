import { Document, Types } from 'mongoose'

import Invoice from './Invoices.model'

export async function createInvoice(data: any): Promise<Document | null> {
    //Inserto en la BD
    const invoice = new Invoice(data)
    const savedInvoice = await invoice.save()
    return savedInvoice
}

export async function getInvoice(invoiceId: string): Promise<Document | null> {
  try {
    const invoice = await Invoice.findById(invoiceId)
    if (invoice) {
      return null
    }
    return invoice
  } catch (error) {
    return Promise.reject(error)
  }
}

export async function getInvoices(): Promise<Document> {
  try {
    const invoices = await Invoice.find()
    return invoices
  } catch (error) {
    return Promise.reject(error)
  }
}

export async function deleteInvoice(invoiceId: string): Promise<Document | null> {
  try {
    const invoice = await Invoice.findByIdAndDelete(invoiceId)
    if (!invoice) {
      return null
    }
    return invoice
  } catch (error) {
    return Promise.reject(error)
  }
}

export async function updateInvoice(
  data: any,
  invoiceId: string
): Promise<Document | null> {
  const invoiceUpdated = await Invoice.findByIdAndUpdate(invoiceId, data)
  if (!invoiceUpdated) {
    return null
  }
  return invoiceUpdated
}
