import React, { useState, useEffect, useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { DevExpressRepository } from 'src/repositories/DevExpressRepository'
import { ResourceIds } from 'src/resources/ResourceIds'

export default function PreviewReport({
  recordId,
  selectedReport,
  functionId,
  resourceId,
  outerGrid = false,
  scId,
  siteId,
  controllerId,
  onSuccess
}) {
  const { postRequest } = useContext(RequestsContext)
  const [pdfURL, setPdfUrl] = useState(null)
  useEffect(() => {
    generateReport()
  }, [selectedReport])

  const generateReport = () => {
    let parameters = ''
    if (!outerGrid) {
      if (resourceId === ResourceIds.JournalVoucher) {
        parameters = `?_recordId=${recordId}&_functionId=${functionId}`
      } else if (
        resourceId === ResourceIds.IVPhysicalCountItem ||
        resourceId === ResourceIds.PhysicalCountSerialSummary
      ) {
        parameters = `?_stockCountId=${scId}&_siteId=${siteId}`
      } else if (
        resourceId === ResourceIds.IVPhysicalCountItemDetails ||
        resourceId === ResourceIds.PhysicalCountSerialDetail
      ) {
        parameters = `?_stockCountId=${scId}&_siteId=${siteId}&_controllerId=${controllerId}`
      } else {
        parameters = `?_recordId=${recordId}`
      }
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
    }).then(res => {
      onSuccess()
      setPdfUrl(res.recordId)
    })
  }

  return <>{pdfURL && <iframe title={'Preview'} src={pdfURL} width='100%' height='100%' allowFullScreen />}</>
}
