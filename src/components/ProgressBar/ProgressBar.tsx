import styles from './ProgressBar.module.css'

type ProgressBarProps = {
  percent: number
  label?: string
}

export function ProgressBar({ percent, label = 'Прогресс выполнения' }: ProgressBarProps) {
  const safe = Math.min(100, Math.max(0, percent))

  return (
    <div
      className={styles.track}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safe}
    >
      <span
        className={safe === 100 ? styles.complete : styles.fill}
        style={{ width: `${safe}%` }}
      />
    </div>
  )
}
