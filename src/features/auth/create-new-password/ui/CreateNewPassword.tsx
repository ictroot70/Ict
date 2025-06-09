'use client'
import React from 'react';
import {SubmitHandler, useForm} from 'react-hook-form';
import {ControlledInput} from '@/features/formControls/input/ui';
import {Button, ErrorMessage, Typography, LabelRadix} from '@/shared/ui';
import styles from './CreateNewPassword.module.scss';

interface FormValues {
  password: string;
  passwordConfirmation: string;
}

export const CreateNewPassword = () => {
  const {
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<FormValues>({
    mode: 'onTouched',
    defaultValues: {
      password: '',
      passwordConfirmation: '',
    },
  });

  const password = watch('password');
  const passwordConfirmation = watch('passwordConfirmation');

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (data.password !== data.passwordConfirmation) {
      setError('passwordConfirmation', { message: 'The passwords must match' });
      return;
    }
    alert('Password changed!');
  };

  React.useEffect(() => {
    if (
      passwordConfirmation &&
      password !== passwordConfirmation &&
      !errors.passwordConfirmation
    ) {
      setError('passwordConfirmation', { message: 'The passwords must match' });
    } else if (password === passwordConfirmation && errors.passwordConfirmation) {
      clearErrors('passwordConfirmation');
    }
  }, [password, passwordConfirmation, setError, clearErrors, errors.passwordConfirmation]);

  return (
    <div className={styles.createNewPassword}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={styles.createNewPassword__form}
      >
        <Typography variant="h2" className={styles.createNewPassword__title}>
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
            // minLength: { value: 6, message: 'Password must be at least 6 characters' },
            maxLength: { value: 20, message: 'Password must be at most 20 characters' },
          }}
        />
        <div className={styles.createNewPassword__spacer} />
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
            // minLength: { value: 6, message: 'Password must be at least 6 characters' },
            maxLength: { value: 20, message: 'Password must be at most 20 characters' },
            validate: (value) => value === password || 'The passwords must match',
          }}
        />
        {errors.passwordConfirmation && (
          <ErrorMessage message={errors.passwordConfirmation.message} className={styles.createNewPassword__error}/>
        )}
        <LabelRadix className={styles.createNewPassword__hint}>
          Your password must be between 6 and 20 characters
        </LabelRadix>
        <Button type="submit" fullWidth disabled={isSubmitting} className={styles.createNewPassword__button}>
          Create new password
        </Button>
      </form>
    </div>
  );
};