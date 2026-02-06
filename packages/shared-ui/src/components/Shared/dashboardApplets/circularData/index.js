import React from 'react'
import { CircularItem } from '@argus/shared-ui/src/components/Shared/dashboardApplets/circularItem'
import styles from './CircularData.module.css'

const formatNumberWithCommas = number => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export const CircularData = ({ data, list }) => (
  <div className={styles.circleContainer}>
    {list.map((item, index) => (
      <CircularItem
        key={index}
        name={item.name}
        number={formatNumberWithCommas(data[item.key].toFixed(0))}
        isPercentage={item.isPercentage}
      />
    ))}
  </div>
)
