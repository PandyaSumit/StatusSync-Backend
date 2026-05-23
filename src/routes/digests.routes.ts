import { Router, type Request } from 'express'
import { z } from 'zod'
import { digestRepository } from '../repositories/digest.repository.js'
import {
  mondaySessionMiddleware,
  type MondayAuthenticatedRequest,
} from '../middleware/monday-session.middleware.js'
import { AppError } from '../lib/errors.js'

const createDigestSchema = z.object({
  name: z.string().min(1).max(200),
  boardIds: z.array(z.string().min(1)).min(1),
  frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'once']),
  isActive: z.boolean().optional(),
})

const updateDigestSchema = createDigestSchema.partial()

export const digestsRoutes = Router()

function getMonday(req: Request): MondayAuthenticatedRequest['monday'] {
  return (req as MondayAuthenticatedRequest).monday
}

digestsRoutes.use(mondaySessionMiddleware)

digestsRoutes.get('/digests', async (req, res, next) => {
  try {
    const monday = getMonday(req)
    const digests = await digestRepository.listByAccount(monday.accountId)
    res.json(digests)
  } catch (error) {
    next(error)
  }
})

digestsRoutes.get('/digests/:id', async (req, res, next) => {
  try {
    const monday = getMonday(req)
    const digest = await digestRepository.getById(monday.accountId, req.params.id!)
    res.json(digest)
  } catch (error) {
    next(error)
  }
})

digestsRoutes.post('/digests', async (req, res, next) => {
  try {
    const monday = getMonday(req)
    const parsed = createDigestSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.message, 400, 'VALIDATION_ERROR')
    }
    const digest = await digestRepository.create(monday.accountId, parsed.data)
    res.status(201).json(digest)
  } catch (error) {
    next(error)
  }
})

digestsRoutes.patch('/digests/:id', async (req, res, next) => {
  try {
    const monday = getMonday(req)
    const parsed = updateDigestSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.message, 400, 'VALIDATION_ERROR')
    }
    const digest = await digestRepository.update(
      monday.accountId,
      req.params.id!,
      parsed.data,
    )
    res.json(digest)
  } catch (error) {
    next(error)
  }
})

digestsRoutes.delete('/digests/:id', async (req, res, next) => {
  try {
    const monday = getMonday(req)
    await digestRepository.delete(monday.accountId, req.params.id!)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})
