import fs from 'node:fs'
import path from 'node:path'

import { APP_ROUTES } from '@/shared/constant'
import { describe, expect, it } from 'vitest'

const readSource = (relativePath: string) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')

describe('POSTS-UC1-UPLOAD-CONSTRAINTS', () => {
  it('keeps upload type/size constraints for create-post dropzone', () => {
    const source = readSource('src/features/posts/hooks/useImageDropzone.ts')

    expect(source).toContain('const MAX_SIZE = 20 * 1024 * 1024')
    expect(source).toContain('const MAX_FILES = 10')
    expect(source).toContain("'image/jpeg'")
    expect(source).toContain("'image/png'")
    expect(source).toContain('The photo must be JPEG or PNG format')
    expect(source).toContain('The photo must be less than 20 Mb')
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
  it('keeps publish description max length = 500', () => {
    const source = readSource('src/features/posts/ui/steps/PublishStep.tsx')

    expect(source).toContain('description.length <= 500')
    expect(source).toContain('maxLength={500}')
    expect(source).toContain('{description.length}/500')
  })

  it('keeps modal edit mode description max length = 500', () => {
    const source = readSource('src/entities/posts/ui/PostModal/EditMode/EditMode.tsx')

    expect(source).toContain('const maxCharacters = 500')
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
})
