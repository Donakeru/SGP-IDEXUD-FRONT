import type { CommentCategory } from '../comment/Comment'
import type { ProposalDocument } from './ProposalDocument'
import type { HistoryEvent, ReviewProposal } from './ReviewProposal'

export type ProposalCommentPage = {
  items: ProposalDetailComment[]
  total: number
  next_cursor: string | null
}

export type ProposalDetailComment = {
  id: number
  content: string
  author: string
  createdAt: string
  category: CommentCategory
  /** `uuid_archivo` del documento relacionado, si el comentario se hizo sobre uno. */
  documentUuid: string | null
  documentName: string | null
}

export type ProposalDetailResponse = Omit<ReviewProposal, 'history' | 'documents'> & {
  history: HistoryEvent[]
  documents: ProposalDocument[]
  comments: ProposalCommentPage
}
