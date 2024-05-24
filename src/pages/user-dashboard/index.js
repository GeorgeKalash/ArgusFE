import { useEffect, useState, useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { DashboardRepository } from 'src/repositories/DashboardRepository'
import styled, { createGlobalStyle } from 'styled-components'
import Chart from 'chart.js/auto'

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
    background: linear-gradient(to bottom left, #1E3A5F, #B3CDE8);
    background-size: 125% 125%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
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
  padding: 20px;
  background: white;
  box-shadow: 4px 8px 16px 0 #12233e;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Profile = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 0;
  padding: 5px;
`

const Avatar = styled.div`
  position: relative;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  cursor: pointer;
  background: #b3cde8;
  margin-bottom: 40px;
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
    border-color: #1e3a5f #1e3a5f #1e3a5f transparent;
  }
  .circle:nth-child(2) {
    left: -12px;
    top: -12px;
    width: 328px;
    height: 328px;
    border-color: #1e3a5f transparent #1e3a5f #1e3a5f;
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
  &.big {
    font-size: 36px;
    font-weight: 600;
  }
  &.small {
    font-size: 24px;
    font-weight: 300;
  }
`

const SideData = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  background: #b3cde8;
  border-radius: 10px;
  box-shadow: 2px 4px 8px 0 #12233e;
  margin: 0 10px;
`

const DataHalf = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 5px;
  background: #e0f2ff;
  border-radius: 10px;
  box-shadow: 1px 2px 4px 0 #12233e;
  margin-bottom: 10px;
`

const CircleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 20px;
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
  margin-bottom: 10px;
`

const CompositeBarContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 300px;
  canvas {
    width: 50% !important;
    height: 70% !important;
  }
`

const ProgressBarsWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
`

const ProgressBarContainer = styled.div`
  width: 48%;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const ProgressBarLabel = styled.span`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 5px;
`

const ProgressBarBackground = styled.div`
  width: 100%;
  height: 20px;
  background-color: #e0f2ff;
  border-radius: 10px;
  box-shadow: 1px 2px 4px 0 #12233e;
  overflow: hidden;
  margin: 20px 0;
`

const ProgressBar = styled.div`
  height: 100%;
  background-color: #176fb5;
  transition: width 1.5s ease-in-out;
`

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
    newClientsAcquired: 0
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

  useEffect(() => {
    const ctx3a = document.getElementById('compositebara').getContext('2d')
    const ctx3b = document.getElementById('compositebarb').getContext('2d')

    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        title: {
          display: true,
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
    }

    const compositeBarA = new Chart(ctx3a, {
      type: 'bar',
      data: {
        labels: data.myYearlyGrowthInUnitsSoldList.map(item => item.year),
        datasets: [
          {
            label: 'Units Sold',
            data: data.myYearlyGrowthInUnitsSoldList.map(item => item.qty),
            backgroundColor: '#6673FD',
            borderColor: '#6673FD',
            borderWidth: 1
          }
        ]
      },
      options: commonOptions
    })

    const compositeBarB = new Chart(ctx3b, {
      type: 'bar',
      data: {
        labels: data.myYearlyGrowthInClientsAcquiredList.map(item => item.year),
        datasets: [
          {
            label: 'Clients Acquired',
            data: data.myYearlyGrowthInClientsAcquiredList.map(item => item.qty),
            backgroundColor: '#93C6E0',
            borderColor: '#93C6E0',
            borderWidth: 1
          }
        ]
      },
      options: commonOptions
    })

    return () => {
      compositeBarA.destroy()
      compositeBarB.destroy()
    }
  }, [data.myYearlyGrowthInUnitsSoldList, data.myYearlyGrowthInClientsAcquiredList])

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
          newClientsAcquired: res.record.newClientsAcquired || 0
        })
      })
      .catch(error => {
        setErrorMessage(error.message)
      })
  }

  return (
    <>
      <GlobalStyle />
      {errorMessage && <div>Error: {errorMessage}</div>}
      <Frame>
        <Card>
          <SideData className='left-data'>
            <DataHalf>
              <Span className='big'>Performance</Span>
              <Span className='small'>{data.performanceVsTeamAverage}</Span>
            </DataHalf>
            <DataHalf>
              <CircleContainer>
                <Circle>
                  <CircleIcon>15</CircleIcon>
                  <Span>Sales</Span>
                </Circle>
                <Circle>
                  <CircleIcon>12</CircleIcon>
                  <Span>Revenue</Span>
                </Circle>
                <Circle>
                  <CircleIcon>45%</CircleIcon>
                  <Span>Success</Span>
                </Circle>
              </CircleContainer>
            </DataHalf>
          </SideData>
          <Profile>
            <Avatar>
              <div className='circle'></div>
              <div className='circle'></div>
              <div className='pic' style={{ backgroundImage: `url(${data.imageUrl})` }}></div>
            </Avatar>
          </Profile>
          <SideData className='right-data'>
            <DataHalf>
              <CompositeBarContainer>
                <canvas id='compositebara'></canvas>
                <canvas id='compositebarb'></canvas>
              </CompositeBarContainer>
            </DataHalf>
            <DataHalf>
              <Span className='big'>Progress to Target</Span>
              <ProgressBarsWrapper>
                <ProgressBarContainer>
                  <ProgressBarLabel>Individual</ProgressBarLabel>
                  <ProgressBarBackground>
                    <ProgressBar style={{ width: `${progress.pctToTarget}%` }} />
                  </ProgressBarBackground>
                </ProgressBarContainer>
                <ProgressBarContainer>
                  <ProgressBarLabel>Team</ProgressBarLabel>
                  <ProgressBarBackground>
                    <ProgressBar style={{ width: `${progress.teamPctToTarget}%` }} />
                  </ProgressBarBackground>
                </ProgressBarContainer>
              </ProgressBarsWrapper>
            </DataHalf>
          </SideData>
        </Card>
      </Frame>
    </>
  )
}

export default UserDashboard
