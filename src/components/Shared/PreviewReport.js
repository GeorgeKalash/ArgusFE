import { Box } from '@mui/material'
import React, {useState, useEffect, useContext} from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { DevExpressRepository } from 'src/repositories/DevExpressRepository'

export default function PreviewReport({recordId , selectedReport}) {
  const {  postRequest } = useContext(RequestsContext)
  const [pdfURL, setPdfUrl] = useState(null)

  useEffect(() => {
    generateReport()
  }, [selectedReport])

  const generateReport = () => {
    const obj = {
      api_url: selectedReport.api_url + `?_recordId=${recordId}`,
      assembly: selectedReport.assembly,
      format: 1,
      reportClass: selectedReport.reportClass
    }
    postRequest({
      url: process.env.NEXT_PUBLIC_REPORT_URL,
      extension: DevExpressRepository.generate,
      record: JSON.stringify(obj)
    })
      .then(res => {
        setPdfUrl(res.recordId)
      })
      .catch(error => {
        console.log({ generateReportERROR: error })
      })
  }


  return (
      <>
       {pdfURL && <iframe title={'Preview'} src={pdfURL} width='100%' height='100%' allowFullScreen />}
      </>
  )
}
