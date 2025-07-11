'use client';

import { ControlledInput } from "@/features/formControls/input/ui";
import { Button, Card, Typography } from "@ictroot/ui-kit";
import { useResendVerification } from "../model/useResendVerification";
import s from "./ResendVerificationPage.module.scss";
import Image from "next/image";

export default function ResendVerificationPage() {
  const {
    handleSubmit,
    control,
    errors,
    serverError,
    successMessage,
    setSuccessMessage,
  } = useResendVerification();

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
    <div className={s.wrapper}>
      <Card className={s.card}>
        <Typography variant="h1" className={s.title}>Email verification link expired</Typography>
        <Typography variant="regular_16" className={s.subtitle}>
          Looks like the verification link has expired. Not to worry, we can send the link again
        </Typography>
        <form className={s.form} onSubmit={handleSubmit}>
          <ControlledInput
            name="email"
            control={control}
            inputType="text"
            label="Email"
            placeholder="Epam@epam.com"
            error={errors.email?.message}
          />
          {serverError && (
            <Typography variant="regular_14" color="error">{serverError}</Typography>
          )}
          <Button
            type="submit"
            fullWidth
            className={s.button}
          >
            Resend verification link
          </Button>
        </form>
        <div className={s.illustration}>
          <Image src="/rafiki.png" width={473} height={353} alt="Link expired" />
        </div>
      </Card>

    </div>
  );
}
