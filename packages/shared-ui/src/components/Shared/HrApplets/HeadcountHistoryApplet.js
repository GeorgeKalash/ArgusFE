import React, { useState, useEffect, useContext } from 'react'
import { CompositeBarChartDark } from '@argus/shared-ui/src/components/Shared/dashboardApplets/charts'
import { ReportRepository } from '@argus/repositories/src/repositories/ReportRepository'
import { formatEEEEMMMDDYY, formatDateForGetApI } from '@argus/shared-domain/src/lib/date-helper'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'

const HeadcountHistoryApplet = ({ }) => {
  const { getRequest } = useContext(RequestsContext)
  const [headcountToDate, setHeadcountToDate] = useState(new Date())
  const [headCount, setHeadCount] = useState([])

  const { labels } = useResourceParams({
    datasetId: ResourceIds.HeadcountHistory
  })

  useEffect(() => {
    const fetchHeadcount = async () => {
      const formattedDate = formatDateForGetApI(headcountToDate).replace(/-/g, '')
      const res = await getRequest({
        extension: ReportRepository.HeadCount.RT103,
        parameters: `_params=1|19910101^2|${formattedDate}`
      })

      setHeadCount(
        (res?.list || []).map(item => ({
          ...item,
          date: item?.date ? formatEEEEMMMDDYY(item.date) : null
        }))
      )
    }

    fetchHeadcount()
  }, [headcountToDate])

  return (
    <div className='topRow'>
      <div className='chartCard'>
        <div className='summaryCard'>
          <h2 className='title'>{labels.headCount}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingRight: 8 }}>
            <span style={{ fontSize: 14 }}>To:</span>
            <CustomDatePicker
              name='headcountToDate'
              label={labels.toDate}
              value={headcountToDate}
              onChange={(_, val) => setHeadcountToDate(val || new Date())}
              onClear={() => setHeadcountToDate(new Date())}
            />
          </div>
        </div>
        <CompositeBarChartDark
          labels={headCount?.map(d => d.date) || []}
          data={headCount?.map(hc => hc.headCount) || []}
          label={labels.headCount}
          color='rgb(88, 2, 1)'
          hoverColor='rgb(113, 27, 26)'
        />
      </div>
    </div>
  )
}

export default HeadcountHistoryApplet