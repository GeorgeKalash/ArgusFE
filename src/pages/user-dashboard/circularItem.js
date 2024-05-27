import styled from 'styled-components'

const Span = styled.span`
  display: block;
  text-transform: capitalize;
  text-align: center;
  color: #f0f0f0;
  &.big {
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 5px;
  }
  &.small {
    font-size: 18px;
    font-weight: 300;
  }
`

const Circle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 33%;
`

const CircleIcon = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: #176fb5;
  margin-bottom: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`

export const CircularItem = ({ number, name, isPercentage = false }) => (
  <Circle>
    <CircleIcon>
      {number}
      {isPercentage ? '%' : ''}
    </CircleIcon>
    <Span>{name}</Span>
  </Circle>
)
