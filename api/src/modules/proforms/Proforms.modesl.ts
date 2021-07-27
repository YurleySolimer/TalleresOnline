import { Schema, model } from 'mongoose'

const proformsSchema = new Schema(
  {
    proformNum: {
      type: Number,
    },
    placa: {
      type: String,
    },
    marca: {
      type: String,
    },
    model: {
      type: String,
    },
    año: {
      default: Number,
    },
    color: {
      type: String,
    },
    clientName: {
      type: String,
    },
    clientLastame: {
      type: String,
    },
    clientPhone: {
      type: String,
    },
    clientRuc: {
      type: String,
    },
    clientEmail: {
      type: String,
    },
    services: [
      {
        service: {
          type: String,
        },
        count: {
          type: String,
        },
        price: {
          type: Number,
        },
      },
    ],
    total: {
      type: Number,
    },
    subtotal: {
      type: Number,
    },
    iva: {
      type: Number,
    },
    discount: {
      type: Number
    },
    deliveryDate: {
      type: Date
    },
    local: {
      type: String,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

export default model('Proforms', proformsSchema)
