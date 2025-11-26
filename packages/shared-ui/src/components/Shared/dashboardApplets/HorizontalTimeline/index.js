import React from 'react'
import styles from './HorizontalTimeline.module.css'

const HorizontalTimeline = ({ data, label }) => (
  <div className={styles.timelineWrapper}>
    <h2 className={styles.timelineTitle}>{label}</h2>
    <div className={styles.timelineContainer}>
      <div className={styles.timelineArrow} />
      {data.map((item, index) => (
        <div key={index} className={styles.timelineItem}>
          {index % 2 === 0 ? (
            <div className={`${styles.timelineContent} ${styles.timelineContentTop}`}>
              {item.spRef}
            </div>
          ) : (
            <div className={`${styles.timelineContent} ${styles.timelineContentBottom}`}>
              {item.spRef}
            </div>
          )}
          <div className={styles.timelineIcon} />
        </div>
      ))}
    </div>
  </div>
)

export default HorizontalTimeline
