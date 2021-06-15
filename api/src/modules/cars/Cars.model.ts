import { Schema, model } from 'mongoose'

const carsSchema = new Schema(
  {
    placa: {
      type: String,
    },
    modelo: {
      type: String,
    },
    marca: {
      type: String,
    },
    cartype: {
      type: String,
    },
    año: {
      type: Number,
    },
    nivel_gasolina: {
      type: Number,
    },
    observacion: {
      type: String,
    },
    description: {
      type: String,
    },
    kilometraje: {
      type: String,
    },
    pics: [
      {
        position: {
          type: String,
        },
        description: String,
        picName: String,
        picPath: String,
      },
    ],
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

export default model('Cars', carsSchema)
