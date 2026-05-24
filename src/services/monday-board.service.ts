import { mondayGraphQL, getDevApiToken } from '../lib/monday/graphql.js'
import { mondayAuthService } from './monday-auth.service.js'
import { AppError } from '../lib/errors.js'

const BOARD_SUMMARY_QUERY = `
  query BoardSummary($boardIds: [ID!]) {
    boards(ids: $boardIds) {
      id
      name
      description
      state
      items_count
      groups {
        id
        title
      }
      items_page(limit: 8) {
        items {
          id
          name
          group {
            id
            title
          }
          column_values {
            id
            type
            text
          }
        }
      }
    }
  }
`

export type BoardListItem = {
  id: string
  name: string
  state: string
  workspaceId: string | null
  workspaceName: string | null
}

export type BoardItemSummary = {
  id: string
  name: string
  groupTitle: string | null
  status: string | null
}

export type BoardSummary = {
  id: string
  name: string
  description: string | null
  itemCount: number
  groups: Array<{ id: string; title: string }>
  sampleItems: BoardItemSummary[]
}

type BoardGraphQL = {
  boards: Array<{
    id: string
    name: string
    description: string | null
    state: string
    items_count: number
    groups: Array<{ id: string; title: string }>
    items_page: {
      items: Array<{
        id: string
        name: string
        group: { id: string; title: string } | null
        column_values: Array<{ id: string; type: string; text: string | null }>
      }>
    } | null
  }>
}

async function resolveAccessToken(accountId: number): Promise<string> {
  const stored = await mondayAuthService.getAccessTokenForAccount(accountId)
  if (stored) return stored

  const devToken = getDevApiToken()
  if (devToken) return devToken

  throw new AppError(
    'monday OAuth not installed for this account. Install the app from Developer Center.',
    403,
    'MONDAY_OAUTH_REQUIRED',
  )
}

function mapItem(
  item: NonNullable<BoardGraphQL['boards'][0]['items_page']>['items'][number],
): BoardItemSummary {
  const statusCol = item.column_values.find(
    (c) => c.type === 'color' || c.type === 'status',
  )
  return {
    id: item.id,
    name: item.name,
    groupTitle: item.group?.title ?? null,
    status: statusCol?.text ?? null,
  }
}

const LIST_BOARDS_QUERY = `
  query ListBoards($workspaceIds: [ID], $limit: Int) {
    boards(workspace_ids: $workspaceIds, limit: $limit) {
      id
      name
      state
      workspace {
        id
        name
      }
    }
  }
`

type ListBoardsGraphQL = {
  boards: Array<{
    id: string
    name: string
    state: string
    workspace: { id: string; name: string } | null
  }>
}

export const mondayBoardService = {
  async listBoards(
    accountId: number,
    options?: { workspaceId?: string; limit?: number },
  ): Promise<BoardListItem[]> {
    const accessToken = await resolveAccessToken(accountId)
    const limit = options?.limit ?? 100
    const workspaceIds = options?.workspaceId ? [options.workspaceId] : undefined

    const data = await mondayGraphQL<ListBoardsGraphQL>(
      LIST_BOARDS_QUERY,
      { workspaceIds, limit },
      accessToken,
    )

    return data.boards
      .filter((board) => board.state === 'active')
      .map((board) => ({
        id: board.id,
        name: board.name,
        state: board.state,
        workspaceId: board.workspace?.id ?? null,
        workspaceName: board.workspace?.name ?? null,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  },

  async getBoardSummary(accountId: number, boardId: string): Promise<BoardSummary> {
    const accessToken = await resolveAccessToken(accountId)
    const data = await mondayGraphQL<BoardGraphQL>(
      BOARD_SUMMARY_QUERY,
      { boardIds: [boardId] },
      accessToken,
    )

    const board = data.boards[0]
    if (!board) {
      throw new AppError(`Board ${boardId} not found`, 404, 'BOARD_NOT_FOUND')
    }

    const items = board.items_page?.items ?? []

    return {
      id: board.id,
      name: board.name,
      description: board.description,
      itemCount: board.items_count,
      groups: board.groups.map((g) => ({ id: g.id, title: g.title })),
      sampleItems: items.map(mapItem),
    }
  },
}
