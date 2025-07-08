'use client'



import { useState } from "react";
import { ControlledInput } from "@/features/formControls/input/ui";
import { useForm } from "react-hook-form";
import s from "./ResendVerification.module.scss";
import { Typography } from "@/shared/ui/Typography";
import {Button, Card} from "@ictroot/ui-kit";



export const ResendVerification = () => {
    const [serverError, setServerError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const { handleSubmit, control, formState: { errors } } = useForm<{ email: string }>({
        defaultValues: { email: "" }
    });

    const onSubmit = async ({ email }: { email: string }) => {
        setServerError("");
        setSuccessMessage("");
        try {
            const response = await fetch("https://inctagram.work/api/v1/auth/registration-email-resending", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email,
                baseUrl: window.location.origin + '/auth/registration-confirmation',
              })
            });
            if (response.ok && response.status === 204) {
                setSuccessMessage("We have sent a link to confirm your email to " + email);
            } else {
                const result = await response.json();
                setServerError(result.messages?.[0]?.message || "Failed to resend verification link.");
            }
        } catch (e) {
            setServerError("Network error. Please try again.");
        }
    };

    if (successMessage) {
        return (
            <Card className={s.successModal}>
                <Typography variant="h2">Success</Typography>
                <Typography variant="regular_16">{successMessage}</Typography>
                <Button fullWidth onClick={() => setSuccessMessage("")}>OK</Button>
            </Card>
        );
    }

    return (
        <Card className={s.wrapper}>
            <Typography variant="h1">Resend verification link</Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
                <ControlledInput
                    name="email"
                    control={control}
                    inputType="text"
                    label="Email"
                    placeholder="Your email..."
                    error={errors.email?.message}
                />
                {serverError && (
                    <Typography variant="regular_14" color="error">{serverError}</Typography>
                )}
                <Button type="submit" fullWidth>
                    Resend verification link
                </Button>
            </form>
        </Card>
    );
};