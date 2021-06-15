import { Schema, model } from 'mongoose'

const invoicesSchema = new Schema(
  {
    invoiceNum: {
      type: Number,
    },
    type: {
      type: String,
    },
    status: {
      type: String,
    },
    rucCliente: {
      type: String,
    },
    ot: {
      type: String,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

export default model('Invoices', invoicesSchema)
