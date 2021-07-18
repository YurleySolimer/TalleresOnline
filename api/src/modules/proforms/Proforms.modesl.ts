import { Schema, model } from 'mongoose'

const proformsSchema = new Schema(
  {
    proformNum: {
      type: Number,
    },
    carType: {
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
    kilometraje: {
      type: Number,
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
    clientAdress: {
      type: String,
    },
    services: [
      {
        service: {
          type: String,
        },
        description: {
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
