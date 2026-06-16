import { UserSearch } from '@/widgets/UserSearch'

export default function Search() {
  return (
    <div
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
    >
      <h2 style={{ marginBottom: '20px' }}>Search</h2>
      <UserSearch />
    </div>
  )
}
