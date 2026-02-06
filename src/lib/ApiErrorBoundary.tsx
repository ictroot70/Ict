import React, { ReactNode } from 'react'
import { ApiError } from './api'
import Image from 'next/image'

type ApiErrorBoundaryProps = {
  error: ApiError | null | undefined
  children: ReactNode
}

export function ApiErrorBoundary({ error, children }: ApiErrorBoundaryProps) {
  if (!error) return <>{children}</>

  const Wrapper = ({ children }: { children: ReactNode }) => {
    return (
      <div
        className="error-page"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          flexWrap: 'wrap',
          gap: '10px',
          flexDirection: 'column',
        }}
      >
        {children}
      </div>
    )
  }

  switch (error.type) {
    case 'FETCH_ERROR':
      return (
        <Wrapper>
          <Image src={'/nointernet.png'} alt={'No Internet'} width={300} height={300} priority />

          <h2>Server Unavailable</h2>

          <span>Please check your internet connection or try again later.</span>
        </Wrapper>
      )

    case 'HTTP_ERROR':
      if (error.status === 401) {
        return (
          <Wrapper>
            <h2>Authorization required</h2>
            <p>Please log in to continue.</p>
          </Wrapper>
        )
      }
      if (error.status === 403) {
        return (
          <Wrapper>
            <h2>Access denied</h2>
            <p>You do not have rights to view this resource.</p>
          </Wrapper>
        )
      }
      return (
        <Wrapper>
          <h2>Server error</h2>
          <p>{error.message}</p>
        </Wrapper>
      )

    case 'PARSE_ERROR':
      return (
        <Wrapper>
          <h2>Data processing error</h2>
          <p>Unable to process data from the server correctly.</p>
        </Wrapper>
      )

    default:
      return (
        <Wrapper>
          <h2>Unknown Error</h2>
          <p>Something went wrong.</p>
        </Wrapper>
      )
  }
}
