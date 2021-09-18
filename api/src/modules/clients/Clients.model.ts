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
    ruc: {
      type: String,
    },
    locals: [
      {
        local: {
          ref: 'Locals',
          type: Schema.Types.ObjectId,
        },
        visits: {
          type: String,
        },
        fistVist: {
          type: Date
        },
        lastVisit: {
          type: Date,
        },
        totalSpend: {
          type: Number
        },
        clientType: {
          type: String,
        },
      },
    ],
    cars: [
      {
        ref: 'Cars',
        type: Schema.Types.ObjectId,
      }
    ]
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

export default model('Clients', clientsSchema)
