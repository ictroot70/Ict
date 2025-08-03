export interface AvatarViewDto {
  url: string
  width: number
  height: number
  fileSize: number
  createdAt: string // ISO 8601 format: "2025-07-01T08:15:20.008Z"
}

export interface ProfileViewModel {
  id: number
  userName: string
  firstName: string
  lastName: string
  city: string
  country: string
  region: string
  dateOfBirth: string
  aboutMe: string
  avatars: AvatarViewDto[]
  createdAt?: string
}

export interface ProfileUpdateDto {
  userName: string
  firstName: string
  lastName: string
  city?: string
  country?: string
  region?: string
  dateOfBirth?: string
  aboutMe?: string
}
