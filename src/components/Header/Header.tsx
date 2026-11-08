import { ListChecks } from 'lucide-react'
import type { StorageStatus } from '../../utils/storage'
import styles from './Header.module.css'

type HeaderProps = {
  status: StorageStatus
}

export function Header({ status }: HeaderProps) {
  const unavailable = status === 'read_error'

  return (
    <header className={styles.header}>
      <a className={styles.skip} href="#tasks">
        Перейти к задачам
      </a>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.mark} aria-hidden="true">
            <ListChecks size={22} strokeWidth={2.2} />
          </span>
          <div>
            <p className={styles.name}>TaskFlow</p>
            <p className={styles.tagline}>Организуйте свои задачи. Освободите голову</p>
          </div>
        </div>
        <p
          className={styles.storage}
          title="Задачи сохраняются в LocalStorage этого браузера"
        >
          <span className={unavailable ? styles.dotDanger : styles.dot} aria-hidden="true" />
          {unavailable ? 'Хранение недоступно' : 'Данные хранятся локально'}
        </p>
      </div>
    </header>
  )
}
