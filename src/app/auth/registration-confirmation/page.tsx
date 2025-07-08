'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect } from "react";
import {useConfirmRegistrationMutation} from "@/features/auth/api/authApi";

export default function RegistrationConfirmPage() {
    const params = useSearchParams();
    const code = params?.get('code');
    const router = useRouter();
    const [confirmRegistration] = useConfirmRegistrationMutation();

    useEffect(() => {
        if (code) {
            confirmRegistration({ confirmationCode: code })
                .unwrap()
                .then(() => {
                    router.replace('/login?confirmed=1');
                })
                .catch(() => {
                    // router.replace('/email-expired');
                });
        }
    }, [code, confirmRegistration, router]);

    return <div>Проверка подтверждения email...</div>;
}
