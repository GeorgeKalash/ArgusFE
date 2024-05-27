import styled from 'styled-components'
import { CircularItem } from './circularItem'

const CircleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 20px;
`

export const CircularData = ({ data }) => (
  <CircleContainer>
    <CircularItem name='Units Sold' number={data.unitsSold} />
    <CircularItem name='New Clients Acquired' number={data.newClientsAcquired} />
    <CircularItem name='Percentage To Target' number={data.pctToTarget.toFixed(0)} isPercentage={true} />
  </CircleContainer>
)
