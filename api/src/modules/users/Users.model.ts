import { Schema, model, Document } from 'mongoose'
import bcrypt from 'bcrypt'

export interface IUser extends Document {
  email: string
  password: string
  comparePassword: (password: string) => Promise<boolean>
}

const usersSchema = new Schema<IUser>(
  {
    name: {
      type: String,
    },
    lastname: {
      type: String,
    },
    email: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    rol: {
      type: String,
      enum: ['manager', 'worker', 'admin'],
      default: 'manager',
    },
    pic: [
      {
        picName: {
          type: String,
        },
        picPath: {
          type: String,
        },
      },
    ],
    phone: {
      type: String,
    },
    accesos: [
      {
        orders: {
          type: Boolean,
          default: true,
        },
        proforms: {
          type: Boolean,
          default: true,
        },
      },
    ],
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

//Cifrar password
usersSchema.pre<IUser>('save', async function (next) {
  const user = this
  if (!user.isModified('password')) return next()

  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(user.password, salt)
  user.password = hash
  next()
})

//Compare passwords
usersSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password)
}

export default model<IUser>('Users', usersSchema)
