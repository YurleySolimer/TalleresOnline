import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import config from './config/config'
import path from 'path'
import passport from 'passport'
import passportMiddleware from './middlewares/passport'
import exphbs from 'express-handlebars'

//Import Swagger
import swaggerUI from 'swagger-ui-express'
import swaggerJsDocs from 'swagger-jsdoc'
import { options } from './libs/swaggerOptions'

//Import Routes
import ordersRoutes from './modules/orders/orders.routes'
import carsRoutes from './modules/cars/cars.routes'
import clientsRoutes from './modules/clients/clients.routes'
import localsRoutes from './modules/locals/locals.routes'
import authRoutes from './modules/users/auth.routes'
import swaggerJSDoc from 'swagger-jsdoc'

const app = express()

//Settings
app.set('port', config.PORT)
app.set('views', path.join(__dirname, 'views'))
app.engine(
  '.hbs',
  exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
  })
)
app.set('view engine', '.hbs')

//Middlewares
app.use(morgan('dev'))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(passport.initialize())
passport.use(passportMiddleware)

const specs = swaggerJSDoc(options)

// Public
app.use(express.static(path.join(__dirname, 'public')))

// Routes
app.use(ordersRoutes)
app.use(carsRoutes)
app.use(clientsRoutes)
app.use(localsRoutes)
app.use(authRoutes)

app.use('/docs', swaggerUI.serve, swaggerUI.setup(specs))
app.use(require('./modules/index.js'))

//Uploads folder
app.use('/uploads', express.static(path.resolve('uploads')))

export default app
