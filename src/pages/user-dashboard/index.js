import { useEffect, useState, useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { DashboardRepository } from 'src/repositories/DashboardRepository'
import styled, { createGlobalStyle } from 'styled-components'
import Chart from 'chart.js/auto'
import { CircularData } from './circularData'

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css?family=Open+Sans:700,600,300');
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  body,
  html {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Open Sans', Helvetica, sans-serif;
    background: linear-gradient(to bottom left, #231F20, #383838);
    background-size: 125% 125%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #f0f0f0;
  }
`

const Frame = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`

const Card = styled.div`
  width: 100%;
  padding: 30px;
  background: #383838;
  border-radius: 15px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: stretch;
`

const Profile = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 0 0 400px;
  padding: 20px;
  background: #231f20;
  border-radius: 15px;
`

const Avatar = styled.div`
  position: relative;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  cursor: pointer;
  background: #444;
  margin-bottom: 30px;
  .circle {
    position: absolute;
    border-radius: 50%;
    border: 2px solid;
    transition: all 1.5s ease-in-out;
  }
  .circle:first-child {
    left: -8px;
    top: -8px;
    width: 316px;
    height: 316px;
    border-color: #93c6e0 #93c6e0 #93c6e0 transparent;
  }
  .circle:nth-child(2) {
    left: -12px;
    top: -12px;
    width: 328px;
    height: 328px;
    border-color: #93c6e0 transparent #93c6e0 #93c6e0;
  }
  &:hover .circle:first-child {
    transform: rotate(360deg);
  }
  &:hover .circle:nth-child(2) {
    transform: rotate(-360deg);
  }
  .pic {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    background-size: cover;
    background-position: center;
  }
  .pic:after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    background: radial-gradient(transparent, 90%, #1e3a5f);
  }
`

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

const SideData = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: #231f20;
  border-radius: 15px;
  margin: 0 10px;
`

const DataHalf = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 10px;
  background: #444;
  border-radius: 15px;
  border-top: 2px solid #93c6e0;
  flex: 1;
  margin: 10px 0;
`

const CompositeBarContainer = styled.div`
  width: 50%;
  padding: 10px;
  canvas {
    width: 100% !important;
    height: 250px !important;
  }
`

const ProgressBarsWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
`

const ProgressBarContainer = styled.div`
  width: 45%;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const ProgressBarLabel = styled.span`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 5px;
  color: #f0f0f0;
`

const ProgressBarBackground = styled.div`
  width: 100%;
  height: 20px;
  background-color: #e0f2ff;
  border-radius: 10px;
  overflow: hidden;
  margin: 20px 0;
`

const ProgressBar = styled.div`
  height: 100%;
  background-color: #176fb5;
  transition: width 1.5s ease-in-out;
`

const ErrorMessage = styled.div`
  color: white;
  margin: 20px 0;
`

const ProfileAvatar = ({ imageUrl }) => (
  <Avatar>
    <div className='circle'></div>
    <div className='circle'></div>
    <div className='pic' style={{ backgroundImage: `url(${imageUrl})` }}></div>
  </Avatar>
)

const getChartOptions = label => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        color: '#f0f0f0'
      },
      grid: {
        display: false
      }
    },
    x: {
      ticks: {
        color: '#f0f0f0'
      },
      grid: {
        display: false
      }
    }
  },
  plugins: {
    title: {
      display: true,
      text: label,
      font: {
        size: 24,
        weight: 'bold'
      },
      color: '#6673FD'
    },
    tooltip: {
      enabled: true,
      callbacks: {
        label: function (context) {
          return `${context.dataset.label}: ${context.raw}`
        }
      }
    }
  }
})

const CompositeBarChart = ({ id, labels, data, label }) => {
  useEffect(() => {
    const ctx = document.getElementById(id).getContext('2d')

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            backgroundColor: '#6673FD',
            borderColor: '#6673FD',
            borderWidth: 1
          }
        ]
      },
      options: getChartOptions(label)
    })

    return () => {
      chart.destroy()
    }
  }, [id, labels, data, label])

  return <canvas id={id}></canvas>
}

const ProgressBarComponent = ({ label, percentage }) => (
  <ProgressBarContainer>
    <ProgressBarLabel>{label}:</ProgressBarLabel>
    <ProgressBarLabel>{percentage.toFixed(0)}%</ProgressBarLabel>
    <ProgressBarBackground>
      <ProgressBar style={{ width: `${percentage}%` }} />
    </ProgressBarBackground>
  </ProgressBarContainer>
)

const UserDashboard = () => {
  const [errorMessage, setErrorMessage] = useState(null)
  const { getRequest } = useContext(RequestsContext)

  const [data, setData] = useState({
    imageUrl: '',
    myYearlyGrowthInUnitsSoldList: [],
    myYearlyGrowthInClientsAcquiredList: [],
    pctToTarget: 0.0,
    unitsSold: 0.0,
    performanceVsTeamAverage: 0.0,
    teamPctToTarget: 0.0,
    newClientsAcquired: 0,
    name: ''
  })

  const [progress, setProgress] = useState({ pctToTarget: 0, teamPctToTarget: 0 })

  useEffect(() => {
    getDataResult()
  }, [])

  useEffect(() => {
    if (data.pctToTarget > 0 || data.teamPctToTarget > 0) {
      setProgress({ pctToTarget: data.pctToTarget, teamPctToTarget: data.teamPctToTarget })
    }
  }, [data.pctToTarget, data.teamPctToTarget])

  const getDataResult = () => {
    getRequest({
      extension: DashboardRepository.SalesPersonDashboard.spDB
    })
      .then(res => {
        setData({
          imageUrl: res.record.imageUrl || '',
          myYearlyGrowthInUnitsSoldList: res.record.myYearlyGrowthInUnitsSoldList || [],
          myYearlyGrowthInClientsAcquiredList: res.record.myYearlyGrowthInClientsAcquiredList || [],
          pctToTarget: res.record.pctToTarget || 0.0,
          unitsSold: res.record.unitsSold || 0.0,
          performanceVsTeamAverage: res.record.performanceVsTeamAverage || 0.0,
          teamPctToTarget: res.record.teamPctToTarget || 0.0,
          newClientsAcquired: res.record.newClientsAcquired || 0,
          name: res.record.salesPerson.name || ''
        })
      })
      .catch(error => {
        setErrorMessage(error.message)
      })
  }

  return (
    <>
      <GlobalStyle />
      {errorMessage && <ErrorMessage>Error: {errorMessage}</ErrorMessage>}
      <Frame>
        <Card>
          <SideData>
            <DataHalf>
              <Span className='big'>{data.name}</Span>
            </DataHalf>
            <DataHalf>
              <CircularData data={data} />
            </DataHalf>
          </SideData>
          <Profile>
            <ProfileAvatar imageUrl={data.imageUrl} />
          </Profile>
          <SideData>
            <DataHalf>
              <CompositeBarContainer>
                <CompositeBarChart
                  id='compositebara'
                  labels={data.myYearlyGrowthInUnitsSoldList.map(item => item.year)}
                  data={data.myYearlyGrowthInUnitsSoldList.map(item => item.qty)}
                  label='Units Sold'
                />
              </CompositeBarContainer>
              <CompositeBarContainer>
                <CompositeBarChart
                  id='compositebarb'
                  labels={data.myYearlyGrowthInClientsAcquiredList.map(item => item.year)}
                  data={data.myYearlyGrowthInClientsAcquiredList.map(item => item.qty)}
                  label='Clients Acquired'
                />
              </CompositeBarContainer>
            </DataHalf>
            <DataHalf>
              <ProgressBarsWrapper>
                <ProgressBarComponent label='Percentage To Target' percentage={progress.pctToTarget} />
                <ProgressBarComponent label='Team Percentage To Target' percentage={progress.teamPctToTarget} />
              </ProgressBarsWrapper>
            </DataHalf>
          </SideData>
        </Card>
      </Frame>
    </>
  )
}

export default UserDashboard
