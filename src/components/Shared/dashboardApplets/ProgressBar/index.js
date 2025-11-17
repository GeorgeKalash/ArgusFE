import React from 'react'
import styles from './ProgressBar.module.css'

const ProgressBarComponent = ({ label, percentage }) => (
  <div className={styles.progressBarContainer}>
    <span className={styles.progressBarLabel}>{label}:</span>
    <span className={styles.progressBarLabel}>{percentage.toFixed(0)}%</span>
    <div className={styles.progressBarBackground}>
      <div className={styles.progressBar} style={{ width: `${percentage}%` }} />
    </div>
  </div>
)

export default ProgressBarComponent
