import React, { useEffect, useState, useContext } from 'react'
import styled from 'styled-components'
import { RequestsContext } from 'src/providers/RequestsContext'
import { DashboardRepository } from 'src/repositories/DashboardRepository'
import { CompositeBarChartDark, HorizontalBarChartDark } from '../../components/Shared/dashboardApplets/charts'

const Frame = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
`

const Container = styled.div`
  width: 100%;
  height: 100%;
  padding: 10px;
  padding-right: 20px;
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
  margin-top: 10px;
`

const DashboardLayout = () => {
  const { getRequest } = useContext(RequestsContext)
  const [data, setData] = useState(null)

  useEffect(() => {
    getRequest({
      extension: DashboardRepository.dashboard
    }).then(res => {
      setData(res.record)
    })
  }, [])

  if (!data) return null

  const todayHoSales = data?.summaryFigures?.find(f => f.itemId === 12)?.amount ?? 0
  const todayRetailSales = data?.summaryFigures?.find(f => f.itemId === 13)?.amount ?? 0
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
        {retailValues.length > 0 && (
          <TopRow>
            <ChartCard>
              <SummaryCard>
                <Title>Retail Sales</Title>
                <strong> {todayRetailSales.toLocaleString()}</strong>
              </SummaryCard>
              <CompositeBarChartDark
                id='retailSalesChart'
                labels={retailLabels}
                data={retailValues}
                label='Retail Sales'
                ratio={5}
              />
            </ChartCard>
          </TopRow>
        )}
        <MiddleRow>
          <SummaryGrid>
            <SummaryItem>
              <RedCenter>Today's Sales</RedCenter>
              <strong>HO Sales: {todayHoSales.toLocaleString()}</strong>
              <strong>Retail Sales: {todayRetailSales.toLocaleString()}</strong>
              <strong>Total: {todaysSales.toLocaleString()}</strong>
            </SummaryItem>
            <SummaryItem>
              <RedCenter>Today's Sales</RedCenter>
              <strong>HO Sales: {globalHoSales.toLocaleString()}</strong>
              <strong>Retail Sales: {globalRetailSales.toLocaleString()}</strong>
              <strong>Total: {globalSales.toLocaleString()}</strong>
            </SummaryItem>
            <SummaryItem>
              <RedCenter>Misc Data</RedCenter>
              <strong>Open SO: {openSo.toLocaleString()}</strong>
              <strong>Return Sales: {returnSales.toLocaleString()}</strong>
            </SummaryItem>
            <SummaryItem>
              <RedCenter>General Revenues</RedCenter>
              <strong>Revenues: {revenues.toLocaleString()}</strong>
              <strong>Profit: {profit.toLocaleString()}</strong>
            </SummaryItem>
            <SummaryItem>
              <RedCenter>New Customers: {newCustomers.toLocaleString()}</RedCenter>
            </SummaryItem>
          </SummaryGrid>
          {weeklyValues.length > 0 && (
            <ChartCard>
              <SummaryCard>
                <Title>Average Weekly Sales</Title>
                <strong>{averageWeekly.toLocaleString()}</strong>
              </SummaryCard>
              <CompositeBarChartDark
                id='weeklySalesChart'
                labels={weeklyLabels}
                data={weeklyValues}
                label='Weekly Sales'
              />
            </ChartCard>
          )}
          {monthlyValues.length > 0 && (
            <ChartCard>
              <SummaryCard>
                <Title>Average Monthly Sales</Title>
                <strong>{averageMonthly.toLocaleString()}</strong>
              </SummaryCard>
              <CompositeBarChartDark
                id='monthlySalesChart'
                labels={monthlyLabels}
                data={monthlyValues}
                label='Monthly Sales'
              />
            </ChartCard>
          )}
          {revenuesValues.length > 0 && (
            <ChartCard>
              <SummaryCard>
                <Title>Accumulated Revenues</Title>
              </SummaryCard>
              <CompositeBarChartDark
                id='accumulatedRevenuesChart'
                labels={revenuesLabels}
                data={revenuesValues}
                label='Monthly Sales'
                color='#ff6c02'
                hoverColor='#fec106'
              />
            </ChartCard>
          )}
          {receivablesValues.length > 0 && (
            <ChartCard>
              <SummaryCard>
                <Title>Receivables</Title>
              </SummaryCard>
              <HorizontalBarChartDark
                id='Receivables'
                labels={receivablesLabels}
                data={receivablesValues}
                label='Receivables'
                color='#6e87b6'
                hoverColor='#818181'
              />
            </ChartCard>
          )}
          {topCustomersValues.length > 0 && (
            <ChartCard>
              <SummaryCard>
                <Title>Top Customers</Title>
              </SummaryCard>
              <HorizontalBarChartDark
                id='TopCustomers'
                labels={topCustomersLabels}
                data={topCustomersValues}
                label='TopCustomers'
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
