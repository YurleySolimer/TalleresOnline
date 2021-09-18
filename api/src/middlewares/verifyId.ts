import mongoose from 'mongoose'
import { Request, Response, NextFunction } from 'express'
const objectId = mongoose.Types.ObjectId

export const verifyId = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    if(!objectId.isValid(id)) return res.status(400).json({message: 'Invalid ID'})
    next()
}