import styled from 'styled-components'

const Span = styled.span`
  display: block;
  text-transform: capitalize;
  text-align: center;
  color: #f0f0f0;
  flex: 1;
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

const CircleIcon = styled.div`
  border-radius: 50%;
  background: #ffffff;
  flex: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: #176fb5;
  margin-bottom: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`

const CircleIconContent = styled.div`
  width: 130px;
  height: 130px;
  border-radius: 50%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
`

const CircleItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin: 5px;
`

export const CircularItem = ({ number, name, isPercentage = false }) => (
  <CircleItemContainer>
    <CircleIcon>
      <CircleIconContent>
        {number}
        {isPercentage ? '%' : ''}
      </CircleIconContent>
    </CircleIcon>
    <Span>{name}</Span>
  </CircleItemContainer>
)
