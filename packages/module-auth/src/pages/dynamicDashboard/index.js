import React, { useEffect, useState, useContext } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import {
  CompositeBarChartDark,
  HorizontalBarChartDark,
  MixedBarChart,
  MixedColorsBarChartDark,
  LineChart
} from '@argus/shared-ui/src/components/Shared/dashboardApplets/charts'
import { getStorageData } from '@argus/shared-domain/src/storage/storage'
import { DashboardRepository } from '@argus/repositories/src/repositories/DashboardRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import { debounce } from 'lodash'
import { SummaryFiguresItem } from '@argus/shared-domain/src/resources/DashboardFigures'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { Box } from '@mui/material'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { TimeAttendanceRepository } from '@argus/repositories/src/repositories/TimeAttendanceRepository'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { formatDateForGetApI } from '@argus/shared-domain/src/lib/date-helper'
import ApprovalsTable from '@argus/shared-ui/src/components/Shared/ApprovalsTable'

const DashboardLayout = () => {
  const { getRequest, LoadingOverlay } = useContext(RequestsContext)
  const [data, setData] = useState(null)
  const [applets, setApplets] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)
  const userData = getStorageData('userData')
  const _userId = userData.userId
  const _languageId = userData.languageId

  const getRequestRef = React.useRef(getRequest)
  useEffect(() => {
    getRequestRef.current = getRequest
  }, [getRequest])

  const debouncedCloseLoadingRef = React.useRef(null)
  if (!debouncedCloseLoadingRef.current) {
    debouncedCloseLoadingRef.current = debounce(() => {
      setLoading(false)
    }, 500)
  }

  useEffect(() => {
    return () => {
      if (debouncedCloseLoadingRef.current) debouncedCloseLoadingRef.current.cancel()
    }
  }, [])

  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.UserDashboard
  })

  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      try {
        setLoading(true)

        const appletsRes = await getRequestRef.current({
          extension: SystemRepository.DynamicDashboard.qry,
          parameters: `_userId=${_userId}`
        })

        if (cancelled) return
        setApplets(appletsRes.list)

        const [resDashboard, resSP, resTV, resTimeCode] = await Promise.all([
          getRequestRef.current({ extension: DashboardRepository.dashboard }),
          getRequestRef.current({ extension: DashboardRepository.SalesPersonDashboard.spDB }),
          getRequestRef.current({
            extension: TimeAttendanceRepository.TimeVariation.qry2,
            parameters: `_dayId=${formatDateForGetApI(new Date())}`
          }),
          getRequestRef.current({
            extension: SystemRepository.KeyValueStore,
            parameters: `_dataset=${DataSets.TIME_CODE}&_language=${_languageId}`
          })
        ])

        if (cancelled) return

        const availableTimeCodes = new Set((resTV.list || []).map(d => d.timeCode))

        const filteredTabs = (resTimeCode.list || [])
          .filter(t => availableTimeCodes.has(Number(t.key)))
          .map(t => ({
            label: t.value,
            timeCode: Number(t.key),
            disabled: false
          }))

        const groupedData = filteredTabs.reduce((acc, tab) => {
          acc[tab.timeCode] = { list: (resTV.list || []).filter(d => d.timeCode === tab.timeCode) }
          return acc
        }, {})

        setData({
          dashboard: resDashboard?.record,
          sp: resSP?.record,
          hr: {
            timeVariationDetails: resTV.list || [],
            tabs: filteredTabs,
            groupedData: groupedData
          }
        })

        if (debouncedCloseLoadingRef.current) debouncedCloseLoadingRef.current()
      } catch (e) {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [_userId, _languageId])

  if (loading) {
    return <LoadingOverlay />
  }

  const containsApplet = appletId => {
    if (!Array.isArray(applets)) return false
    return applets.some(applet => applet.appletId === appletId)
  }

  return (
    <>
    <div className='frame'>
      <div className='container'>
        {containsApplet(ResourceIds.TodayRetailOrders) && (
          <div className='topRow'>
            <div className='chartCard'>
              <div className='summaryCard'>
                <h2 className='title'>{labels.retailSales}</h2>
                <strong className='strong'>
                  {(
                    data?.dashboard?.summaryFigures?.find(
                      f => f.itemId === SummaryFiguresItem.TODAYS_TOTAL_RETAIL_SALES
                    )?.amount ?? 0
                  ).toLocaleString()}
                </strong>
              </div>
              <CompositeBarChartDark
                labels={data?.dashboard?.todaysRetailSales?.map(ws => ws.posRef) || []}
                data={data?.dashboard?.todaysRetailSales?.map(ws => ws.sales) || []}
                label={labels.retailSales}
              />
            </div>
          </div>
        )}
        {containsApplet(ResourceIds.MyYearlySalesPerformance) && (
          <div className='topRow'>
            <div className='chartCard'>
              <div className='summaryCard'>
                <h2 className='title'>{labels.myYearlySalesPerformance}</h2>
              </div>
              <MixedBarChart
                labels={data?.sp?.myYearlySalesPerformanceList?.map(ws => ws.year) || []}
                data1={data?.sp?.myYearlySalesPerformanceList?.map(ws => ws.sales) || []}
                data2={data?.sp?.myYearlySalesPerformanceList?.map(ws => ws.target) || []}
                label1={labels.sales}
                label2={labels.target}
              />
            </div>
          </div>
        )}
        {containsApplet(ResourceIds.MyMonthlySalesPerformance) && (
          <div className='topRow'>
            <div className='chartCard'>
              <div className='summaryCard'>
                <h2 className='title'>{labels.myMonthlySalesPerformance}</h2>
              </div>
              <MixedBarChart
                labels={data?.sp?.myMonthlySalesPerformanceList?.map(ws => ws.monthName) || []}
                data1={data?.sp?.myMonthlySalesPerformanceList?.map(ws => ws.sales) || []}
                data2={data?.sp?.myMonthlySalesPerformanceList?.map(ws => ws.target) || []}
                label1={labels.sales}
                label2={labels.target}
              />
            </div>
          </div>
        )}
        {containsApplet(ResourceIds.SalesTeamOrdersSummary) && (
          <div className='topRow'>
            <div className='chartCard'>
              <div className='summaryCard'>
                <h2 className='title'>{labels.salesTeamOrdersSummary}</h2>
              </div>
              <MixedBarChart
                labels={data?.dashboard?.salesTeamOrdersSummaries?.map(ws => ws.spRef) || []}
                data1={data?.dashboard?.salesTeamOrdersSummaries?.map(ws => ws.amount) || []}
                data2={data?.dashboard?.salesTeamOrdersSummaries?.map(ws => ws.orderCount) || []}
                label1={labels.amount}
                label2={labels.orderCount}
                hasLegend={true}
                rotation={-90}
              />
            </div>
          </div>
        )}
        <div className='middleRow'>
          {containsApplet(ResourceIds.MyYearlyUnitsSoldList) && (
            <div className='chartCard'>
              <div className='summaryCard'>
                <h2 className='title'>{labels.myYearlyUnitsSoldList}</h2>
              </div>
              <MixedColorsBarChartDark
                labels={data?.sp?.myYearlyUnitsSoldList?.map(ws => ws.year) || []}
                data={data?.sp?.myYearlyUnitsSoldList?.map(ws => ws.qty) || []}
                label={labels.qty}
              />
            </div>
          )}

          {containsApplet(ResourceIds.MyYearlyGrowthInUnitsSoldList) && (
            <div className='chartCard'>
              <div className='summaryCard'>
                <h2 className='title'>{labels.myYearlyGrowthInUnitsSoldList}</h2>
              </div>
              <MixedColorsBarChartDark
                labels={data?.sp?.myYearlyGrowthInUnitsSoldList?.map(ws => ws.year) || []}
                data={data?.sp?.myYearlyGrowthInUnitsSoldList?.map(ws => ws.qty) || []}
                label={labels.qty}
              />
            </div>
          )}

          {containsApplet(ResourceIds.MyYearlyClientsAcquiredList) && (
            <div className='chartCard'>
              <div className='summaryCard'>
                <h2 className='title'>{labels.myYearlyClientsAcquiredList}</h2>
              </div>
              <MixedColorsBarChartDark
                labels={data?.sp?.myYearlyClientsAcquiredList?.map(ws => ws.year) || []}
                data={data?.sp?.myYearlyClientsAcquiredList?.map(ws => ws.qty) || []}
                label={labels.qty}
              />
            </div>
          )}

          {containsApplet(ResourceIds.MyYearlyGrowthInClientsAcquiredList) && (
            <div className='chartCard'>
              <div className='summaryCard'>
                <h2 className='title'>{labels.myYearlyGrowthInClientsAc}</h2>
              </div>
              <MixedColorsBarChartDark
                labels={data?.sp?.myYearlyGrowthInClientsAcquiredList?.map(ws => ws.year) || []}
                data={data?.sp?.myYearlyGrowthInClientsAcquiredList?.map(ws => ws.qty) || []}
                label={labels.qty}
              />
            </div>
          )}
        </div>

        {containsApplet(ResourceIds.TodayPlantSales) && (
          <div className='topRow'>
            <div className='chartCard'>
              <div className='summaryCard'>
                <h2 className='title'>{labels.todayPlantSales}</h2>
                <strong className='strong'>
                  {(
                    data?.dashboard?.todaysCreditSales?.map(tcs => tcs.sales).reduce((acc, val) => acc + val, 0) || 0
                  ).toLocaleString()}
                </strong>
              </div>
              <CompositeBarChartDark
                labels={data?.dashboard?.todaysCreditSales?.map(ws => ws.plantRef) || []}
                data={data?.dashboard?.todaysCreditSales?.map(ws => ws.sales) || []}
                label={labels.todayPlantSales}
                ratio={5}
              />
            </div>
          </div>
        )}

        <div className='middleRow'>
          {(containsApplet(ResourceIds.NewCustomers) || containsApplet(ResourceIds.GlobalSalesYTD)) && (
            <div className='summaryGrid'>
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
                              f => f.itemId === SummaryFiguresItem.TODAYS_TOTAL_RETAIL_SALES
                            )?.amount ?? 0
                        },
                        {
                          label: labels.total,
                          value:
                            (data?.dashboard?.summaryFigures?.find(
                              f => f.itemId === SummaryFiguresItem.TODAYS_TOTAL_SALES_ORDERS
                            )?.amount ?? 0) +
                            (data?.dashboard?.summaryFigures?.find(
                              f => f.itemId === SummaryFiguresItem.TODAYS_TOTAL_RETAIL_SALES
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
                            data?.dashboard?.summaryFigures?.find(f => f.itemId === SummaryFiguresItem.SALES_YTD)?.amount ??
                            0
                        },
                        {
                          label: labels.profit,
                          value:
                            data?.dashboard?.summaryFigures?.find(f => f.itemId === SummaryFiguresItem.PROFIT_YTD)?.amount ??
                            0
                        }
                      ]
                    }
                  ].map((summary, index) => (
                    <div className='summaryItem' key={index}>
                      <div className='redCenter'>{summary.title}</div>
                      <div className='innerGrid'>
                        {summary.rows.map((row, idx) => (
                          <React.Fragment key={idx}>
                            <div className='label'>{row.label}:</div>
                            <div className='value'>{row.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}

              {containsApplet(ResourceIds.NewCustomers) && (
                <div className='summaryItem' style={{ gridColumn: '1 / 3' }}>
                  <div className='redCenter'>
                    {labels.newCostumers}:{' '}
                    {(
                      data?.dashboard?.summaryFigures?.find(f => f.itemId === SummaryFiguresItem.NEW_CUSTOMERS_YTD)?.amount ??
                      0
                    ).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          )}

          {containsApplet(ResourceIds.WeeklySalesYTD) && (
            <div className='chartCard'>
              <div className='summaryCard'>
                <h2 className='title'> {labels.avWeeklySales}</h2>
                <strong className='strong'>
                  {(
                    (data?.dashboard?.weeklySales?.map(ws => ws.sales).reduce((acc, val) => acc + val, 0) || 0) /
                    (data?.dashboard?.weeklySales?.length || 1)
                  ).toLocaleString()}
                </strong>
              </div>
              <CompositeBarChartDark
                labels={data?.dashboard?.weeklySales?.map(ws => ws.weekName) || []}
                data={data?.dashboard?.weeklySales?.map(ws => ws.sales) || []}
                label={labels.weeklySales}
              />
            </div>
          )}

          {containsApplet(ResourceIds.MonthlySalesYTD) && (
            <div className='chartCard'>
              <div className='summaryCard'>
                <h2 className='title'>{labels.avMonthlySales}</h2>
                <strong className='strong'>
                  {(
                    (data?.dashboard?.monthlySales?.map(ms => ms.sales).reduce((acc, val) => acc + val, 0) || 0) /
                    (data?.dashboard?.monthlySales?.length || 1)
                  ).toLocaleString()}
                </strong>
              </div>
              <CompositeBarChartDark
                labels={data?.dashboard?.monthlySales?.map(ms => `${ms.year}/${ms.month}`) || []}
                data={data?.dashboard?.monthlySales?.map(ms => ms.sales) || []}
                label={labels.monthlySales}
              />
            </div>
          )}
          {containsApplet(ResourceIds.AccumulatedRevenuesYTD) && (
            <div className='chartCard'>
              <div className='summaryCard'>
                <h2 className='title'>{labels.accRevenues}</h2>
              </div>
              <CompositeBarChartDark
                labels={data?.dashboard?.accumulatedMonthlySales?.map(ams => ams.monthName) || []}
                data={data?.dashboard?.accumulatedMonthlySales?.map(ams => ams.sales) || []}
                label={labels.accRevenues}
                color='#ff6c02'
                hoverColor='#fec106'
              />
            </div>
          )}
          {containsApplet(ResourceIds.Receivables) && (
            <div className='chartCard'>
              <div className='summaryCard'>
                <h2 className='title'>{labels.receivables}</h2>
              </div>
              <HorizontalBarChartDark
                labels={Object.keys(data?.dashboard?.receivables || {})}
                data={Object.values(data?.dashboard?.receivables || {}).map(value =>
                  typeof value === 'number' ? Math.ceil(value) : 0
                )}
                label={labels.receivables}
                color='#6e87b6'
                hoverColor='#818181'
              />
            </div>
          )}
          {containsApplet(ResourceIds.TopCustomers) && (
            <div className='chartCard'>
              <div className='summaryCard'>
                <h2 className='title'>{labels.topCostumers}</h2>
              </div>
              <HorizontalBarChartDark
                labels={data?.dashboard?.topCustomers?.map(c => c.clientName) || []}
                data={data?.dashboard?.topCustomers?.map(c => c.amount) || []}
                label={labels.revenue}
                color='#d5b552'
                hoverColor='#818181'
              />
            </div>
          )}
          {containsApplet(ResourceIds.AverageRevenuePerItem) && (
            <div className='chartCard'>
              <div className='summaryCard'>
                <h2 className='title'>{labels.averageRevenuePerItem}</h2>
              </div>
              <LineChart
                labels={data?.dashboard?.avgUnitSales?.map(c => c.itemName) || []}
                data={data?.dashboard?.avgUnitSales?.map(c => c.avgPrice) || []}
                label={labels.averageRevenue}
              />
            </div>
          )}

          {containsApplet(ResourceIds.TodaysTimeVariationsDetails) && (
            <div className='chartCard'>
              <div className='summaryCard'>
                <h2 className='title'>{labels.todaysTimeVariationsDetails}</h2>
              </div>

              <CustomTabs tabs={data?.hr?.tabs || []} activeTab={activeTab} setActiveTab={setActiveTab} />

              {(data?.hr?.tabs || []).map((tab, idx) => (
                <CustomTabPanel key={idx} index={idx} value={activeTab}>
                  <Box sx={{ display: 'flex', height: '350px' }}>
                    <Table
                      name='TVtable'
                      columns={[
                        { field: 'employeeName', headerName: labels.employeeName, flex: 3 },
                        { field: 'branchName', headerName: labels.branchName, flex: 3 },
                        { field: 'departmentName', headerName: labels.departmentName, flex: 3 },
                        { field: 'duration', headerName: labels.duration, flex: 2, type: 'number' }
                      ]}
                      gridData={data?.hr?.groupedData?.[tab.timeCode] || { list: [] }}
                      rowId={['recordId']}
                      pagination={false}
                      maxAccess={access}
                    />
                  </Box>
                </CustomTabPanel>
              ))}
            </div>
          )}
        </div>

        {containsApplet(ResourceIds.PendingAuthorizationRequests) && (
          <div className='topRow'>
            <div className='chartCard'>
              <div className='summaryCard'>
                <h2 className='title'>{labels.authorization}</h2>
              </div>
              <Box sx={{ display: 'flex', height: '350px' }}>
                <ApprovalsTable pageSize={10} />
              </Box>
            </div>
          </div>
        )}
      </div>
    </div>
       <style jsx global>{`
       .frame {
          display: flex;
          justify-content: flex-start;
          align-items: flex-start;
        }

        .container {
          width: 100%;
          height: 100%;
          padding: 10px;
          background: rgb(204, 204, 204);
          display: flex;
          flex-direction: column;
        }

        .topRow {
          display: grid;
          margin-bottom: 10px;
        }

        .title {
          font-size: 17px;
          margin-bottom: 10px;
          text-align: center;
        }

        .summaryCard {
          background: rgb(255, 255, 255);
          border-radius: 10px;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
        }
        .summaryGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 10px;
          text-align: center;
          color: #000;
          font-size: 16px;
        }

        .summaryItem {
          background: #fff;
          border-radius: 8px;
          padding: 15px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .middleRow {
          display: grid;
          grid-template-columns: 50% 50%;
          gap: 10px;
          margin-bottom: 10px;
          margin-right: 10px;
        }

        .innerGrid {
          display: grid;
          grid-template-columns: auto auto;
          gap: 5px 20px;
          align-items: center;
          text-align: left;
        }

        .chartCard {
          background: rgb(255, 255, 255);
          border-radius: 10px;
          display: flex;
          padding: 5px 8px;
          flex-direction: column;
        }

        .redCenter {
          text-align: center;
          color: red;
          font-size: 18px;
          margin-bottom: 5px;
        }
        .label {
          justify-self: start;
          color: #000;
          font-size: 16px;
        }
        .value {
          justify-self: end;
          color: #000;
          font-size: 16px;
        }

        @media (max-width: 1400px) {
          .title {
            font-size: 20px
          }
        }

        @media (min-width: 1025px) and (max-width: 1280px) {
          .strong {
            font-size: 12px;
          }
          .redCenter {
            font-size: 13px;
          }
          .label {
            font-size: 11px;
          }
          .value {
            font-size: 11px;
          }
          .title {
            font-size: 14px;
          }
        }

        @media (max-width: 1024px) {
          .chartCard {
            padding: 5px 8px;
          }
          .strong {
            font-size: 12px;
          }
          .redCenter {
            font-size: 12px;
          }
          .label {
            font-size: 11px;
          }
          .value {
            font-size: 11px;
          }
          .title {
            font-size: 14px;
          }
        }
      `}</style>
      </>
  )
}

export default DashboardLayout
