import { Schema, model } from 'mongoose'

const localsSchema = new Schema(
  {
    name: {
      type: String,
    },
    address: {
      type: String,
    },
    district: {
      type: String,
    },
    phone: {
      type: String,
    },
    ruc: {
      type: String,
    },
    user: {
      ref: 'Users',
      type: Schema.Types.ObjectId,
    },
    pic: {
      picName: {
        type: String,
      },
      picPath: {
        type: String,
      },
    },
    email: {
      type: String,
    },
    suscription: {
      sucriptionType: {
        type: String,
      },
      payDate: {
        type: Date,
      },
      nextPay: {
        type: Date,
      },
      amount: {
        type: Number,
      },
      daysLeft: {
        type: Number,
      },
      suscribe: {
        type: Boolean,
        default: false,
      },
      plan: {
        name: {
          type: String,
        },
        access: {
          type: Number,
          default: 5,
        },
        estadisticas: {
          type: Boolean,
          default: true,
        },
        orders: {
          type: Boolean,
          default: true,
        },
        proforms: {
          type: Boolean,
          default: true,
        },
        invoices: {
          type: Boolean,
          default: true,
        },
      },
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

export default model('Locals', localsSchema)
