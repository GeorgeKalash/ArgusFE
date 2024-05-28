import React from 'react'
import { CircularItem } from './circularItem'
import styled from 'styled-components'

const CircleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  flex: 0;
  margin-bottom: 20px;
`

export const CircularData = ({ data, list }) => (
  <CircleContainer>
    {list.map((item, index) => (
      <CircularItem
        key={index}
        name={item.name}
        number={item.isPercentage ? data[item.key].toFixed(0) : data[item.key]}
        isPercentage={item.isPercentage}
      />
    ))}
  </CircleContainer>
)
