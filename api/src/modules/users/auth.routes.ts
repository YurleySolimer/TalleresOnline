import { Router } from 'express'
const router = Router()

import * as usersCtrl from './user.controllers'

router.post('/signup', usersCtrl.signUp)
router.post('/signin', usersCtrl.signIn)

export default router
