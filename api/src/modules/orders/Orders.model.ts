import { Schema, model } from 'mongoose'

const ordersSchema = new Schema(
  {
    orderNum: {
      type: Number,
    },
    subTotal: {
      type: Number,
    },
    category: {
      type: String,
    },
    iva: {
      type: Number,
    },
    local: {
      ref: 'Locals',
      type: Schema.Types.ObjectId,
    },
    facturada: {
      type: Boolean,
      default: false,
    },
    user: {
      ref: 'Users',
      type: Schema.Types.ObjectId,
    },
    client: {
      ref: 'Clients',
      type: Schema.Types.ObjectId,
    },
    car: {
      ref: 'Cars',
      type: Schema.Types.ObjectId,
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
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

export default model('Orders', ordersSchema)
