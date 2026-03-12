import React from 'react';
import styles from './Radio.module.scss';

interface RadioProps {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  description?: string;
}

export const Radio: React.FC<RadioProps> = ({
  name,
  value,
  checked,
  onChange,
  label,
  description
}) => {
  return (
    <label className={styles.radio}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className={styles.radio__input}
      />
      <span
        className={`${styles.radio__control} ${checked ? styles.radio__controlSelected : ''
          }`}
      />
      <span className={styles.radio__label}>
        {label}
        {description && (
          <span className={styles.radio__description}>
            {description}
          </span>
        )}
      </span>
    </label>
  );
};