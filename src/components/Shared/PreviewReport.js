import React, { useState, useEffect, useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { DevExpressRepository } from 'src/repositories/DevExpressRepository'
import { ResourceIds } from 'src/resources/ResourceIds'

export default function PreviewReport({ recordId, selectedReport, functionId, resourceId, outerGrid = false }) {
  const { postRequest } = useContext(RequestsContext)
  const [pdfURL, setPdfUrl] = useState(null)

  useEffect(() => {
    generateReport()
  }, [selectedReport])

  const generateReport = () => {
    let parameters = ''
    if (!outerGrid) {
      parameters =
        resourceId == ResourceIds.JournalVoucher
          ? `?_recordId=${recordId}&_functionId=${functionId}`
          : `?_recordId=${recordId}`
    }

    const obj = {
      api_url: selectedReport.api_url + parameters,
      assembly: selectedReport.assembly,
      format: 1,
      reportClass: selectedReport.reportClass,
      functionId: functionId
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

  return <>{pdfURL && <iframe title={'Preview'} src={pdfURL} width='100%' height='100%' allowFullScreen />}</>
}
