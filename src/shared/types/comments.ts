import { z } from 'zod'

import { UserBase } from './user/models'

export const COMMENT_CONTENT_MAX = 300

export const commentContentSchema = z
  .string()
  .trim()
  .max(COMMENT_CONTENT_MAX, 'Comment must be at most 300 characters')

export const commentFormSchema = z.object({
  comment: commentContentSchema,
})

export const answerFormSchema = z.object({
  answer: commentContentSchema,
})

export type CommentFormSchema = z.infer<typeof commentFormSchema>
export type AnswerFormSchema = z.infer<typeof answerFormSchema>
export type CommentFormData = CommentFormSchema

export interface BaseComment {
  id: number
  from: UserBase
  content: string
  createdAt: string
  likeCount: number
  isLiked: boolean
}

export interface CommentsViewModel extends BaseComment {
  postId: number
  answerCount: number
}

export interface AnswersViewModel extends BaseComment {
  commentId: number
}

export interface CreateCommentDto {
  content: string
}

export type CommentAuthor = UserBase & {
  username?: string
}

export interface ReplyFormData {
  content: string
}

export const getCommentAuthorName = (from: CommentAuthor): string =>
  from.userName || from.username || 'User'

export const getCommentAvatarUrl = (from: CommentAuthor): string | undefined =>
  from.avatars?.[0]?.url

export const buildReplyMentionPrefix = (userName: string): string => `@${userName} `

export const ensureReplyMention = (content: string, replyToUserName: string): string => {
  const trimmed = content.trim()
  const mention = `@${replyToUserName}`

  if (trimmed.startsWith(mention)) {
    return trimmed
  }

  return `${buildReplyMentionPrefix(replyToUserName)}${trimmed}`.trim()
}

export const parseReplyMention = (content: string): { mention: string | null; text: string } => {
  const match = content.match(/^@(\S+)\s+(.*)$/)

  if (!match) {
    return { mention: null, text: content }
  }

  return { mention: match[1], text: match[2] }
}
