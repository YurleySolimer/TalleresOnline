import { Schema, model } from 'mongoose'

const workersSchema = new Schema(
  {
    name: {
      type: String,
    },
    lastname: {
      type: String,
    },
    position: {
      type: String,
    },
    local: {
      type: String,
    },
    userCreator: {
      type: String,
    },
    user: {
      type: String,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

export default model('Workers', workersSchema)
