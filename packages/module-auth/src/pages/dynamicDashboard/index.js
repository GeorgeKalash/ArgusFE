import React, { useEffect, useState, useContext, useCallback, useRef } from 'react'
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
import { SummaryFiguresItem } from '@argus/shared-domain/src/resources/DashboardFigures'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { Box } from '@mui/material'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { TimeAttendanceRepository } from '@argus/repositories/src/repositories/TimeAttendanceRepository'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { formatDateForGetApI } from '@argus/shared-domain/src/lib/date-helper'
import ApprovalsTable from '@argus/shared-ui/src/components/Shared/ApprovalsTable'
import styles from './DynamicDashboard.module.css'
import axios from 'axios';

const DashboardLayout = () => {
  const { getRequest } = useContext(RequestsContext)
  const [data, setData] = useState(null)
  const [applets, setApplets] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const userData = getStorageData('userData')
  const _userId = userData.userId
  const _languageId = userData.languageId

  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.UserDashboard
  })
  
useEffect(() => {
  const resizeHandler = () => window.dispatchEvent(new Event('resize'));
  window.addEventListener('resize', resizeHandler);

  return () => {
    window.removeEventListener('resize', resizeHandler);
  };
}, [])

  const cancelTokenSource = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    cancelTokenSource.current = axios.CancelToken.source();

    const fetchData = async () => {
      try {
        const appletsRes = await getRequest({
          extension: SystemRepository.DynamicDashboard.qry,
          parameters: `_userId=${_userId}`,
          cancelToken: cancelTokenSource.current.token,
        });

        if (isMounted.current) {
          setApplets(appletsRes.list);
        }

        const [resDashboard, resSP, resTV, resTimeCode] = await Promise.all([
          getRequest({ extension: DashboardRepository.dashboard, cancelToken: cancelTokenSource.current.token }),
          getRequest({ extension: DashboardRepository.SalesPersonDashboard.spDB, cancelToken: cancelTokenSource.current.token }),
          getRequest({
            extension: TimeAttendanceRepository.TimeVariation.qry2,
            parameters: `_dayId=${formatDateForGetApI(new Date())}`,
            cancelToken: cancelTokenSource.current.token,
          }),
          getRequest({
            extension: SystemRepository.KeyValueStore,
            parameters: `_dataset=${DataSets.TIME_CODE}&_language=${_languageId}`,
            cancelToken: cancelTokenSource.current.token,
          }),
        ]);

        if (isMounted.current) {
          const availableTimeCodes = new Set(resTV.list.map(d => d.timeCode));

          const filteredTabs = resTimeCode.list
            .filter(t => availableTimeCodes.has(Number(t.key)))
            .map(t => ({
              label: t.value,
              timeCode: Number(t.key),
              disabled: false,
            }));

          const groupedData = filteredTabs.reduce((acc, tab) => {
            acc[tab.timeCode] = { list: resTV.list.filter(d => d.timeCode === tab.timeCode) };
            return acc;
          }, {});

          setData({
            dashboard: resDashboard?.record,
            sp: resSP?.record,
            hr: {
              timeVariationDetails: resTV.list || [],
              tabs: filteredTabs,
              groupedData: groupedData,
            },
          });
        }
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error('Error fetching data:', error);
        }
      }
    };

    fetchData();

    return () => {
      isMounted.current = false;
      cancelTokenSource.current.cancel('Operation canceled by the user.');
    };
  }, [_userId, _languageId])

  const containsApplet = useCallback(
    (appletId) => {
      if (!Array.isArray(applets)) return false;
      return applets.some((applet) => applet.appletId === appletId);
    },
    [applets]
  );

  const fall = (name) => (styles && styles[name]) ? styles[name] : `dd-${name}`;

  const fallbackStylesTag = (
    <style>{`
      .dd-frame { font-family: Arial, Helvetica, sans-serif; color: #222; padding: 16px; box-sizing: border-box; }
      .dd-container { display: flex; flex-direction: column; gap: 16px; }
      .dd-topRow, .dd-middleRow { display: flex; gap: 16px; flex-wrap: wrap; }
      .dd-chartCard { background: #fff; border-radius: 6px; padding: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); min-width: 280px; flex: 1 1 320px; box-sizing: border-box; }
      .dd-summaryCard { margin-bottom: 8px; }
      .dd-title { font-size: 16px; margin: 0; }
      .dd-strong { font-size: 20px; }
      .dd-summaryGrid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
      .dd-summaryItem { background: #f8f8f8; padding: 8px; border-radius: 4px; }
      .dd-redCenter { text-align: center; color: #d9534f; font-weight: 600; }
      .dd-innerGrid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
      .dd-label { font-size: 12px; color: #666; }
      .dd-value { font-size: 14px; font-weight: 600; }
    `}</style>
  );

  return (
    <div className={fall('frame')}>
      {fallbackStylesTag}
      <div className={fall('container')}>
        {containsApplet(ResourceIds.TodayRetailOrders) && (
          <div className={fall('topRow')}>
            <div className={fall('chartCard')}>
              <div className={fall('summaryCard')}>
                <h2 className={fall('title')}>{labels.retailSales}</h2>
                <strong className={fall('strong')}>
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
          <div className={fall('topRow')}>
            <div className={fall('chartCard')}>
              <div className={fall('summaryCard')}>
                <h2 className={fall('title')}>{labels.myYearlySalesPerformance}</h2>
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
          <div className={fall('topRow')}>
            <div className={fall('chartCard')}>
              <div className={fall('summaryCard')}>
                <h2 className={fall('title')}>{labels.myMonthlySalesPerformance}</h2>
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
          <div className={fall('topRow')}>
            <div className={fall('chartCard')}>
              <div className={fall('summaryCard')}>
                <h2 className={fall('title')}>{labels.salesTeamOrdersSummary}</h2>
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
        <div className={fall('middleRow')}>
          {containsApplet(ResourceIds.MyYearlyUnitsSoldList) && (
            <div className={fall('chartCard')}>
              <div className={fall('summaryCard')}>
                <h2 className={fall('title')}>{labels.myYearlyUnitsSoldList}</h2>
              </div>
              <MixedColorsBarChartDark
                labels={data?.sp?.myYearlyUnitsSoldList?.map(ws => ws.year) || []}
                data={data?.sp?.myYearlyUnitsSoldList?.map(ws => ws.qty) || []}
                label={labels.qty}
              />
            </div>
          )}
          {containsApplet(ResourceIds.MyYearlyGrowthInUnitsSoldList) && (
            <div className={fall('chartCard')}>
              <div className={fall('summaryCard')}>
                <h2 className={fall('title')}>{labels.myYearlyGrowthInUnitsSoldList}</h2>
              </div>
              <MixedColorsBarChartDark
                labels={data?.sp?.myYearlyGrowthInUnitsSoldList?.map(ws => ws.year) || []}
                data={data?.sp?.myYearlyGrowthInUnitsSoldList?.map(ws => ws.qty) || []}
                label={labels.qty}
              />
            </div>
          )}
          {containsApplet(ResourceIds.MyYearlyClientsAcquiredList) && (
            <div className={fall('chartCard')}>
              <div className={fall('summaryCard')}>
                <h2 className={fall('title')}>{labels.myYearlyClientsAcquiredList}</h2>
              </div>
              <MixedColorsBarChartDark
                labels={data?.sp?.myYearlyClientsAcquiredList?.map(ws => ws.year) || []}
                data={data?.sp?.myYearlyClientsAcquiredList?.map(ws => ws.qty) || []}
                label={labels.qty}
              />
            </div>
          )}
          {containsApplet(ResourceIds.MyYearlyGrowthInClientsAcquiredList) && (
            <div className={fall('chartCard')}>
              <div className={fall('summaryCard')}>
                <h2 className={fall('title')}>{labels.myYearlyGrowthInClientsAc}</h2>
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
          <div className={fall('topRow')}>
            <div className={fall('chartCard')}>
              <div className={fall('summaryCard')}>
                <h2 className={fall('title')}>{labels.todayPlantSales}</h2>
                <strong className={fall('strong')}>
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

        <div className={fall('middleRow')}>
          {(containsApplet(ResourceIds.NewCustomers) || containsApplet(ResourceIds.GlobalSalesYTD)) && (
            <div className={fall('summaryGrid')}>
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
                    <div className={fall('summaryItem')} key={index}>
                      <div className={fall('redCenter')}>{summary.title}</div>
                      <div className={fall('innerGrid')}>
                        {summary.rows.map((row, idx) => (
                          <React.Fragment key={idx}>
                            <div className={fall('label')}>{row.label}:</div>
                            <div className={fall('value')}>
                              {row.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </div>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
              {containsApplet(ResourceIds.NewCustomers) && (
                <div className={fall('summaryItem')} style={{ gridColumn: '1 / 3' }}>
                  <div className={fall('redCenter')}>
                    {labels.newCostumers}:{' '}
                    {(
                      data?.dashboard?.summaryFigures?.find(f => f.itemId === SummaryFiguresItem.NEW_CUSTOMERS_YTD)
                        ?.amount ?? 0
                    ).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          )}

          {containsApplet(ResourceIds.WeeklySalesYTD) && (
            <div className={fall('chartCard')}>
              <div className={fall('summaryCard')}>
                <h2 className={fall('title')}> {labels.avWeeklySales}</h2>
                <strong className={fall('strong')}>
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
            <div className={fall('chartCard')}>
              <div className={fall('summaryCard')}>
                <h2 className={fall('title')}>{labels.avMonthlySales}</h2>
                <strong className={fall('strong')}>
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
            <div className={fall('chartCard')}>
              <div className={fall('summaryCard')}>
                <h2 className={fall('title')}>{labels.accRevenues}</h2>
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
            <div className={fall('chartCard')}>
              <div className={fall('summaryCard')}>
                <h2 className={fall('title')}>{labels.receivables}</h2>
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
            <div className={fall('chartCard')}>
              <div className={fall('summaryCard')}>
                <h2 className={fall('title')}>{labels.topCostumers}</h2>
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
            <div className={fall('chartCard')}>
              <div className={fall('summaryCard')}>
                <h2 className={fall('title')}>{labels.averageRevenuePerItem}</h2>
              </div>
              <LineChart
                labels={data?.dashboard?.avgUnitSales?.map(c => c.itemName) || []}
                data={data?.dashboard?.avgUnitSales?.map(c => c.avgPrice) || []}
                label={labels.averageRevenue}
              />
            </div>
          )}

          {containsApplet(ResourceIds.TodaysTimeVariationsDetails) && (
            <div className={fall('chartCard')}>
              <div className={fall('summaryCard')}>
                <h2 className={fall('title')}>{labels.todaysTimeVariationsDetails}</h2>
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
          <div className={fall('topRow')}>
            <div className={fall('chartCard')}>
              <div className={fall('summaryCard')}>
                <h2 className={fall('title')}>{labels.authorization}</h2>
              </div>
              <Box sx={{ display: 'flex', height: '350px' }}>
                <ApprovalsTable pageSize={10} />
              </Box>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardLayout
