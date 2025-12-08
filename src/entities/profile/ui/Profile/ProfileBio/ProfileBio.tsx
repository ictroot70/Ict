import { Typography } from '@/shared/ui'

type Props = {
    aboutMe: string | null
}

export const ProfileBio = ({ aboutMe }: Props) => (
    <Typography variant="regular_16" >
        {aboutMe || 'No information has been added yet.'}
    </Typography>
);