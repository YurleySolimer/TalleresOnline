import { Schema, model } from 'mongoose'

const clientsSchema = new Schema(
  {
    name: {
      type: String,
    },
    lastname: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    address: {
      district: {
        type: String,
      },
      department: {
        type: String,
      },
      providence: {
        type: String,
      },
    },
    birthday: {
      type: Date,
    },
    gener: {
      type: String,
    },
    howKnow: {
      type: String,
    },
    ruc: {
      type: String,
    },
    locals: [
      {
        local: {
          type: String,
        },
        visits: {
          type: String,
        },
        lastVisit: {
          type: Date,
        },
        clientType: {
          type: String,
        },
      },
    ],
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

export default model('Clients', clientsSchema)
