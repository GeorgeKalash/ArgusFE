import React, { useEffect, useState, useContext } from 'react'
import styled from 'styled-components'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import {
  CompositeBarChartDark,
  HorizontalBarChartDark,
  MixedBarChart,
  MixedColorsBarChartDark,
  LineChart
} from '../../components/Shared/dashboardApplets/charts'
import { getStorageData } from 'src/storage/storage'
import { DashboardRepository } from 'src/repositories/DashboardRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import useResourceParams from 'src/hooks/useResourceParams'
import { debounce } from 'lodash'
import { SummaryFiguresItem } from 'src/resources/DashboardFigures'
import Table from 'src/components/Shared/Table'
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'
import { Box } from '@mui/material'

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
  margin-right: 10px;
`

const ChartCard = styled.div`
  background: rgb(255, 255, 255);
  border-radius: 10px;
  display: flex;
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
      extension: SystemRepository.DynamicDashboard.qry,
      parameters: `_userId=${_userId}`
    })
      .then(result => {
        setApplets(result.list)

        return getRequest({
          extension: DashboardRepository.dashboard
        })
      })
      .then(res => {
        return getRequest({
          extension: DashboardRepository.SalesPersonDashboard.spDB,
          parameters: ``
        }).then(resSP => {
          return getRequest({
            extension: DocumentReleaseRepository.Approvals.qry3,
            parameters: ``
          }).then(resDR => {
            setData({ dashboard: { ...res?.record }, sp: { ...resSP?.record }, authorization: { ...resDR } })
            debouncedCloseLoading()
          })
        })
      })
  }, [])

  if (loading) {
    return <LoadingOverlay />
  }

  const containsApplet = appletId => {
    if (!Array.isArray(applets)) return false

    return applets.some(applet => applet.appletId === appletId)
  }

  return (
    <Frame>
      <Container>
        {containsApplet(ResourceIds.TodayRetailOrders) && (
          <TopRow>
            <ChartCard>
              <SummaryCard>
                <Title>{labels.retailSales}</Title>
                <strong>
                  {(
                    data?.dashboard?.summaryFigures?.find(
                      f => f.itemId === SummaryFiguresItem.TODAYS_TOTAL_RETAIL_SALES
                    )?.amount ?? 0
                  ).toLocaleString()}
                </strong>
              </SummaryCard>
              <CompositeBarChartDark
                id='retailSalesChart'
                labels={data?.dashboard?.todaysRetailSales?.map(ws => ws.posRef) || []}
                data={data?.dashboard?.todaysRetailSales?.map(ws => ws.sales) || []}
                label={labels.retailSales}
                ratio={5}
              />
            </ChartCard>
          </TopRow>
        )}
        {containsApplet(ResourceIds.MyYearlySalesPerformance) && (
          <TopRow>
            <ChartCard>
              <SummaryCard>
                <Title>{labels.myYearlySalesPerformance}</Title>
              </SummaryCard>
              <MixedBarChart
                id='myYearlySalesPerformance'
                labels={data?.sp?.myYearlySalesPerformanceList?.map(ws => ws.year) || []}
                data1={data?.sp?.myYearlySalesPerformanceList?.map(ws => ws.sales) || []}
                data2={data?.sp?.myYearlySalesPerformanceList?.map(ws => ws.target) || []}
                label1='sales'
                label2='target'
                ratio={5}
              />
            </ChartCard>
          </TopRow>
        )}
        {containsApplet(ResourceIds.MyMonthlySalesPerformance) && (
          <TopRow>
            <ChartCard>
              <SummaryCard>
                <Title>{labels.myMonthlySalesPerformance}</Title>
              </SummaryCard>
              <MixedBarChart
                id='myMonthlySalesPerformance'
                labels={data?.sp?.myMonthlySalesPerformanceList?.map(ws => ws.monthName) || []}
                data1={data?.sp?.myMonthlySalesPerformanceList?.map(ws => ws.sales) || []}
                data2={data?.sp?.myMonthlySalesPerformanceList?.map(ws => ws.target) || []}
                label1='sales'
                label2='target'
                ratio={5}
              />
            </ChartCard>
          </TopRow>
        )}
        <MiddleRow>
          {containsApplet(ResourceIds.MyYearlyUnitsSoldList) && (
            <ChartCard>
              <SummaryCard>
                <Title>{labels.myYearlyUnitsSoldList}</Title>
              </SummaryCard>
              <MixedColorsBarChartDark
                id='myYearlyUnitsSoldChart'
                labels={data?.sp?.myYearlyUnitsSoldList?.map(ws => ws.year) || []}
                data={data?.sp?.myYearlyUnitsSoldList?.map(ws => ws.qty) || []}
                label={labels.qty}
              />
            </ChartCard>
          )}
          {containsApplet(ResourceIds.MyYearlyGrowthInUnitsSoldList) && (
            <ChartCard>
              <SummaryCard>
                <Title>{labels.myYearlyGrowthInUnitsSoldList}</Title>
              </SummaryCard>
              <MixedColorsBarChartDark
                id='myYearlyGrowthUnitsSoldChart'
                labels={data?.sp?.myYearlyGrowthInUnitsSoldList?.map(ws => ws.year) || []}
                data={data?.sp?.myYearlyGrowthInUnitsSoldList?.map(ws => ws.qty) || []}
                label={labels.qty}
              />
            </ChartCard>
          )}
          {containsApplet(ResourceIds.MyYearlyClientsAcquiredList) && (
            <ChartCard>
              <SummaryCard>
                <Title>{labels.myYearlyClientsAcquiredList}</Title>
              </SummaryCard>
              <MixedColorsBarChartDark
                id='myYearlyClientsAcquiredList'
                labels={data?.sp?.myYearlyClientsAcquiredList?.map(ws => ws.year) || []}
                data={data?.sp?.myYearlyClientsAcquiredList?.map(ws => ws.qty) || []}
                label={labels.qty}
              />
            </ChartCard>
          )}
          {containsApplet(ResourceIds.MyYearlyGrowthInClientsAcquiredList) && (
            <ChartCard>
              <SummaryCard>
                <Title>{labels.myYearlyGrowthInClientsAc}</Title>
              </SummaryCard>
              <MixedColorsBarChartDark
                id='myYearlyGrowthInClientsAcquiredList'
                labels={data?.sp?.myYearlyGrowthInClientsAcquiredList?.map(ws => ws.year) || []}
                data={data?.sp?.myYearlyGrowthInClientsAcquiredList?.map(ws => ws.qty) || []}
                label={labels.qty}
              />
            </ChartCard>
          )}
        </MiddleRow>
        {containsApplet(ResourceIds.TodayPlantSales) && (
          <TopRow>
            <ChartCard>
              <SummaryCard>
                <Title>{labels.todayPlantSales}</Title>
                <strong>
                  {(
                    data?.dashboard?.todaysCreditSales?.map(tcs => tcs.sales).reduce((acc, val) => acc + val, 0) || 0
                  ).toLocaleString()}
                </strong>
              </SummaryCard>
              <CompositeBarChartDark
                id='todayPlantSales'
                labels={data?.dashboard?.todaysCreditSales?.map(ws => ws.plantRef) || []}
                data={data?.dashboard?.todaysCreditSales?.map(ws => ws.sales) || []}
                label={labels.todayPlantSales}
                ratio={5}
              />
            </ChartCard>
          </TopRow>
        )}
        <MiddleRow>
          {(containsApplet(ResourceIds.NewCustomers) || containsApplet(ResourceIds.GlobalSalesYTD)) && (
            <SummaryGrid>
              {containsApplet(ResourceIds.GlobalSalesYTD) && (
                <>
                  {[
                    {
                      title: labels.todaysSale,
                      rows: [
                        {
                          label: labels.hoSalesOrders,
                          value:
                            data?.dashboard?.summaryFigures?.find(
                              f => f.itemId === SummaryFiguresItem.TODAYS_TOTAL_SALES_ORDERS
                            )?.amount ?? 0
                        },
                        {
                          label: labels.retailSales,
                          value:
                            data?.dashboard?.summaryFigures?.find(
                              f => f.itemId === SummaryFiguresItem.TODAYS_TOTAL_SALES_ORDERS
                            )?.amount ?? 0
                        },
                        {
                          label: labels.total,
                          value:
                            (data?.dashboard?.summaryFigures?.find(
                              f => f.itemId === SummaryFiguresItem.TODAYS_TOTAL_SALES_ORDERS
                            )?.amount ?? 0) +
                            (data?.dashboard?.summaryFigures?.find(
                              f => f.itemId === SummaryFiguresItem.TODAYS_TOTAL_SALES_ORDERS
                            )?.amount ?? 0)
                        }
                      ]
                    },
                    {
                      title: labels.globalSales,
                      rows: [
                        {
                          label: labels.hoSales,
                          value:
                            data?.dashboard?.summaryFigures?.find(f => f.itemId === SummaryFiguresItem.CREDIT_SALES_YTD)
                              ?.amount ?? 0
                        },
                        {
                          label: labels.retailSales,
                          value:
                            data?.dashboard?.summaryFigures?.find(f => f.itemId === SummaryFiguresItem.RETAIL_SALES_YTD)
                              ?.amount ?? 0
                        },
                        {
                          label: labels.total,
                          value:
                            (data?.dashboard?.summaryFigures?.find(
                              f => f.itemId === SummaryFiguresItem.CREDIT_SALES_YTD
                            )?.amount ?? 0) +
                            (data?.dashboard?.summaryFigures?.find(
                              f => f.itemId === SummaryFiguresItem.RETAIL_SALES_YTD
                            )?.amount ?? 0)
                        }
                      ]
                    },
                    {
                      title: labels.miscData,
                      rows: [
                        {
                          label: labels.openSo,
                          value:
                            data?.dashboard?.summaryFigures?.find(
                              f => f.itemId === SummaryFiguresItem.OPEN_SALES_ORDERS
                            )?.amount ?? 0
                        },
                        {
                          label: labels.returnSales,
                          value:
                            data?.dashboard?.summaryFigures?.find(
                              f => f.itemId === SummaryFiguresItem.CREDIT_SALES_RETURNS_YTD
                            )?.amount ?? 0
                        }
                      ]
                    },
                    {
                      title: labels.generalRevenue,
                      rows: [
                        {
                          label: labels.revenues,
                          value:
                            data?.dashboard?.summaryFigures?.find(f => f.itemId === SummaryFiguresItem.SALES_YTD)
                              ?.amount ?? 0
                        },
                        {
                          label: labels.profit,
                          value:
                            data?.dashboard?.summaryFigures?.find(f => f.itemId === SummaryFiguresItem.PROFIT_YTD)
                              ?.amount ?? 0
                        }
                      ]
                    }
                  ].map((summary, index) => (
                    <SummaryItem key={index}>
                      <RedCenter>{summary.title}</RedCenter>
                      <InnerGrid>
                        {summary.rows.map((row, idx) => (
                          <React.Fragment key={idx}>
                            <Label>{row.label}:</Label>
                            <Value>{row.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Value>
                          </React.Fragment>
                        ))}
                      </InnerGrid>
                    </SummaryItem>
                  ))}
                </>
              )}
              {containsApplet(ResourceIds.NewCustomers) && (
                <SummaryItem style={{ gridColumn: '1 / 3' }}>
                  <RedCenter>
                    {labels.newCostumers}:{' '}
                    {(
                      data?.dashboard?.summaryFigures?.find(f => f.itemId === SummaryFiguresItem.NEW_CUSTOMERS_YTD)
                        ?.amount ?? 0
                    ).toLocaleString()}
                  </RedCenter>
                </SummaryItem>
              )}
            </SummaryGrid>
          )}
          {containsApplet(ResourceIds.WeeklySalesYTD) && (
            <ChartCard>
              <SummaryCard>
                <Title>{labels.avWeeklySales}</Title>
                <strong>
                  {(
                    (data?.dashboard?.weeklySales?.map(ws => ws.sales).reduce((acc, val) => acc + val, 0) || 0) /
                    (data?.dashboard?.weeklySales?.length || 1)
                  ).toLocaleString()}
                </strong>
              </SummaryCard>
              <CompositeBarChartDark
                id='weeklySalesChart'
                labels={data?.dashboard?.weeklySales?.map(ws => ws.weekName) || []}
                data={data?.dashboard?.weeklySales?.map(ws => ws.sales) || []}
                label={labels.weeklySales}
              />
            </ChartCard>
          )}
          {containsApplet(ResourceIds.MonthlySalesYTD) && (
            <ChartCard>
              <SummaryCard>
                <Title>{labels.avMonthlySales}</Title>
                <strong>
                  {(
                    (data?.dashboard?.monthlySales?.map(ms => ms.sales).reduce((acc, val) => acc + val, 0) || 0) /
                    (data?.dashboard?.monthlySales?.length || 1)
                  ).toLocaleString()}
                </strong>
              </SummaryCard>
              <CompositeBarChartDark
                id='monthlySalesChart'
                labels={data?.dashboard?.monthlySales?.map(ms => `${ms.year}/${ms.month}`) || []}
                data={data?.dashboard?.monthlySales?.map(ms => ms.sales) || []}
                label={labels.monthlySales}
              />
            </ChartCard>
          )}
          {containsApplet(ResourceIds.AccumulatedRevenuesYTD) && (
            <ChartCard>
              <SummaryCard>
                <Title>{labels.accRevenues}</Title>
              </SummaryCard>
              <CompositeBarChartDark
                id='accumulatedRevenuesChart'
                labels={data?.dashboard?.accumulatedMonthlySales?.map(ams => ams.monthName) || []}
                data={data?.dashboard?.accumulatedMonthlySales?.map(ams => ams.sales) || []}
                label={labels.accRevenues}
                color='#ff6c02'
                hoverColor='#fec106'
              />
            </ChartCard>
          )}
          {containsApplet(ResourceIds.Receivables) && (
            <ChartCard>
              <SummaryCard>
                <Title>{labels.receivables}</Title>
              </SummaryCard>
              <HorizontalBarChartDark
                id='Receivables'
                labels={Object.keys(data?.dashboard?.receivables || {})}
                data={Object.values(data?.dashboard?.receivables || {}).map(value =>
                  typeof value === 'number' ? Math.ceil(value) : 0
                )}
                label={labels.receivables}
                color='#6e87b6'
                hoverColor='#818181'
              />
            </ChartCard>
          )}
          {containsApplet(ResourceIds.TopCustomers) && (
            <ChartCard>
              <SummaryCard>
                <Title>{labels.topCostumers}</Title>
              </SummaryCard>
              <HorizontalBarChartDark
                id='TopCustomers'
                labels={data?.dashboard?.topCustomers?.map(c => c.clientName) || []}
                data={data?.dashboard?.topCustomers?.map(c => c.amount) || []}
                label={labels.revenue}
                color='#d5b552'
                hoverColor='#818181'
              />
            </ChartCard>
          )}
          {containsApplet(ResourceIds.AverageRevenuePerItem) && (
            <ChartCard>
              <SummaryCard>
                <Title>{labels.averageRevenuePerItem}</Title>
              </SummaryCard>
              <LineChart
                id='AverageRevenuePerItem'
                labels={data?.dashboard?.avgUnitSales?.map(c => c.itemName) || []}
                data={data?.dashboard?.avgUnitSales?.map(c => c.avgPrice) || []}
                label={labels.averageRevenue}
              />
            </ChartCard>
          )}
          {containsApplet(ResourceIds.PendingAuthorizationRequests) && (
            <ChartCard>
              <SummaryCard>
                <Title>{labels.authorization}</Title>
              </SummaryCard>
              <Box style={{ height: '350px', display: 'flex' }}>
                <Table
                  columns={[
                    {
                      field: 'reference',
                      headerName: labels.reference,
                      flex: 1
                    },
                    {
                      field: 'functionName',
                      headerName: labels.functionName,
                      flex: 1
                    },
                    {
                      field: 'thirdParty',
                      headerName: labels.thirdParty,
                      flex: 1
                    }
                  ]}
                  gridData={data?.authorization}
                  rowId={['recordId']}
                  pagination={false}
                />
              </Box>
            </ChartCard>
          )}
        </MiddleRow>
      </Container>
    </Frame>
  )
}

export default DashboardLayout
