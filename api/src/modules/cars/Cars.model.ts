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
    color: {
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
    valuables: {
      type: String,
    },
    pics: [
      {
        position: {
          type: String,
        },
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
