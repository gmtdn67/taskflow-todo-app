import type { TaskStats as Stats } from '../../types/task'
import { ProgressBar } from '../ProgressBar/ProgressBar'
import styles from './TaskStats.module.css'

type TaskStatsProps = {
  stats: Stats
}

export function TaskStats({ stats }: TaskStatsProps) {
  return (
    <section className={styles.stats} aria-label="Статистика задач">
      <div className={styles.card}>
        <p className={styles.value}>{stats.total}</p>
        <p className={styles.label}>Всего задач</p>
      </div>
      <div className={styles.card}>
        <p className={styles.value}>{stats.completed}</p>
        <p className={styles.label}>Выполнено</p>
      </div>
      <div className={styles.card}>
        <p className={styles.value}>{stats.remaining}</p>
        <p className={styles.label}>Осталось выполнить</p>
      </div>
      <div className={styles.card}>
        <p className={styles.value}>{stats.percent}%</p>
        <p className={styles.label}>Прогресс выполнения</p>
      </div>
      <div className={styles.wide}>
        <ProgressBar percent={stats.percent} />
      </div>
    </section>
  )
}
