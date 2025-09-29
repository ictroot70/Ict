import { PublicPostResponse } from '../api/api.types'

const testPost1 = {
  id: 8133,
  userName: 'PaperSun ',
  description: 'Contrary to popular belief.',
  location: null,
  images: [
    {
      url: '/mock/image_2.jpg',
      width: 1440,
      height: 1440,
      fileSize: 3533185,
      createdAt: '2025-08-29T14:53:16.354Z',
      uploadId: '68b1bedb85f9ba7cb0a19b75',
    },
    {
      url: '/mock/image_1.jpg',
      width: 1440,
      height: 1440,
      fileSize: 3533185,
      createdAt: '2025-08-29T14:53:16.354Z',
      uploadId: '68b1bedb85f9ba7cb0a19b75',
    },
    {
      url: '/mock/image_4.jpg',
      width: 1440,
      height: 1440,
      fileSize: 3533185,
      createdAt: '2025-08-29T14:53:16.354Z',
      uploadId: '68b1bedb85f9ba7cb0a19b75',
    },
  ],
  createdAt: '2025-08-29T14:53:17.258Z',
  updatedAt: '2025-08-29T14:53:55.740Z',
  ownerId: 3080,
  owner: {
    firstName: null,
    lastName: null,
  },
  likesCount: 0,
  isLiked: false,
  avatarWhoLikes: [],
}
const testPost2 = {
  id: 8133,
  userName: 'AshenGhost',
  description:
    'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor.',
  location: null,
  images: [
    {
      url: '/mock/image_1.jpg',
      width: 1440,
      height: 1440,
      fileSize: 3533185,
      createdAt: '2025-08-29T14:53:16.354Z',
      uploadId: '68b1bedb85f9ba7cb0a19b75',
    },
    {
      url: '/mock/image_2.jpg',
      width: 1440,
      height: 1440,
      fileSize: 3533185,
      createdAt: '2025-08-29T14:53:16.354Z',
      uploadId: '68b1bedb85f9ba7cb0a19b75',
    },
  ],
  createdAt: '2025-08-29T14:53:17.258Z',
  updatedAt: '2025-08-29T14:53:55.740Z',
  ownerId: 3080,
  owner: {
    firstName: null,
    lastName: null,
  },
  likesCount: 0,
  isLiked: false,
  avatarWhoLikes: [],
}
const testPost3 = {
  id: 8133,
  userName: 'LunarWhispe',
  description:
    'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor.Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor.',
  location: null,
  images: [
    {
      url: '/mock/image_3.jpg',
      width: 1440,
      height: 1440,
      fileSize: 3533185,
      createdAt: '2025-08-29T14:53:16.354Z',
      uploadId: '68b1bedb85f9ba7cb0a19b75',
    },
    {
      url: '/mock/image_2.jpg',
      width: 1440,
      height: 1440,
      fileSize: 3533185,
      createdAt: '2025-08-29T14:53:16.354Z',
      uploadId: '68b1bedb85f9ba7cb0a19b75',
    },
    {
      url: '/mock/image_4.jpg',
      width: 1440,
      height: 1440,
      fileSize: 3533185,
      createdAt: '2025-08-29T14:53:16.354Z',
      uploadId: '68b1bedb85f9ba7cb0a19b75',
    },
    {
      url: '/mock/image_1.jpg',
      width: 1440,
      height: 1440,
      fileSize: 3533185,
      createdAt: '2025-08-29T14:53:16.354Z',
      uploadId: '68b1bedb85f9ba7cb0a19b75',
    },
  ],
  createdAt: '2025-08-29T14:53:17.258Z',
  updatedAt: '2025-08-29T14:53:55.740Z',
  ownerId: 3080,
  owner: {
    firstName: null,
    lastName: null,
  },
  likesCount: 0,
  isLiked: false,
  avatarWhoLikes: [],
}
const testPost4 = {
  id: 8133,
  userName: 'NullByte',
  description:
    'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000.',
  location: null,
  images: [
    {
      url: '/mock/image_4.jpg',
      width: 1440,
      height: 1440,
      fileSize: 3533185,
      createdAt: '2025-08-29T14:53:16.354Z',
      uploadId: '68b1bedb85f9ba7cb0a19b75',
    },
  ],
  createdAt: '2025-08-29T14:53:17.258Z',
  updatedAt: '2025-08-29T14:53:55.740Z',
  ownerId: 3080,
  owner: {
    firstName: null,
    lastName: null,
  },
  likesCount: 0,
  isLiked: false,
  avatarWhoLikes: [],
}

export const mockDataPosts: PublicPostResponse[] = [testPost1, testPost2, testPost3, testPost4]
