
'use client'

import { Typography } from "@/shared/ui/Typography";
import {ResendVerification} from "@/features/auth/email-expired/ResendVerification";
import {Card} from "@ictroot/ui-kit";

export default function EmailExpiredPage() {
    return (
        <Card>
            <Typography variant="h1" className={'text-content'}>Срок действия ссылки истёк</Typography>
            <Typography variant="regular_16" style={{ marginBottom: 16 }}>
                Ваша ссылка устарела. Пожалуйста, запросите новую:
            </Typography>
            <ResendVerification />
        </Card>
    )
}