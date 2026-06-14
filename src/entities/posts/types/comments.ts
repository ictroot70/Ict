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
  COMMENT_CONTENT_MIN,
  answerFormSchema,
  buildReplyMentionPrefix,
  commentContentSchema,
  commentFormSchema,
  ensureReplyMention,
  getCommentAuthorName,
  getCommentAvatarUrl,
  parseReplyMention,
} from '@/shared/types/comments'
