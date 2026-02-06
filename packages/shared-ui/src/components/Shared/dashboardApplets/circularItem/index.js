import styles from './CircularItem.module.css'

export const CircularItem = ({ number, name, isPercentage = false }) => (
  <div className={styles.circleItemContainer}>
    <div className={styles.circleIcon}>
      <div className={styles.circleIconContent}>
        {number}
        {isPercentage ? '%' : ''}
      </div>
    </div>

    <span className={styles.span}>{name}</span>
  </div>
)
