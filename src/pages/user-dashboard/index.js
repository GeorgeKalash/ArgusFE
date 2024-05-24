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

const ChartContainer = styled.div`
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
  useEffect(() => {
    getDataResult()
  }, [])
  useEffect(() => {
    const ctx1 = document.getElementById('chart1').getContext('2d')
    const ctx2 = document.getElementById('chart2').getContext('2d')

    const chart1 = new Chart(ctx1, {
      type: 'bar',
      data: {
        labels: data.myYearlyGrowthInUnitsSoldList.map(item => item.year),
        datasets: [
          {
            label: 'Units Sold',
            data: data.myYearlyGrowthInUnitsSoldList.map(item => item.qty),
            backgroundColor: ['#93C6E0', '#5DA9D4', '#378DC8', '#176FB5'],
            borderColor: ['#176FB5', '#176FB5', '#176FB5', '#176FB5'],
            borderWidth: 1
          }
        ]
      },
      options: {
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
            text: 'Units Sold',
            font: {
              size: 24,
              weight: 'bold'
            },
            color: '#176FB5'
          }
        }
      }
    })

    const chart2 = new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: data.myYearlyGrowthInClientsAcquiredList.map(item => item.year),
        datasets: [
          {
            label: 'Clients Acquired',
            data: data.myYearlyGrowthInClientsAcquiredList.map(item => item.qty),
            backgroundColor: ['#93C6E0', '#5DA9D4', '#378DC8', '#176FB5'],
            borderColor: ['#176FB5', '#176FB5', '#176FB5', '#176FB5'],
            borderWidth: 1
          }
        ]
      },
      options: {
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
            text: 'Clients Acquired',
            font: {
              size: 24,
              weight: 'bold'
            },
            color: '#176FB5'
          }
        }
      }
    })

    return () => {
      chart1.destroy()
      chart2.destroy()
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
              <Span className='big'>Units Sold</Span>
              <Span className='small'>{data.unitsSold}</Span>
            </DataHalf>
            <DataHalf>
              <Span className='big'>Performance</Span>
              <Span className='small'>{data.performanceVsTeamAverage}</Span>
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
              <ChartContainer>
                <canvas id='chart1'></canvas>
                <canvas id='chart2'></canvas>
              </ChartContainer>
            </DataHalf>
            <DataHalf>
              <Span className='big'>New Clients</Span>
              <Span className='small'>{data.newClientsAcquired}</Span>
            </DataHalf>
          </SideData>
        </Card>
      </Frame>
    </>
  )
}

export default UserDashboard
