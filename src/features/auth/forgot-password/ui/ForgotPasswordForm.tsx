// 'use client';

// import { useForm } from 'react-hook-form';
// import { useState, useCallback, useRef } from 'react';
// import { ControlledInput } from '@/features/formControls/input/ui';
// import s from './ForgotPasswordForm.module.scss';
// import '@ictroot/ui-kit/style.css';
// import { Typography, Card, Button, Recaptcha, Email, } from '@ictroot/ui-kit';
// interface FormData {
//     email: string;
//     recaptchaToken?: string;
// }

// export default function ForgotPasswordForm() {

//     const recaptchaSiteKey =
//         // process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ||
//         "6Lc_1VwrAAAAAKNTI8kyAOPu1lSIfRu1XJHMGnmk";
//     const {
//         control,
//         handleSubmit,
//         formState: { isSubmitting, isValid, errors },
//         setError,
//         clearErrors
//     } = useForm<FormData>({
//         mode: 'onChange',
//         defaultValues: {
//             email: '',
//             recaptchaToken: ''
//         }
//     });

//     const [showRecaptcha, setShowRecaptcha] = useState(true);

//     const [isRecaptchaVerified, setIsRecaptchaVerified] = useState(false);
//     const [recaptchaError, setRecaptchaError] = useState<string | null>(null);
//     const [serverError, setServerError] = useState<string | null>(null);
//     const [isSuccess, setIsSuccess] = useState(false);

//     const recaptchaRef = useRef<any>(null);

//     const handleRecaptchaChange = useCallback((token: string | null) => {
//         if (token) {
//             clearErrors('recaptchaToken');
//         } else {
//             setError('recaptchaToken', { type: 'manual', message: 'Please verify you are not a robot' });
//         }
//     }, [clearErrors, setError]);

//     const resetRecaptcha = () => {
//         if (recaptchaRef.current) {
//             recaptchaRef.current.reset();
//         }
//         setError('recaptchaToken', { type: 'manual', message: 'Please verify again' });
//     };

//     const onSubmit = async (data: FormData) => {

//         console.log(data)

//         if (!data.recaptchaToken) {
//             setError('recaptchaToken', { type: 'manual', message: 'Please complete the reCAPTCHA' });
//             return;
//         }
//         console.log(1)

//         try {
//             setServerError(null);

//             const response = await fetch("https://inctagram.work/api/v1/auth/password-recovery", {
//                 method: "POST",
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Accept': 'application/json',
//                 },
//                 credentials: 'include',
//                 body: JSON.stringify({
//                     email: data.email,
//                     recaptcha: data.recaptchaToken,
//                     baseUrl: window.location.href
//                 })
//             });

//             const result = await response.json();
//             if (!response.ok) {

//                 if (response.status === 400 && result.errors) {
//                     if (result.errors.recaptcha) {
//                         resetRecaptcha();
//                         setError('recaptchaToken', {
//                             type: 'manual',
//                             message: result.errors.recaptcha
//                         });
//                     }
//                     if (result.errors.email) {
//                         setError('email', {
//                             type: 'manual',
//                             message: result.errors.email
//                         });
//                     }
//                 }
//                 throw new Error(result.message || 'Request failed');
//             }

//             setIsSuccess(true);
//         } catch (error: any) {
//             console.error('API Error:', error);
//             setServerError(error.message || 'An error occurred. Please try again.');
//             resetRecaptcha();
//         }
//     };
//     if (isSuccess) {
//         return (
//             <Card className={s.wrapper}>
//                 <Typography variant={'h1'} className={s.title}>
//                     Check Your Email
//                 </Typography>
//                 <Typography variant={'regular_14'} className={s.text}>
//                     We've sent a password recovery link to your email address.
//                 </Typography>
//                 <Button as={'a'} variant={'text'} fullWidth={true} href="/sign-in">
//                     Back to Sign In
//                 </Button>
//             </Card>
//         );
//     }

//     return (
//         <Card className={s.wrapper}>
//             <Typography variant={'h1'} className={s.title}>
//                 Forgot Password
//             </Typography>
//             <div className={s.wrap}>
//                 <form onSubmit={handleSubmit(onSubmit)}>
//                     <ControlledInput
//                         control={control}
//                         name="email"
//                         inputType="text"
//                         label="Email"
//                         placeholder="Enter your email"
//                         rules={{
//                             required: 'Email is required',
//                             pattern: {
//                                 value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
//                                 message: 'Invalid email address'
//                             }
//                         }}
//                     />

//                     <Typography variant={'regular_14'} className={s.text}>
//                         Enter your email address and we will send you further instructions
//                     </Typography>

//                     {!showRecaptcha && (
//                         <Typography variant={'regular_14'} className={s.text2}>
//                             The link has been sent by email.
//                             If you don't receive an email send link again
//                         </Typography>
//                     )}

//                     <Button
//                         type="submit"
//                         fullWidth={true}
//                         disabled={isSubmitting || !isValid}
//                     >
//                         {isSubmitting ? 'Sending...' : 'Send Link'}
//                     </Button>
//                 </form>
//                 <Button as={'a'} variant={'text'} fullWidth={true}>
//                     Back to Sign In
//                 </Button>
//             </div>

//             <div className={s.recaptchaWrapper}>
//                 <Recaptcha
//                     ref={recaptchaRef}
//                     sitekey={recaptchaSiteKey}
//                     onChange={handleRecaptchaChange}
//                 />
//                 {recaptchaError && (
//                     <Typography variant={'danger'} className={s.errorText}>
//                         {recaptchaError}
//                     </Typography>
//                 )}
//             </div>

//             {serverError && (
//                 <Typography variant={`danger`} className={s.errorText}>
//                     {serverError}
//                 </Typography>
//             )}

