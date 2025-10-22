'use client'

import { ReactElement } from 'react'

import { useGetMyProfileQuery } from '@/entities/profile'

export const ProfileClient = (): ReactElement => {
  const { data, isSuccess } = useGetMyProfileQuery()

  return (
    <>
      {isSuccess && (
        <div className={'profile'}>
          <h1>My Profile</h1>
          <p>My id is: {data?.id}</p>
          <p>My userName is: {data?.userName}</p>
          <p>My firstName is: {data?.firstName}</p>
          <p>My lastName is: {data?.lastName}</p>
          <p>My country is: {data?.country}</p>
          <p>My city is: {data?.city}</p>
          <p>My region is: {data?.region}</p>
        </div>
      )}
    </>
  )
}
