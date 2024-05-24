import { useEffect, useState, useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { DashboardRepository } from 'src/repositories/DashboardRepository'
import styled, { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
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
    background: linear-gradient(to bottom left, #2d6120, #bee6b4);
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
  padding: 40px;
  background: white;
  box-shadow: 4px 8px 16px 0 #1b3b14;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Profile = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 0;
`

const Avatar = styled.div`
  position: relative;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  cursor: pointer;
  background: #bee6b4;
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
    border-color: #2d6120 #2d6120 #2d6120 transparent;
  }

  .circle:nth-child(2) {
    left: -12px;
    top: -12px;
    width: 328px;
    height: 328px;
    border-color: #2d6120 transparent #2d6120 #2d6120;
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
    background: radial-gradient(transparent, 90%, #2d6120);
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
  justify-content: center;
  padding: 20px;
  background: #bee6b4;
  border-radius: 10px;
  box-shadow: 2px 4px 8px 0 #1b3b14;
  margin: 0 20px;
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
            <Span className='big'>Units Sold</Span>
            <Span className='small'>{data.unitsSold}</Span>
          </SideData>
          <Profile>
            <Avatar>
              <div className='circle'></div>
              <div className='circle'></div>
              <div className='pic' style={{ backgroundImage: `url(${data.imageUrl})` }}></div>
            </Avatar>
          </Profile>
          <SideData className='right-data'>
            <Span className='big'>New Clients</Span>
            <Span className='small'>{data.newClientsAcquired}</Span>
          </SideData>
        </Card>
      </Frame>
    </>
  )
}

export default UserDashboard
