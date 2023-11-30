import { useEffect, useRef } from 'react'
import { DxReportViewer } from 'devexpress-reporting/dx-webdocumentviewer'
import * as ko from 'knockout'

const ReportViewer = () => {
  const reportUrl = ko.observable('TestReport')
  const viewerRef = useRef()

  const requestOptions = {
    host: 'https://localhost:3000/',
    invokeAction: 'DXXRDV'
  }
  useEffect(() => {
    const viewer = new DxReportViewer(viewerRef.current, { reportUrl, requestOptions })
    viewer.render()

    return () => viewer.dispose()
  })

  return <div ref={viewerRef}></div>
}

export default ReportViewer
