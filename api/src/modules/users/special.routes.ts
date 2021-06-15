import { Router } from 'express'
const router = Router()

import passport from 'passport'

router.get(
  '/specialExample',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.send('succcess')
  }
)

export default router