//         </Card>
//     );
// }

'use client';

import { useForm } from 'react-hook-form';
import { useState, useCallback, useRef } from 'react';
import { ControlledInput } from '@/features/formControls/input/ui';
import s from './ForgotPasswordForm.module.scss';
import '@ictroot/ui-kit/style.css';
import { Typography, Card, Button, Recaptcha } from '@ictroot/ui-kit';

interface FormData {
    email: string;
    recaptchaToken?: string;
}

interface ServerError {
    message: string;
    field?: string;
}

export default function ForgotPasswordForm() {
    const recaptchaSiteKey = "6Lc_1VwrAAAAAKNTI8kyAOPu1lSIfRu1XJHMGnmk";
    const {
        control,
        handleSubmit,
        formState: { isSubmitting, isValid, errors },
        setError,
        clearErrors,
        watch,
        setValue
    } = useForm<FormData>({
        mode: 'onChange',
        defaultValues: {
            email: '',
            recaptchaToken: ''
        }
    });

    const [isRecaptchaVerified, setIsRecaptchaVerified] = useState(false);
    const [serverErrors, setServerErrors] = useState<ServerError[]>([]);
    const [isSuccess, setIsSuccess] = useState(false);

    const recaptchaRef = useRef<any>(null);

    const handleRecaptchaChange = useCallback((token: string | null) => {
        if (token) {
            setIsRecaptchaVerified(true);
            clearErrors('recaptchaToken');
            setValue('recaptchaToken', token); // Сохраняем токен в форме
            setServerErrors(prev => prev.filter(e => e.field !== 'recaptcha'));
        } else {
            setIsRecaptchaVerified(false);
            setValue('recaptchaToken', ''); // Очищаем токен
            setError('recaptchaToken', { type: 'manual', message: 'Please verify you are not a robot' });
        }
    }, [clearErrors, setError, setValue]);

    const resetRecaptcha = () => {
        if (recaptchaRef.current) {
            recaptchaRef.current.reset();
        }
        setIsRecaptchaVerified(false);
        setValue('recaptchaToken', ''); // Очищаем токен при сбросе
        setError('recaptchaToken', { type: 'manual', message: 'Please verify again' });
    };

    const onSubmit = async (data: FormData) => {
        if (!isRecaptchaVerified || !data.recaptchaToken) {
            setError('recaptchaToken', { type: 'manual', message: 'Please complete the reCAPTCHA' });
            return;
        }

        try {
            setServerErrors([]);

            const response = await fetch("https://inctagram.work/api/v1/auth/password-recovery", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    email: data.email,
                    recaptcha: data.recaptchaToken, // Теперь токен будет передаваться
                    baseUrl: window.location.href
                })
            });

            const result = await response.json();

            if (!response.ok) {
                if (response.status === 400 && result.messages) {
                    const newErrors: ServerError[] = [];

                    result.messages.forEach((msg: { field: string, message: string }) => {
                        if (msg.field === 'recaptcha') {
                            resetRecaptcha();
                            setError('recaptchaToken', { type: 'manual', message: msg.message });
                        } else if (msg.field === 'email') {
                            setError('email', { type: 'manual', message: msg.message });
                        }
                        newErrors.push(msg);
                    });

                    setServerErrors(newErrors);
                    return;
                }
                throw new Error(result.error || 'Request failed');
            }
            setIsSuccess(true);
        } catch (error: any) {
            console.error('API Error:', error);
            setServerErrors([{ message: error.message || 'An error occurred. Please try again.' }]);
            resetRecaptcha();
        }
    };

    if (isSuccess) {
        return (
            <Card className={s.wrapper}>
                <Typography variant={'h1'} className={s.title}>
                    Check Your Email
                </Typography>
                <Typography variant={'regular_14'} className={s.text}>
                    We've sent a password recovery link to your email address.
                </Typography>
                <Button as={'a'} variant={'text'} fullWidth={true} href="/sign-in">
                    Back to Sign In
                </Button>
            </Card>
        );
    }

    return (
        <Card className={s.wrapper}>
            <Typography variant={'h1'} className={s.title}>
                Forgot Password
            </Typography>
            <div className={s.wrap}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <ControlledInput
                        control={control}
                        name="email"
                        inputType="text"
                        label="Email"
                        placeholder="Enter your email"
                        rules={{
                            required: 'Email is required',
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email address'
                            }
                        }}
                    />

                    <Typography variant={'regular_14'} className={s.text}>
                        Enter your email address and we will send you further instructions
                    </Typography>

                    <Button
                        type="submit"
                        fullWidth={true}
                        disabled={isSubmitting || !isValid || !isRecaptchaVerified}
                    >
                        {isSubmitting ? 'Sending...' : 'Send Link'}
                    </Button>
                </form>

                <Button as={'a'} variant={'text'} fullWidth={true} href="/sign-in">
                    Back to Sign In
                </Button>
            </div>

            {!isSuccess && (
                <div className={s.recaptchaWrapper}>
                    <Recaptcha
                        ref={recaptchaRef}
                        sitekey={recaptchaSiteKey}
                        onChange={handleRecaptchaChange}
                    />
                    {(errors.recaptchaToken || serverErrors.some(e => e.field === 'recaptcha')) && (
                        <Typography variant={'danger'} className={s.errorText}>
                            {errors.recaptchaToken?.message ||
                                serverErrors.find(e => e.field === 'recaptcha')?.message}
                        </Typography>
                    )}
                </div>
            )}

            {serverErrors.filter(e => !e.field).length > 0 && (
                <Typography variant={'danger'} className={s.errorText}>
                    {serverErrors.find(e => !e.field)?.message}
                </Typography>
            )}
        </Card>
    );
}