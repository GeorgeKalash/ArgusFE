import React from 'react'
import { CircularItem } from './circularItem'
import styled from 'styled-components'

const CircleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  flex: 0;
`

const formatNumberWithCommas = number => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export const CircularData = ({ data, list }) => (
  <CircleContainer>
    {list.map((item, index) => (
      <CircularItem
        key={index}
        name={item.name}
        number={formatNumberWithCommas(data[item.key].toFixed(0))}
        isPercentage={item.isPercentage}
      />
    ))}
  </CircleContainer>
)
