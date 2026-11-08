import type { ProposalListItem } from './ProposalListItem'

export type ProposalListResponse = {
  items: ProposalListItem[]
  total: number
  offset: number
  limit: number
}
