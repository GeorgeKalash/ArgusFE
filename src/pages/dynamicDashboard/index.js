import React, { useEffect, useState, useContext } from 'react'
import styled, { keyframes } from 'styled-components'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { CompositeBarChartDark, HorizontalBarChartDark } from '../../components/Shared/dashboardApplets/charts'
import { getStorageData } from 'src/storage/storage'
import { DashboardRepository } from 'src/repositories/DashboardRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import useResourceParams from 'src/hooks/useResourceParams'
import { debounce } from 'lodash'

const Frame = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
`

const Container = styled.div`
  width: 100%;
  height: 100%;
  padding: 10px;
  background: rgb(204, 204, 204);
  display: flex;
  flex-direction: column;
`

const TopRow = styled.div`
  display: grid;
  margin-bottom: 10px;
`

const SummaryCard = styled.div`
  background: rgb(255, 255, 255);
  border-radius: 10px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
  text-align: center;
  color: #000;
  font-size: 16px;
`

const SummaryItem = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  strong {
    font-size: 18px;
    margin-top: 5px;
  }
`

const MiddleRow = styled.div`
  display: grid;
  grid-template-columns: 50% 50%;
  gap: 10px;
  margin-bottom: 10px;
`

const ChartCard = styled.div`
  background: rgb(255, 255, 255);
  border-radius: 10px;
  padding: 10px;
  flex-direction: column;
`

const Title = styled.h2`
  margin-bottom: 10px;
  text-align: center;
`

const RedCenter = styled.div`
  text-align: center;
  color: red;
  font-size: 18px;
  margin-bottom: 5px;
`

const InnerGrid = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  gap: 5px 20px;
  align-items: center;
  text-align: left;
`

const Label = styled.div`
  justify-self: start;
  color: #000;
  font-size: 16px;
`

const Value = styled.div`
  justify-self: end;
  color: #000;
  font-size: 16px;
