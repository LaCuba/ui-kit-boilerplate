import React from 'react'
import clsx from 'clsx'
import styles from './Button.module.scss'

const SIZES = {
  medium: 'medium',
  small: 'small',
} as const

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  size?: ValueOf<typeof SIZES>
}

export function Button({
  children,
  size = SIZES.medium,
  className,
  ...rest
}: ButtonProps): JSX.Element {
  return (
    <button
      className={clsx(styles.base, styles[size], className)}
      type="button"
      {...rest}
    >
      {children}
    </button>
  )
}

Button.displayName = 'Button'
Button.sizes = SIZES
