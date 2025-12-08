import { UserMetadata } from '@/shared/types'
import { Typography } from '@/shared/ui'
import s from "./ProfileStats.module.scss"

type Props = {
    stats: UserMetadata
}

export const ProfileStats = ({ stats }: Props) => {
    const { following, followers, publications } = stats

    const statsData = [
        { label: 'Following', value: following },
        { label: 'Followers', value: followers },
        { label: 'Publications', value: publications },
    ]

    return (<ul className={s.stats}>
        {statsData.map(({ label, value }) => (
            <li key={label}>
                <Typography variant="bold_14">{value}</Typography>
                <Typography variant="regular_14">{label}</Typography>
            </li>
        ))}
    </ul>)


}

