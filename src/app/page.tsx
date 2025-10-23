// import { GetPublicPostsResponse } from '@/entities/users/api/api.types'
// import { Public } from '@/entities/users/ui'

// export default async function HomePage() {
//   const publicPostsResponse = await fetch(
//     `https://ictroot.uk/api/v1/public-posts/all?pageSize=${4}`
//   )
//   const publicPostsData = (await publicPostsResponse.json()) as GetPublicPostsResponse
//   console.log(`Server:`, publicPostsData)

//   return <Public postsData={publicPostsData} />
// }


'use client'

import { GetPublicPostsResponse } from '@/entities/users/api/api.types'
import { Public } from '@/entities/users/ui'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const [postsData, setPostsData] = useState<GetPublicPostsResponse | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://ictroot.uk/api/v1/public-posts/all?pageSize=4')
        const data = await response.json()
        setPostsData(data)
      } catch (error) {
        console.error('Fetch error:', error)
      }
    }

    fetchData()
  }, [])

  if (!postsData) return <div>Loading...</div>

  return <Public postsData={postsData} />
}