'use client'

import { ControlledCheckbox } from '@/features/formControls/checkbox/ui'
import { ControlledInput } from '@/features/formControls/input/ui'
import { Button, Card, Typography } from '@/shared'
import { GitHub, Google } from '@ictroot/ui-kit'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { getAuth, GoogleAuthProvider, GithubAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '@/shared/config/firebase-config';
import s from './SignUpForm.module.scss'


const labelContent = (
  <>
    I agree to the{' '}
    <a href={''} rel={'noopener noreferrer'} onClick={e => e.stopPropagation()}>
      Terms of Service
    </a>{' '}
    and{' '}
    <a href={''} rel={'noopener noreferrer'} onClick={e => e.stopPropagation()}>
      Privacy Policy
    </a>{' '}
  </>
)

export const SignUpForm = () => {
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      passwordConfirm: '',
      agreement: false,
    },
  })

  const [isChecked, setChecked] = useState(false)
  const handlerCheckbox = () => setChecked(prev => !prev)

  const onSubmitHandler = (data: any) => {
    console.log(data)
    reset()
  }

  const handleGoogleSignIn = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            const provider = new GoogleAuthProvider();
            if (!auth) {
                throw new Error('Firebase auth not initialized');
            }
            const result = await signInWithPopup(auth, provider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            console.log('Google auth success', credential);
        } catch (error: any) {
            if (error.code === 'auth/cancelled-popup-request') {
                console.log('User cancelled the popup');
                return;
            }
            console.error('Google auth error:', error);
        }
    };

    const handleGitHubSignIn = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            const provider = new GithubAuthProvider();
            if (!auth) {
                throw new Error('Firebase auth not initialized');
            }
            const result = await signInWithPopup(auth, provider);
            const credential = GithubAuthProvider.credentialFromResult(result);
            console.log('GitHub auth success', credential);
        } catch (error: any) {
            if (error.code === 'auth/cancelled-popup-request') {
                console.log('User cancelled the popup');
                return;
            }
            console.error('GitHub auth error:', error);
        }
    };

    return (
    <Card className={s.wrapper}>
      <Typography variant="h1" className={s.title}>
        Sign Up
      </Typography>
      <div className={s.oauthProviders}>
        <Button as="button"  variant="text" onClick={handleGoogleSignIn}>
          <Google size={36} />
        </Button>
        <Button as="button" variant="text" onClick={handleGitHubSignIn}>
          <GitHub size={36} color="var(--color-light-100)" />
        </Button>
      </div>
      <form className={s.form} autoComplete="off" onSubmit={handleSubmit(onSubmitHandler)}>
        <div className={s.fields}>
          <ControlledInput
            id="username"
            name="username"
            control={control}
            inputType="text"
            label="Username"
            placeholder="Your username..."
          />
          <ControlledInput
            id="email"
            name="email"
            control={control}
            inputType="text"
            label="Email"
            placeholder="Your email..."
          />
          <ControlledInput
            id="password"
            name="password"
            control={control}
            inputType="hide-able"
            label="Password"
            placeholder="***************"
            className={s.passwordField}
          />
          <ControlledInput
            id="passwordConfirm"
            name="passwordConfirm"
            control={control}
            inputType="hide-able"
            label="Password confirmation"
            placeholder="***************"
            className={s.passwordField}
          />
        </div>

        <ControlledCheckbox
          name="agreement"
          control={control}
          label={labelContent}
          className={s.agreement}
          checked={isChecked}
          onClick={handlerCheckbox}
        />
        <Button variant="primary" fullWidth>
          Sign Up
        </Button>
      </form>
      <div className={s.hasAccount}>
        <Typography variant="regular_16">Do you have an account?</Typography>
        <Button as="a" href="#signIn" variant="text" fullWidth>
          Sign In
        </Button>
      </div>
    </Card>
  )
}
