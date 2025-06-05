'use client';

import { FieldValues, useController, UseControllerProps } from 'react-hook-form';
import { ComponentPropsWithoutRef, ReactElement } from 'react';
import { Input } from '@/shared';
import {OmitControllerFieldProps} from "@/shared/lib";

interface InputProps extends ComponentPropsWithoutRef<'input'> {
    label?: string;
    error?: string;
    placeholder?: string;
    inputType: 'text' | 'hide-able' | 'search';
    disabled?: boolean;
    required?: boolean;
}

type ControlledInputProps<T extends FieldValues> = UseControllerProps<T> &
    OmitControllerFieldProps<InputProps>
export const ControlledInput = <T extends FieldValues>({
                                                           control,
                                                           name,
                                                           ...rest
                                                       }: ControlledInputProps<T>): ReactElement => {
    const {
        field,
        fieldState: { error },
    } = useController({ control, name });

    return <Input {...rest} {...field} error={error?.message} />;
};
