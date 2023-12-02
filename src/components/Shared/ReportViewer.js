import { useEffect, useRef } from 'react'
import ko from 'knockout'

// import AsyncExportApproach from 'devexpress-reporting/dx-webdocumentviewer'
// import ExportFormatID from 'devexpress-reporting/dx-webdocumentviewer'

const ReportViewer = () => {
  const reportUrl = ko.observable('TestReport')
  const previewModel = ko.observable()

  const requestOptions = {
    host: 'https://localhost:64673/',
    invokeAction: 'DXXRDV'
  }

  const callbacks = {
    CustomizeExportOptions: function (s, e) {
      e.HideExportOptionsPanel()

      //   const model = e.GetExportOptionsModel(ExportFormatID.XLSX)
      model.documentOptions.author('Me')
    }

    // BeforeRender: function (s, e) {
    //   AsyncExportApproach(true)
    // }
  }

  const exportDocument = () => {
    previewModel().ExportTo('xlsx')
  }

  const viewerRef = useRef(null)

  useEffect(() => {
    ko.applyBindings(
      {
        reportUrl: reportUrl,
        viewerModel: previewModel,
        requestOptions: requestOptions,
        callbacks: callbacks
      },
      viewerRef.current
    )

    return () => {
      ko.cleanNode(viewerRef.current)
    }
  }, [])

  return (
    <div>
      <button onClick={exportDocument}>Export to XLSX</button>
      <div ref={viewerRef} data-bind='dxReportViewer: $data' style={{ width: '100%', height: '900px' }}></div>
    </div>
  )
}

export default ReportViewer

// const ReportViewer = () => {
//   const reportUrl = ko.observable('');
//   const previewModel = ko.observable();

//   const callbacks = {
//     CustomizeExportOptions: function (s, e) {
//       e.HideExportOptionsPanel();
//     },
//   };

//   const viewerRef = useRef(null);

//   useEffect(() => {
//     const fetchReport = async () => {
//       try {
//         const response = await axios.get('/api/reports', {
//           params: {
//             reportName: 'TestReport',
//           },
//         });

//         const reportData = response.data.ReportData;
//         previewModel().SetReportData(reportData);
//         reportUrl(reportData.ReportName);
//       } catch (error) {
//         console.error('Error fetching report:', error);
//       }
//     };

//     fetchReport();
//   }, []);

//   useEffect(() => {
//     ko.applyBindings(
//       {
//         reportUrl: reportUrl,
//         viewerModel: previewModel,
//         // requestOptions: removed this line
//         callbacks: callbacks,
//       },
//       viewerRef.current
//     );

//     return () => {
//       ko.cleanNode(viewerRef.current);
//     };
//   }, [reportUrl]);

//   return (
//     <div>
//       <div ref={viewerRef} data-bind='dxReportViewer: $data' style={{ width: '100%', height: '900px' }}></div>
//     </div>
//   );
// };

// export default ReportViewer;