`

const DashboardLayout = () => {
  const { getRequest, LoadingOverlay } = useContext(RequestsContext)
  const [data, setData] = useState(null)
  const [applets, setApplets] = useState(null)
  const [loading, setLoading] = useState(true)
  const userData = getStorageData('userData')
  const _userId = userData.userId

  const debouncedCloseLoading = debounce(() => {
    setLoading(false)
  }, 500)

  const { labels } = useResourceParams({
    datasetId: ResourceIds.UserDashboard
  })

  useEffect(() => {
    getRequest({
      extension: SystemRepository.DynamicDashboard,
      parameters: `_userId=${_userId}`
    })
      .then(result => {
        setApplets(result.list)

        return getRequest({
          extension: DashboardRepository.dashboard
        })
      })
      .then(res => {
        setData(res.record)
        debouncedCloseLoading()
      })
  }, [])

  if (loading) {
    return <LoadingOverlay />
  }

  const containsApplet = appletId => {
    if (!Array.isArray(applets)) return false

    return applets.some(applet => applet.appletId === appletId)
  }

  const todayRetailSales = data?.summaryFigures?.find(f => f.itemId === 13)?.amount ?? 0
  const todayHoSales = data?.summaryFigures?.find(f => f.itemId === 14)?.amount ?? 0
  const todaysSales = todayHoSales + todayRetailSales

  const globalHoSales = data?.summaryFigures?.find(f => f.itemId === 16)?.amount ?? 0
  const globalRetailSales = data?.summaryFigures?.find(f => f.itemId === 15)?.amount ?? 0
  const globalSales = globalHoSales + globalRetailSales

  const openSo = data?.summaryFigures?.find(f => f.itemId === 18)?.amount ?? 0
  const returnSales = data?.summaryFigures?.find(f => f.itemId === 17)?.amount ?? 0

  const revenues = data?.summaryFigures?.find(f => f.itemId === 2)?.amount ?? 0
  const profit = data?.summaryFigures?.find(f => f.itemId === 3)?.amount ?? 0

  const newCustomers = data?.summaryFigures?.find(f => f.itemId === 1)?.amount ?? 0

  const retailLabels = data?.todaysRetailSales?.map(ws => ws.posRef) || []
  const retailValues = data?.todaysRetailSales?.map(ws => ws.sales) || []

  const weeklyLabels = data?.weeklySales?.map(ws => ws.weekName) || []
  const weeklyValues = data?.weeklySales?.map(ws => ws.sales) || []

  const averageWeekly =
    weeklyValues.length > 0 ? weeklyValues.reduce((acc, val) => acc + val, 0) / weeklyValues.length : 0

  const monthlyLabels = data?.monthlySales?.map(ms => `${ms.year}/${ms.month}`) || []
  const monthlyValues = data?.monthlySales?.map(ms => ms.sales) || []

  const averageMonthly =
    monthlyValues.length > 0 ? monthlyValues.reduce((acc, val) => acc + val, 0) / monthlyValues.length : 0

  const revenuesLabels = data?.accumulatedMonthlySales?.map(ms => ms.monthName) || []
  const revenuesValues = data?.accumulatedMonthlySales?.map(ms => ms.sales) || []

  const receivablesLabels = Object.keys(data?.receivables || {})
  const receivablesValues = Object.values(data?.receivables || {})

  const topCustomersLabels = data?.topCustomers?.map(c => c.clientName) || []
  const topCustomersValues = data?.topCustomers?.map(c => c.amount) || []

  return (
    <Frame>
      <Container>
        {containsApplet(60110) && (
          <TopRow>
            <ChartCard>
              <SummaryCard>
                <Title>{labels.retailSales}</Title>
                <strong>{todayRetailSales.toLocaleString()}</strong>
              </SummaryCard>
              <CompositeBarChartDark
                id='retailSalesChart'
                labels={retailLabels}
                data={retailValues}
                label={labels.retailSales}
                ratio={5}
              />
            </ChartCard>
          </TopRow>
        )}
        <MiddleRow>
          {(containsApplet(60106) || containsApplet(60112)) && (
            <SummaryGrid>
              {containsApplet(60112) && (
                <>
                  <SummaryItem>
                    <RedCenter>{labels.todaysSale}</RedCenter>
                    <InnerGrid>
                      <Label>{labels.hoSalesOrders}:</Label>
                      <Value>{todayHoSales.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Value>
                      <Label>{labels.retailSales}:</Label>
                      <Value>{todayRetailSales.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Value>
                      <Label>{labels.total}:</Label>
                      <Value>{todaysSales.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Value>
                    </InnerGrid>
                  </SummaryItem>
                  <SummaryItem>
                    <RedCenter>{labels.globalSales}</RedCenter>
                    <InnerGrid>
                      <Label>{labels.hoSales}:</Label>
                      <Value>{globalHoSales.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Value>
                      <Label>{labels.retailSales}:</Label>
                      <Value>{globalRetailSales.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Value>
                      <Label>{labels.total}:</Label>
                      <Value>{globalSales.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Value>
                    </InnerGrid>
                  </SummaryItem>
                  <SummaryItem>
                    <RedCenter>{labels.miscData}</RedCenter>
                    <InnerGrid>
                      <Label>{labels.openSo}:</Label>
                      <Value>{openSo.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Value>
                      <Label>{labels.returnSales}:</Label>
                      <Value>{returnSales.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Value>
                    </InnerGrid>
                  </SummaryItem>
                  <SummaryItem>
                    <RedCenter>{labels.generalRevenue}</RedCenter>
                    <InnerGrid>
                      <Label>{labels.revenues}:</Label>
                      <Value>{revenues.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Value>
                      <Label>{labels.profit}:</Label>
                      <Value>{profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Value>
                    </InnerGrid>
                  </SummaryItem>
                </>
              )}
              {containsApplet(60106) && (
                <SummaryItem style={{ gridColumn: '1 / 3' }}>
                  <RedCenter>
                    {labels.newCostumers}: {newCustomers.toLocaleString()}
                  </RedCenter>
                </SummaryItem>
              )}
            </SummaryGrid>
          )}
          {containsApplet(60100) && (
            <ChartCard>
              <SummaryCard>
                <Title>{labels.avWeeklySales}</Title>
                <strong>{averageWeekly.toLocaleString()}</strong>
              </SummaryCard>
              <CompositeBarChartDark
                id='weeklySalesChart'
                labels={weeklyLabels}
                data={weeklyValues}
                label={labels.weeklySales}
              />
            </ChartCard>
          )}
          {containsApplet(60101) && (
            <ChartCard>
              <SummaryCard>
                <Title>{labels.avMonthlySales}</Title>
                <strong>{averageMonthly.toLocaleString()}</strong>
              </SummaryCard>
              <CompositeBarChartDark
                id='monthlySalesChart'
                labels={monthlyLabels}
                data={monthlyValues}
                label={labels.monthlySales}
              />
            </ChartCard>
          )}
          {containsApplet(60103) && (
            <ChartCard>
              <SummaryCard>
                <Title>{labels.accRevenues}</Title>
              </SummaryCard>
              <CompositeBarChartDark
                id='accumulatedRevenuesChart'
                labels={revenuesLabels}
                data={revenuesValues}
                label={labels.accRevenues}
                color='#ff6c02'
                hoverColor='#fec106'
              />
            </ChartCard>
          )}
          {containsApplet(60109) && (
            <ChartCard>
              <SummaryCard>
                <Title>{labels.receivables}</Title>
              </SummaryCard>
              <HorizontalBarChartDark
                id='Receivables'
                labels={receivablesLabels}
                data={receivablesValues}
                label={labels.receivables}
                color='#6e87b6'
                hoverColor='#818181'
              />
            </ChartCard>
          )}
          {containsApplet(60102) && (
            <ChartCard>
              <SummaryCard>
                <Title>{labels.topCostumers}</Title>
              </SummaryCard>
              <HorizontalBarChartDark
                id='TopCustomers'
                labels={topCustomersLabels}
                data={topCustomersValues}
                label={labels.topCostumers}
                color='#d5b552'
                hoverColor='#818181'
              />
            </ChartCard>
          )}
        </MiddleRow>
      </Container>
    </Frame>
  )
}

export default DashboardLayout
