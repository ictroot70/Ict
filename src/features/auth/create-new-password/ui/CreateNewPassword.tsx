'use client'
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { ControlledInput } from '@/features/formControls/input/ui';
import { Button, ErrorMessage, Typography, LabelRadix } from '@/shared/ui';
import styles from './CreateNewPassword.module.scss';

interface FormValues {
    password: string;
    passwordConfirmation: string;
}

export const CreateNewPassword = () => {
    const {
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
        watch,
    } = useForm<FormValues>({
        mode: 'onTouched',
        defaultValues: {
            password: '',
            passwordConfirmation: '',
        },
    });

    const password = watch('password');

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        // handle submit
    };

    return (
        <div className={styles.createNewPassword}>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className={styles.createNewPasswordForm}
            >
                <Typography variant="h1" className={styles.createNewPasswordTitle}>
                    Create New Password
                </Typography>
                <ControlledInput<FormValues>
                    control={control}
                    name="password"
                    label="New password"
                    inputType="hide-able"
                    placeholder="Enter new password"
                    required
                    minLength={6}
                    maxLength={20}
                    error={errors.password?.message}
                    rules={{
                        required: 'Password is required',
                        maxLength: { value: 20, message: 'Password must be at most 20 characters' },
                    }}
                />
                <ControlledInput<FormValues>
                    control={control}
                    name="passwordConfirmation"
                    label="Password confirmation"
                    inputType="hide-able"
                    placeholder="Repeat new password"
                    required
                    minLength={6}
                    maxLength={20}
                    error={errors.passwordConfirmation?.message}
                    rules={{
                        required: 'Password confirmation is required',
                        maxLength: { value: 20, message: 'Password must be at most 20 characters' },
                        validate: value => value === password || 'The passwords must match',
                    }}
                />
                {errors.passwordConfirmation && (
                    <ErrorMessage message={errors.passwordConfirmation.message || ''} className={styles.createNewPasswordLabel} />
                )}
                <LabelRadix className={styles.createNewPasswordLabel}>
                    Your password must be between 6 and 20 characters
                </LabelRadix>
                <Button type="submit" disabled={isSubmitting}>
                    <Typography variant={'h3'}>
                        Create new password
                    </Typography>
                </Button>
            </form>
        </div>
    );
};