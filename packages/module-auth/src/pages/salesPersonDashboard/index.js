import React, { useEffect, useState, useContext } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { DashboardRepository } from '@argus/repositories/src/repositories/DashboardRepository'
import { CircularData } from '@argus/shared-ui/src/components/Shared/dashboardApplets/circularData'
import { CompositeBarChart } from '@argus/shared-ui/src/components/Shared/dashboardApplets/charts'
import ProgressBarComponent from '@argus/shared-ui/src/components/Shared/dashboardApplets/ProgressBar'
import HorizontalTimeline from '@argus/shared-ui/src/components/Shared/dashboardApplets/HorizontalTimeline'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import styles from './SalesPersonDashboardStyles.module.css'

const ProfileAvatar = ({ imageUrl }) => (
  <div className={styles.avatar}>
    <div className={styles.circle}></div>
    <div className={styles.circle}></div>
    <div className={styles.pic} style={{ backgroundImage: `url(${imageUrl})` }} />
  </div>
)

const SalesPersonDashboard = () => {
  const { labels } = useResourceParams({
    datasetId: ResourceIds.UserDashboard
  })
  const { getRequest } = useContext(RequestsContext)

  const [data, setData] = useState({
    imageUrl: '',
    myYearlyGrowthInUnitsSoldList: [],
    myYearlyGrowthInClientsAcquiredList: [],
    pctToTarget: 0.0,
    unitsSold: 0.0,
    performanceVsTeamAverage: 0.0,
    receivables: 0,
    teamPctToTarget: 0.0,
    newClientsAcquired: 0,
    distanceToNextCommissionLeg: 0,
    commissionAcquired: 0,
    name: '',
    teamRace: [],
    aging: []
  })

  const [progress, setProgress] = useState({
    pctToTarget: 0,
    teamPctToTarget: 0
  })

  useEffect(() => {
    getDataResult()
  }, [])

  useEffect(() => {
    if (data.pctToTarget > 0 || data.teamPctToTarget > 0) {
      setProgress({
        pctToTarget: data.pctToTarget,
        teamPctToTarget: data.teamPctToTarget
      })
    }
  }, [data.pctToTarget, data.teamPctToTarget])

  const getDataResult = () => {
    getRequest({
      extension: DashboardRepository.SalesPersonDashboard.spDB
    }).then(res => {
      setData({
        imageUrl: res.record?.imageUrl || '',
        myYearlyGrowthInUnitsSoldList: res.record?.myYearlyGrowthInUnitsSoldList || [],
        myYearlyGrowthInClientsAcquiredList: res.record?.myYearlyGrowthInClientsAcquiredList || [],
        pctToTarget: res.record?.pctToTarget || 0.0,
        unitsSold: res.record?.unitsSold || 0.0,
        performanceVsTeamAverage: res.record?.performanceVsTeamAverage || 0.0,
        teamPctToTarget: res.record?.teamPctToTarget || 0.0,
        newClientsAcquired: res.record?.newClientsAcquired || 0,
        distanceToNextCommissionLeg: res.record?.distanceToNextCommissionLeg || 0,
        commissionAcquired: res.record?.commissionAcquired || 0,
        receivables: res.record?.receivables || 0,
        name: res.record?.salesPerson?.name || '',
        teamRace: res.record?.teamRace || [],
        aging: res.record?.aging || []
      })
    })
  }

  const list1 = [
    { name: labels.unitsSold, key: 'unitsSold' },
    { name: labels.newClientsAcquired, key: 'newClientsAcquired' },
    { name: labels.receivables, key: 'receivables' }
  ]

  const list2 = [
    { name: labels.distanceToNextCommissionLeg, key: 'distanceToNextCommissionLeg' },
    { name: labels.commissionAcquired, key: 'commissionAcquired' }
  ]

  return (
    <div className={styles.frame}>
      <div className={styles.card}>
        <div className={styles.bodyCard}>
          <div className={styles.sideData}>
            <div className={styles.dataHalf}>
              <CircularData data={data} list={list1} />
            </div>
            <div className={styles.dataHalf}>
              <div className={styles.compositeBarContainer}>
                <CompositeBarChart
                  labels={Object.keys(data.aging)}
                  data={Object.values(data.aging)}
                  label={labels.aging}
                />
              </div>
            </div>
          </div>

          <div className={styles.sideData}>
            <div className={styles.profile}>
              <ProfileAvatar imageUrl={data.imageUrl} />
              <span className={`${styles.span} ${styles.big}`}>{data.name}</span>
            </div>

            <div className={styles.dataHalf}>
              <CircularData data={data} list={list2} />
            </div>
          </div>

          <div className={styles.sideData}>
            <div className={styles.dataHalf}>
              <div className={styles.compositeBarContainer}>
                <CompositeBarChart
                  labels={data.myYearlyGrowthInUnitsSoldList.map(i => i.year)}
                  data={data.myYearlyGrowthInUnitsSoldList.map(i => i.qty)}
                  label={labels.unitsSold}
                />
              </div>
            </div>

            <div className={styles.dataHalf}>
              <div className={styles.compositeBarContainer}>
                <CompositeBarChart
                  labels={data.myYearlyGrowthInClientsAcquiredList.map(i => i.year)}
                  data={data.myYearlyGrowthInClientsAcquiredList.map(i => i.qty)}
                  label={labels.clientsAcquired}
                />
              </div>
            </div>

            <div className={styles.dataHalf}>
              <div className={styles.progressBarsWrapper}>
                <ProgressBarComponent label={labels.percentageToTarget} percentage={progress.pctToTarget} />
                <ProgressBarComponent label={labels.teamPercentageToTarget} percentage={progress.teamPctToTarget} />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footerCard}>
          <div className={styles.sideData}>
            <div className={styles.dataHalf}>
              <HorizontalTimeline data={data.teamRace} label={labels.teamRace} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SalesPersonDashboard
