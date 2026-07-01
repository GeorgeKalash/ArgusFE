import React, { useState, useEffect, useContext } from 'react'
import { MultiLineChart } from '@argus/shared-ui/src/components/Shared/dashboardApplets/charts'
import { formatDayId, formatDateForGetApI } from '@argus/shared-domain/src/lib/date-helper'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { HRDashboardRepository } from '@argus/repositories/src/repositories/HRDashboardRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'

const LatenessHistoryApplet = ({}) => {
  const { getRequest } = useContext(RequestsContext)
  const [latenessDate, setLatenessDate] = useState(new Date())
  const [latenessHistory, setLatenessHistory] = useState([])

  const { labels } = useResourceParams({
    datasetId: ResourceIds.LatenessHistory
  })
  
  useEffect(() => {
    const fetchLatenessHistory = async () => {
      const formattedDate = formatDateForGetApI(latenessDate).replace(/-/g, '')
      const res = await getRequest({
        extension: HRDashboardRepository.AttendancePeriod.qry,
        parameters: `_startingDayId=${formattedDate}&_params=`
      })

      setLatenessHistory(
        (res?.list || []).map(item => ({
          ...item,
          date: item?.dayId ? formatDayId(item.dayId) : null
        }))
      )
    }

    fetchLatenessHistory()
  }, [latenessDate])

  return (
    <div className='topRow'>
      <div className='chartCard'>
        <div
          className='summaryCard'
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
        >
          <h2 className='title'>{labels.latenessHistory}</h2>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              paddingRight: 8,
              marginTop: 8,
              marginBottom: 8
            }}
          >
            <CustomDatePicker
              name='latenessDate'
              label={labels.to}
              value={latenessDate}
              onChange={(_, val) => setLatenessDate(val || new Date())}
              onClear={() => setLatenessDate(new Date())}
            />
          </div>
        </div>

        <MultiLineChart
          id='lateness-history'
          labels={latenessHistory?.map(a => a.date) || []}
          datasets={[
            { label: labels.attendance, data: latenessHistory?.map(a => a.p_cnt) || [] },
            { label: labels.late, data: latenessHistory?.map(a => a.l_cnt) || [] },
            { label: labels.absent, data: latenessHistory?.map(a => a.d_cnt) || [] },
            { label: labels.missingPunches, data: latenessHistory?.map(a => a.m_cnt) || [] }
          ]}
        />
      </div>
    </div>
  )
}

export default LatenessHistoryApplet
