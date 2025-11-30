export interface ProviderCodeInputDto {
  redirectUrl?: string
  code: string
}

export interface ProviderLoginResSwaggerDto {
  accessToken: string
  email: string
}
