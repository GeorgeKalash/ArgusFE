import React, { useState, useEffect, useContext } from 'react'
import { MultiLineChart } from '@argus/shared-ui/src/components/Shared/dashboardApplets/charts'
import { formatDateDefault, formatDateForGetApI } from '@argus/shared-domain/src/lib/date-helper'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { HRDashboardRepository } from '@argus/repositories/src/repositories/HRDashboardRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import { Box } from '@mui/material'

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
        (res?.list || []).map(item => {
          const date = item?.dayId
            ? new Date(
                `${String(item.dayId).substring(0, 4)}-${String(item.dayId).substring(4, 6)}-${String(item.dayId).substring(6, 8)}`
              )
            : null

          return {
            ...item,
            date: date
              ? `${date.toLocaleDateString('en-US', { weekday: 'long' })} - ${formatDateDefault(date)}`
              : null
          }
        })
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
          <Box>
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
        </Box>
      </div>
    </div>
  )
}

export default LatenessHistoryApplet
