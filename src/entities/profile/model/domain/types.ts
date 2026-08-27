export interface Avatar {
  url: string
  width: number
  height: number
  fileSize: number
  createdAt: string
}

export interface Profile {
  id: number
  userName: string
  firstName: string
  lastName: string
  city: string
  country: string
  region: string
  dateOfBirth: string
  aboutMe: string
  avatars: Avatar[]
  createdAt: string
}
export interface ProfileUpdate {
  userName?: string
  firstName?: string
  lastName?: string
  city?: string
  country?: string
  region?: string
  dateOfBirth?: string | null
  aboutMe?: string
}
