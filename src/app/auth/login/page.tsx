'use client'
import { SignInForm } from '@/features/auth/sign-in/ui/SignInForm'
import { useSignIn } from '@/features/auth/sign-in/model/useSignIn'

export default function SingIn() {
  const {
    form: { control, formState },
    onSubmit,
    isLoading,
  } = useSignIn()

  return (
    <SignInForm
      control={control}
      formState={{
        errors: formState.errors,
        isDirty: formState.isDirty,
        isValid: formState.isValid,
      }}
      onSubmit={onSubmit}
      isLoading={isLoading}
      onSignInGoogle={() => console.log('Google login')}
      onSignInGithub={() => console.log('GitHub login')}
    />
  )
}
