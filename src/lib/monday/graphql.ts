import axios from 'axios'
import { env, mondayConfig } from '../../config/env.js'
import { AppError } from '../errors.js'

type GraphQLResponse<T> = {
  data?: T
  errors?: Array<{ message: string }>
}

export async function mondayGraphQL<T>(
  query: string,
  variables: Record<string, unknown> | undefined,
  accessToken: string,
): Promise<T> {
  const { data } = await axios.post<GraphQLResponse<T>>(
    mondayConfig.apiUrl,
    { query, variables },
    {
      headers: {
        Authorization: accessToken,
        'Content-Type': 'application/json',
        'API-Version': '2024-10',
      },
    },
  )

  if (data.errors?.length) {
    throw new AppError(data.errors.map((e) => e.message).join('; '), 502, 'MONDAY_API_ERROR')
  }

  if (!data.data) {
    throw new AppError('Empty response from monday API', 502, 'MONDAY_API_ERROR')
  }

  return data.data
}

/** Dev-only: use MONDAY_API_TOKEN when OAuth store is empty. */
export function getDevApiToken(): string | undefined {
  if (env.NODE_ENV === 'production') return undefined
  return env.MONDAY_API_TOKEN
}
