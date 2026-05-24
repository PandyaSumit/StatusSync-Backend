import { Router, type Request } from 'express'
import { accountService } from '../services/account.service.js'
import { mondayBoardService } from '../services/monday-board.service.js'
import {
  mondaySessionMiddleware,
  type MondayAuthenticatedRequest,
} from '../middleware/monday-session.middleware.js'
import { AppError } from '../lib/errors.js'
import { env, mondayConfig } from '../config/env.js'

export const boardsRoutes = Router()

function getMonday(req: Request): MondayAuthenticatedRequest['monday'] {
  return (req as MondayAuthenticatedRequest).monday
}

boardsRoutes.use(mondaySessionMiddleware)

boardsRoutes.get('/me', async (req, res, next) => {
  try {
    const monday = getMonday(req)
    const hasOAuthToken = await accountService.hasOAuthToken(monday.accountId)
    res.json({
      accountId: monday.accountId,
      userId: monday.userId,
      hasOAuthToken,
      oauthInstallUrl: `${env.APP_URL}/api/auth/monday`,
      oauthRedirectUri: mondayConfig.redirectUri,
    })
  } catch (error) {
    next(error)
  }
})

boardsRoutes.get('/boards', async (req, res, next) => {
  try {
    const monday = getMonday(req)
    const workspaceId =
      typeof req.query.workspaceId === 'string' ? req.query.workspaceId : undefined

    const boards = await mondayBoardService.listBoards(monday.accountId, {
      workspaceId,
    })
    res.json(boards)
  } catch (error) {
    next(error)
  }
})

boardsRoutes.get('/boards/:boardId/summary', async (req, res, next) => {
  try {
    const monday = getMonday(req)
    const boardId = req.params.boardId
    if (!boardId) throw new AppError('boardId is required', 400, 'VALIDATION_ERROR')

    const summary = await mondayBoardService.getBoardSummary(monday.accountId, boardId)
    res.json(summary)
  } catch (error) {
    next(error)
  }
})
