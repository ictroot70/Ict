export type {
  AnswersViewModel,
  BaseComment,
  CommentAuthor,
  CommentFormSchema,
  AnswerFormSchema,
  CommentsViewModel,
  CreateCommentDto,
} from '@/shared/types/comments'

export {
  COMMENT_CONTENT_MAX,
  answerFormSchema,
  buildReplyMentionPrefix,
  commentContentSchema,
  commentFormSchema,
  ensureReplyMention,
  getCommentAuthorName,
  getCommentAvatarUrl,
  parseReplyMention,
} from '@/shared/types/comments'
export type CommentThreadItem = {
  id: number | string
  content: string
  createdAt: string
  userName: string
  avatar?: string
  isOptimistic?: boolean
}
