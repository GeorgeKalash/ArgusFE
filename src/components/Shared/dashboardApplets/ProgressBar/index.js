import styled from 'styled-components'

const ProgressBarContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`

const ProgressBarLabel = styled.span`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 5px;
  color: #f0f0f0;
`

const ProgressBarBackground = styled.div`
  width: 90%;
  height: 20px;
  background-color: #e0f2ff;
  border-radius: 10px;
  overflow: hidden;
  margin: 10px 0;
`

const ProgressBar = styled.div`
  height: 100%;
  background-color: #176fb5;
  transition: width 1.5s ease-in-out;
`

const ProgressBarComponent = ({ label, percentage }) => (
  <ProgressBarContainer>
    <ProgressBarLabel>{label}:</ProgressBarLabel>
    <ProgressBarLabel>{percentage.toFixed(0)}%</ProgressBarLabel>
    <ProgressBarBackground>
      <ProgressBar style={{ width: `${percentage}%` }} />
    </ProgressBarBackground>
  </ProgressBarContainer>
)

export default ProgressBarComponent
