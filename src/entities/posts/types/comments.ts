export type {
  AnswersViewModel,
  BaseComment,
  CommentAuthor,
  CommentFormData,
  CommentFormSchema,
  CommentsViewModel,
  CreateCommentDto,
} from '@/shared/types/comments'

export {
  COMMENT_CONTENT_MAX,
  buildReplyMentionPrefix,
  commentContentSchema,
  commentFormSchema,
  ensureReplyMention,
  getCommentAuthorName,
  getCommentAvatarUrl,
  parseReplyMention,
} from '@/shared/types/comments'
