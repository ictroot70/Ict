import fs from 'node:fs'
import path from 'node:path'

import { APP_ROUTES } from '@/shared/constant'
import { describe, expect, it } from 'vitest'

const readSource = (relativePath: string) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')

describe('POSTS-UC1-UPLOAD-CONSTRAINTS', () => {
  it('keeps upload type/size constraints for create-post dropzone', () => {
    const source = readSource('src/features/posts/hooks/useImageDropzone.ts')
    const backgroundUploadSource = readSource('src/features/posts/hooks/useBackgroundUpload.ts')

    expect(source).toContain('const MAX_SIZE = 20 * 1024 * 1024')
    expect(source).toContain('const MAX_FILES = 10')
    expect(source).toContain("'image/jpeg'")
    expect(source).toContain("'image/png'")
    expect(source).toContain('The photo must be JPEG or PNG format')
    expect(source).toContain('The photo must be less than 20 Mb')

    expect(backgroundUploadSource).toContain('const MAX_FILES_PER_UPLOAD = 10')
    expect(backgroundUploadSource).toContain('const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024')
    expect(backgroundUploadSource).toContain("new Set(['image/jpeg', 'image/png'])")
    expect(backgroundUploadSource).not.toContain("'image/webp'")
  })

  it('keeps crop step limits and aspect ratios', () => {
    const source = readSource('src/features/posts/ui/steps/CropStep/CropStep.tsx')

    expect(source).toContain("label: '1:1'")
    expect(source).toContain("label: '4:5'")
    expect(source).toContain("label: '16:9'")
    expect(source).toContain('const shouldShowAddButton = files.length < 10')
  })
})

describe('POSTS-UC1-PUBLISH-DESCRIPTION-LIMIT', () => {
  it('keeps publish description optional with max length = 500', () => {
    const source = readSource('src/features/posts/ui/steps/PublishStep.tsx')
    const createBodySource = readSource('src/features/posts/model/create-post-flow.helpers.ts')
    const postApiSource = readSource('src/entities/posts/api/postApi.ts')

    expect(source).toContain('const isDescriptionValid = description.length <= 500')
    expect(source).not.toContain('description.length > 0 && description.length <= 500')
    expect(source).toContain('description.length <= 500')
    expect(source).toContain('maxLength={500}')
    expect(source).toContain('{description.length}/500')

    expect(createBodySource).toContain('description: normalizedDescription')
    expect(createBodySource).not.toContain('description: normalizedDescription || undefined')
    expect(postApiSource).toContain("typeof body.description === 'string' ? body.description : ''")
    expect(postApiSource).not.toContain('description: body.description || undefined')
  })

  it('keeps modal edit mode description optional with max length = 500', () => {
    const editModeSource = readSource('src/entities/posts/ui/PostModal/EditMode/EditMode.tsx')
    const postModalSource = readSource('src/entities/posts/ui/PostModal/PostModal.tsx')

    expect(editModeSource).toContain('const maxCharacters = 500')
    expect(editModeSource).toContain('const shouldDisableSave = characterCount > maxCharacters')

    expect(postModalSource).toContain('if (onEditPost && postData.postId)')
    expect(postModalSource).not.toContain('if (trimmed && onEditPost && postData.postId)')
  })
})

