export type {
  AnswersViewModel,
  BaseComment,
  CommentAuthor,
  CommentFormData,
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
