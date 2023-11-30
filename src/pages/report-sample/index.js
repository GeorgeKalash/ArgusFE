import { useState, useContext } from 'react'
import { Button } from '@mui/material'
import ReportViewer from 'src/components/Shared/ReportViewer'
import { RequestsContext } from 'src/providers/RequestsContext'

const ReportSample = () => {
  const { getRequest } = useContext(RequestsContext)

  const [showReport, setShowReport] = useState(false)

  const getReportData = () => {
    getRequest({
      extension: 'RT.asmx/RT311',
      parameters: '_params=1|20230727^2|20230728'
    })
      .then(res => {
        console.log({ res })
      })
      .catch(error => {
        console.log(error)
      })
  }

  const openReport = () => {
    setShowReport(true)
    getReportData()
  }

  const closeReport = () => {
    setShowReport(false)
  }

  return (
    <div>
      <Button onClick={() => openReport()}>Show Report</Button>
      <Button onClick={() => closeReport()}>Close Report</Button>
      {showReport && <ReportViewer />}
    </div>
  )
}

export default ReportSample
