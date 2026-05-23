export type DigestScheduleFrequency =
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'once'

export type Digest = {
  id: string
  accountId: number
  name: string
  boardIds: string[]
  isActive: boolean
  frequency: DigestScheduleFrequency
  recipientCount: number
  nextSendAt: string | null
  createdAt: string
  updatedAt: string
}

export type CreateDigestInput = {
  name: string
  boardIds: string[]
  frequency: DigestScheduleFrequency
  isActive?: boolean
}

export type UpdateDigestInput = Partial<CreateDigestInput> & {
  isActive?: boolean
}
