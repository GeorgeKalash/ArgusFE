import { useEffect, useRef } from 'react'
import ko from 'knockout'

// import * as DevExpress from 'devexpress-reporting'

const ReportViewer = ({ reportData, reportTemplate }) => {
  const previewModel = ko.observable()

  const exportDocument = () => {
    previewModel().ExportTo('xlsx')
  }

  const viewerRef = useRef(null)

  useEffect(() => {
    // Initialize the Knockout observables
    const reportDataObservable = ko.observableArray(reportData)

    // Create a preview model with the report template and data
    const previewModel = new DevExpress.Reporting.Preview.PreviewModel(reportDataObservable, reportTemplate)

    // Apply bindings
    ko.applyBindings(previewModel, viewerRef.current)

    // Clean up Knockout bindings on component unmount
    return () => {
      ko.cleanNode(viewerRef.current)
    }
  }, [reportData, reportTemplate])

  return (
    <div>
      <button onClick={exportDocument}>Export to XLSX</button>
      <div ref={viewerRef} data-bind='dxReportViewer: $data' style={{ width: '100%', height: '900px' }}></div>
    </div>
  )
}

export default ReportViewer
