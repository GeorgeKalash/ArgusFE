import { useEffect, useRef } from 'react'
import ko from 'knockout'

const ReportViewer = ({ reportData, reportTemplate }) => {
  const reportUrl = ko.observable('TestReport')
  const previewModel = ko.observable()

  const callbacks = {
    CustomizeExportOptions: function (s, e) {
      e.HideExportOptionsPanel()
      model.documentOptions.author('Me')
    }
  }

  const exportDocument = () => {
    previewModel().ExportTo('xlsx')
  }

  const viewerRef = useRef(null)

  useEffect(() => {
    // Set report data
    previewModel().Data(reportData)

    // Set report template
    previewModel().LoadDocument(reportTemplate)

    // Apply bindings
    ko.applyBindings(
      {
        reportUrl: reportUrl,
        viewerModel: previewModel,
        callbacks: callbacks
      },
      viewerRef.current
    )

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
