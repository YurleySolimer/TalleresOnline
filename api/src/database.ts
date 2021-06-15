import mongoose, { ConnectionOptions } from 'mongoose'
import config from './config/config'
;(async () => {
  try {
    const mongooseOptions: ConnectionOptions = {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: true,
    }
    const db = await mongoose.connect(
      `mongodb://${config.MONGO_HOST}/${config.MONGO_DATABASE}`,
      mongooseOptions
    )
    console.log('DB is connected to:', db.connection.name)
  } catch (error) {
    console.error(error)
  }
})()
