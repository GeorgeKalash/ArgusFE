import { Grid, Box } from '@mui/material'
import { useState, useContext, useEffect } from 'react'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import CustomComboBox from '../Inputs/CustomComboBox'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import PreviewReport from './PreviewReport'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { generateReport } from '@argus/shared-utils/src/utils/ReportUtils'
import { CommonContext } from '@argus/shared-providers/src/providers/CommonContext'
import CustomButton from '../Inputs/CustomButton'

const ReportGenerator = ({
  previewReport,
  condition,
  getReportLayout,
  reportStore,
  recordId,
  form,
  resourceId,
  previewBtnClicked,
  reportSize = 3
}) => {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels, exportFormat } = useContext(ControlContext)
  const { stack } = useWindow()
  const [formatIndex, setFormatIndex] = useState(0)
  const [report, setReport] = useState({
    selectedFormat: '',
    selectedReport: ''
  })

  const getExportFormats = async () => {
    if (!exportFormat.length) return
    setFormatIndex(0)
    setReport(prev => ({
      ...prev,
      selectedFormat: exportFormat[0]
    }))
  }

  useEffect(() => {
    getExportFormats()
  }, [exportFormat])

  useEffect(() => {
    const fetchReportLayout = async () => {
      if (previewReport) {
        await getReportLayout(setReport)
      }
    }

    fetchReportLayout()
  }, [condition])

  useEffect(() => {
    if (reportStore.length > 0) {
      setReport(prev => ({
        ...prev,
        selectedReport: reportStore[0]
      }))
    }
  }, [reportStore])

  const cycleFormat = () => {
    const nextIndex = (formatIndex + 1) % exportFormat.length
    setFormatIndex(nextIndex)
    setReport(prev => ({
      ...prev,
      selectedFormat: exportFormat[nextIndex]
    }))
  }

  const handlePreviewClick = async () => {
    if (!report.selectedReport) return

    const result = await generateReport({
      postRequest,
      resourceId,
      selectedReport: report.selectedReport,
      selectedFormat: report.selectedFormat.key,
      functionId: form?.values?.functionId || null,
      scId: form?.values?.stockCountId || null,
      siteId: form?.values?.siteId || null,
      controllerId: form?.values?.controllerId || null,
      recordId: recordId || null,
      previewBtnClicked
    })

    switch (parseInt(report.selectedFormat.key)) {
      case 1:
        stack({
          Component: PreviewReport,
          props: { pdf: result }
        })
        break
      default:
        window.location.href = result
        break
    }
  }

  return (
    <Grid
      item
      xs={reportSize}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <CustomComboBox
          label={platformLabels.SelectReport}
          valueField="uniqueId"
          displayField="layoutName"
          store={reportStore}
          value={report.selectedReport}
          onChange={(e, newValue) =>
            setReport(prev => ({
              ...prev,
              selectedReport: newValue
            }))
          }
          refresh={false}
          sx={{ width: 250 }}
          disableClearable
        />

        <CustomButton
          onClick={cycleFormat}
          image={`${report.selectedFormat?.value || 'PDF'}.png`}
          disabled={exportFormat.length == 0 || !report.selectedReport}
        />

        <CustomButton
          onClick={handlePreviewClick}
          label={platformLabels.Preview}
          image="preview.png"
          disabled={!report.selectedReport}
        />
      </Box>
    </Grid>
  )
}

export default ReportGenerator
