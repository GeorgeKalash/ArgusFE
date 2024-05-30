import { useEffect, useState, useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { DashboardRepository } from 'src/repositories/DashboardRepository'
import styled, { createGlobalStyle } from 'styled-components'
import { CircularData } from '../../components/Shared/dashboardApplets/circularData'
import { CompositeBarChart, LineChart } from '../../components/Shared/dashboardApplets/charts'
import ProgressBarComponent from '../../components/Shared/dashboardApplets/ProgressBar'

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
  flex: 1;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
`

const Card = styled.div`
  width: 100%;
  padding: 30px;
  background: #383838;
  height: 100% !important;
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
  height: 100%;
  padding: 20px;
  background: #231f20;
  border-radius: 15px;
  margin: 0 10px;
  overflow-y: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
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
  flex: 0;
  margin: 10px 0;
`

const CompositeBarContainer = styled.div`
  flex: 1;
  display: flex;
  padding: 10px;
  canvas {
    width: 100% !important;
    height: 250px !important;
  }
`

const ProgressBarsWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between !important;
  align-items: center;
`

const ProfileAvatar = ({ imageUrl }) => (
  <Avatar>
    <div className='circle'></div>
    <div className='circle'></div>
    <div className='pic' style={{ backgroundImage: `url(${imageUrl})` }}></div>
  </Avatar>
)

const Home = () => {
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
    distanceToNextCommissionLeg: 0,
    commissionAcquired: 0,
    name: '',
    teamRace: []
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
          distanceToNextCommissionLeg: res.distanceToNextCommissionLeg || 0,
          commissionAcquired: res.commissionAcquired || 0,
          name: res.record.salesPerson.name || '',
          teamRace: res.record.teamRace || []
        })
      })
      .catch(error => {
        setErrorMessage(error.message)
      })
  }

  const list1 = [
    { name: 'Units Sold', key: 'unitsSold' },
    { name: 'New Clients Acquired', key: 'newClientsAcquired' },
    { name: 'Percentage To Target', key: 'pctToTarget', isPercentage: true }
  ]

  const list2 = [
    { name: 'distance To Next Commission', key: 'distanceToNextCommissionLeg' },
    { name: 'commission Acquired', key: 'commissionAcquired' }
  ]

  return (
    <>
      <GlobalStyle />
      <Frame>
        <Card>
          <SideData>
            <DataHalf>
              <CircularData data={data} list={list1} />
            </DataHalf>
            <DataHalf>
              <CircularData data={data} list={list2} />
            </DataHalf>
            <DataHalf>
              <CompositeBarContainer>
                <LineChart
                  id='lineChart'
                  labels={data.teamRace.map(item => item.spRef)}
                  data={data.teamRace.map(item => item.commission)}
                  label='Team Commissions'
                />
              </CompositeBarContainer>
            </DataHalf>
          </SideData>
          <Profile>
            <ProfileAvatar imageUrl={data.imageUrl} />
            <Span className='big'>{data.name}</Span>
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
            </DataHalf>
            <DataHalf>
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

export default Home
