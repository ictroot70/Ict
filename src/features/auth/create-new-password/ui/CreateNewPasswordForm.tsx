'use client';

import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { Card, Button, Typography } from '@/shared';
import { ControlledInput } from '@/features/formControls/input/ui';
import s from './CreateNewPasswordForm.module.scss';
import '@ictroot/ui-kit/style.css';

interface FormData {
    password: string;
    confirmPassword: string;
}

export default function CreateNewPasswordForm() {
    const methods = useForm<FormData>({
        mode: 'onChange',
    });

    const onSubmit = (data: FormData) => {
        console.log('New password created:', data.password);
    };

    return (
        <FormProvider {...methods}>
            <Card className={s.wrapper}>
                <Typography variant={'h1'} className={s.title}>
                    Create New Password
                </Typography>
                <FormContent onSubmit={onSubmit} />
            </Card>
        </FormProvider>
    );
}

function FormContent({ onSubmit }: { onSubmit: (data: FormData) => void }) {
    const {
        handleSubmit,
        watch,
        formState: { errors },
    } = useFormContext<FormData>();

    const password = watch('password');

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className={s.wrap}>
                <ControlledInput
                    name="password"
                    inputType="hide-able"
                    label="New password"
                    placeholder="Enter your password"
                    className={s.input}
                    rules={{
                        required: 'Password is required',
                        minLength: {
                            value: 6,
                            message: 'Password must be at least 6 characters',
                        },
                        maxLength: {
                            value: 20,
                            message: 'Password must be no more than 20 characters',
                        },
                    }}
                />
                <ControlledInput
                    name="confirmPassword"
                    inputType="hide-able"
                    placeholder="Confirm your password"
                    label="Password confirmation"
                    className={s.input}
                    rules={{
                        required: 'Please confirm your password',
                        validate: (value) =>
                            value === password || 'The passwords must match',
                    }}
                />
            </div>

            {errors.confirmPassword && (
                <Typography variant="regular_14" color="error">
                    {errors.confirmPassword.message}
                </Typography>
            )}

            <Typography variant={'regular_14'} className={s.text}>
                Your password must be between 6 and 20 characters
            </Typography>

            <Button
                type="submit"
                fullWidth={true}
                className={s.button}
            >
                Create new password
            </Button>
        </form>
    );
}