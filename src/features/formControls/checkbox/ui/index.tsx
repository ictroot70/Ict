import {FieldValues, useController, UseControllerProps} from 'react-hook-form'
import {CheckboxProps, CheckboxRadix} from '@/shared'
import {ReactElement} from "react";
import {OmitControllerFieldProps} from "@/shared/lib";


type ControlledCheckboxProps<T extends FieldValues> = UseControllerProps<T> &
    OmitControllerFieldProps<CheckboxProps>


export const ControlledCheckbox = <T extends FieldValues>({
                                                              name,
                                                              control,
                                                              ...restProps
                                                          }: ControlledCheckboxProps<T>): ReactElement => {
    const {
        field: {value, onChange, ...fieldRest},
        fieldState: {error}
    } = useController({
        name,
        control,
    })

    return <CheckboxRadix {...restProps} {...fieldRest} errorMessage={error?.message} checked={!!value}
                          onCheckedChange={onChange}/>
}