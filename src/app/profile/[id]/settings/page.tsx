import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function SettingsIndexPage({ params }: Props) {
  const { id } = await params

  redirect(`/profile/${id}/settings/general`)
}
