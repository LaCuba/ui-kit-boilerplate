import clsx from 'clsx'
import styles from './Common.module.scss'

export type CommonModalProps = React.PropsWithChildren<{
  className?: string
}>

export function CommonModal({ children, className }: CommonModalProps) {
  return <div className={clsx(styles.base, className)}>{children}</div>
}
