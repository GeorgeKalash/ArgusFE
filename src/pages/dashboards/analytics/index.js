// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import CardStatisticsVerticalComponent from 'src/@core/components/card-statistics/card-stats-vertical'

// ** Styled Component Import
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'

// ** Demo Components Imports
import AnalyticsTable from 'src/views/dashboards/analytics/AnalyticsTable'
import AnalyticsTrophy from 'src/views/dashboards/analytics/AnalyticsTrophy'
import AnalyticsSessions from 'src/views/dashboards/analytics/AnalyticsSessions'
import AnalyticsTotalProfit from 'src/views/dashboards/analytics/AnalyticsTotalProfit'
import AnalyticsPerformance from 'src/views/dashboards/analytics/AnalyticsPerformance'
import AnalyticsTotalEarning from 'src/views/dashboards/analytics/AnalyticsTotalEarning'
import AnalyticsWeeklyOverview from 'src/views/dashboards/analytics/AnalyticsWeeklyOverview'
import AnalyticsDepositWithdraw from 'src/views/dashboards/analytics/AnalyticsDepositWithdraw'
import AnalyticsSalesByCountries from 'src/views/dashboards/analytics/AnalyticsSalesByCountries'
import AnalyticsTransactionsCard from 'src/views/dashboards/analytics/AnalyticsTransactionsCard'

import { useEffect, useContext } from 'react'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { RequestsContext } from 'src/providers/RequestsContext'

const AnalyticsDashboard = () => {

  let { getRequest } = useContext(RequestsContext)

  const getTest = async () => {
    var parameters = '_recordId=' + '105'
    getRequest({
      'extension': ManufacturingRepository.getLBR,
      'parameters': parameters,
    })
      .then((getLBRRes) => {
        console.log({ getLBRRes })
      })
      .catch((error) => {
        console.log({ error })
      })
  }

  useEffect(() => {
    getTest()
  }, [])

  return (
    <ApexChartWrapper>
      <Grid container spacing={6}>
        <Grid item xs={12} md={4}>
          <AnalyticsTrophy />
        </Grid>
        <Grid item xs={12} md={8}>
          <AnalyticsTransactionsCard />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <AnalyticsWeeklyOverview />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <AnalyticsTotalEarning />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Grid container spacing={6}>
            <Grid item xs={6}>
              <AnalyticsTotalProfit />
            </Grid>
            <Grid item xs={6}>
              <CardStatisticsVerticalComponent
                stats='$25.6k'
                icon={<Icon icon='mdi:poll' />}
                color='secondary'
                trendNumber='+42%'
                title='Total Profit'
                subtitle='Weekly Profit'
              />
            </Grid>
            <Grid item xs={6}>
              <CardStatisticsVerticalComponent
                stats='862'
                trend='negative'
                trendNumber='-18%'
                title='New Project'
                subtitle='Yearly Project'
                icon={<Icon icon='mdi:briefcase-variant-outline' />}
              />
            </Grid>
            <Grid item xs={6}>
              <AnalyticsSessions />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <AnalyticsPerformance />
        </Grid>
        <Grid item xs={12} md={8}>
          <AnalyticsDepositWithdraw />
        </Grid>
        <Grid item xs={12} md={4}>
          <AnalyticsSalesByCountries />
        </Grid>
        <Grid item xs={12} md={12} lg={8}>
          <AnalyticsTable />
        </Grid>
      </Grid>
    </ApexChartWrapper>
  )
}

export default AnalyticsDashboard