describe('POSTS-UC2-UC3-EDIT-DELETE-CONFIRMATIONS', () => {
  it('keeps close creation confirm dialog text/buttons', () => {
    const source = readSource('src/features/posts/ui/CreatePostForm.tsx')

    expect(source).toContain('Do you really want to close the creation of a publication?')
    expect(source).toContain('If you close everything')
    expect(source).toContain('Discard')
    expect(source).toContain('Save draft')
  })

  it('keeps delete flow closing active post modal through parent callback', () => {
    const deleteLogicSource = readSource('src/entities/posts/hooks/useDeletePostLogic.ts')
    const profilePostsSource = readSource(
      'src/entities/profile/ui/Profile/ProfilePosts/ProfilePosts.tsx'
    )

    expect(deleteLogicSource).toContain('onDeleted?: (postId: number) => void')
    expect(deleteLogicSource).toContain('options?.onDeleted?.(postIdNumber)')
    expect(deleteLogicSource).not.toContain('router.replace(')

    expect(profilePostsSource).toContain('onDeleted: () => {')
    expect(profilePostsSource).toContain('handleClosePost()')
    expect(profilePostsSource).toContain('open={isPostModalOpen && !isDeleteModalOpen}')
  })

  it('keeps own-post actions menu with edit/delete entries', () => {
    const actionsSource = readSource('src/entities/posts/ui/PostModal/PostActions/PostActions.tsx')

    expect(actionsSource).toContain("label: 'Edit Post'")
    expect(actionsSource).toContain("label: 'Delete Post'")
    expect(actionsSource).toContain("variant === 'myPost'")
  })

  it('keeps delete confirmation modal title, text and Yes/No actions', () => {
    const deleteModalSource = readSource(
      'src/entities/posts/ui/PostModal/DeletePostModal/DeletePostModal.tsx'
    )

    expect(deleteModalSource).toContain("modalTitle={'Delete Post'}")
    expect(deleteModalSource).toContain('Are you sure you want to delete this post?')
    expect(deleteModalSource).toContain("{isLoading ? 'Deleting...' : 'Yes'}")
    expect(deleteModalSource).toContain('No')
  })

  it('keeps edit flow sending description update via postId mutation', () => {
    const editLogicSource = readSource('src/entities/posts/hooks/useEditPostLogic.ts')
    const postModalSource = readSource('src/entities/posts/ui/PostModal/PostModal.tsx')

    expect(editLogicSource).toContain('await updatePost({')
    expect(editLogicSource).toContain('postId: parseInt(postId)')
    expect(editLogicSource).toContain('description: newDescription')
    expect(postModalSource).toContain('const trimmed = newDescription.trim()')
    expect(postModalSource).toContain('const updated = await onEditPost(postData.postId, trimmed)')
  })
})

describe('MAIN-UC1-PUBLIC-FEED-FOUR-POSTS', () => {
  it('keeps home page initial server fetch size at 4 posts', () => {
    const source = readSource('src/app/page.tsx')

    expect(source).toContain('const PUBLIC_POSTS_PAGE_SIZE = 4')
    expect(source).toContain('const INITIAL_PUBLIC_POST_CURSOR = 0')
  })

  it('keeps client polling each minute for public posts', () => {
    const source = readSource('src/entities/users/ui/public/Public.tsx')

    expect(source).toContain('pollingInterval: 60000')
    expect(source).toContain('pageSize: 4')
  })
})

describe('SSR-UC1/UC2 PROFILE', () => {
  it('keeps profile page server data contract', () => {
    const source = readSource('src/app/profile/[id]/page.tsx')

    expect(source).toContain('const pageSize = 8')
    expect(source).toContain('fetchProfileData(userId)')
    expect(source).toContain('fetchUserPosts(userId, pageSize)')
    expect(source).toContain('fetchPostByIdForSSR(postId)')
  })

  it('keeps route helper for opening a specific post on profile page', () => {
    const route = APP_ROUTES.PROFILE.WITH_POST(123, 456, 'direct')

    expect(route).toContain('/profile/123?')
    expect(route).toContain('postId=456')
    expect(route).toContain('from=direct')
  })

  it('keeps profile post card carousel for posts with multiple images', () => {
    const source = readSource('src/entities/posts/ui/PostCard/PostCard.tsx')

    expect(source).toContain('post.images.length > 1')
    expect(source).toContain('<Carousel slides={post.images} imageSizes={IMAGE_SIZES.POST_CARD} />')
    expect(source).toContain("if (target.closest('button'))")
  })

  it('keeps close-post routing behavior for home/profile/direct sources', () => {
    const source = readSource('src/entities/profile/ui/Profile/ProfilePosts/ProfilePosts.tsx')

    expect(source).toContain("if (modalSource === 'home')")
    expect(source).toContain('router.replace(APP_ROUTES.ROOT, { scroll: false })')
    expect(source).toContain("params.delete('postId')")
    expect(source).toContain("params.delete('from')")
    expect(source).toContain('const profileUrl = APP_ROUTES.PROFILE.ID(userId)')
  })
})
