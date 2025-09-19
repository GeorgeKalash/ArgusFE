import { Grid } from '@mui/material'
import { useState, useContext, useEffect } from 'react'
import { ControlContext } from 'src/providers/ControlContext'
import CustomComboBox from '../Inputs/CustomComboBox'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useWindow } from 'src/windows'
import PreviewReport from './PreviewReport'
import { DataSets } from 'src/resources/DataSets'
import { generateReport } from 'src/utils/ReportUtils'
import { CommonContext } from 'src/providers/CommonContext'
import CustomButton from '../Inputs/CustomButton'

const ReportGenerator = ({
  previewReport,
  condition,
  getReportLayout,
  reportStore,
  recordId,
  form,
  resourceId,
  previewBtnClicked
}) => {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { getAllKvsByDataset } = useContext(CommonContext)
  const { stack } = useWindow()

  const [exportFormats, setExportFormats] = useState([])
  const [formatIndex, setFormatIndex] = useState(0)
  const [report, setReport] = useState({ selectedFormat: '', selectedReport: '' })

  const getExportFormats = async () => {
    await getAllKvsByDataset({
      _dataset: DataSets.EXPORT_FORMAT,
      callback: res => {
        if (res.length > 0) {
          setExportFormats(res)
          setFormatIndex(0)
          setReport(prev => ({
            ...prev,
            selectedFormat: res[0]
          }))
        }
      }
    })
  }

  useEffect(() => {
    const fetchReportLayout = async () => {
      if (previewReport) {
        await getExportFormats()
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
    const nextIndex = (formatIndex + 1) % exportFormats.length
    setFormatIndex(nextIndex)
    setReport(prev => ({
      ...prev,
      selectedFormat: exportFormats[nextIndex]
    }))
  }

  const handlePreviewClick = async () => {
    if (!report.selectedReport) return

    const result = await generateReport({
      postRequest,
      resourceId: resourceId,
      selectedReport: report.selectedReport,
      selectedFormat: report.selectedFormat.key,
      functionId: form?.values?.functionId || null,
      scId: form?.values?.stockCountId || null,
      siteId: form?.values?.siteId || null,
      controllerId: form?.values?.controllerId || null,
      recordId: recordId || null,
      previewBtnClicked: previewBtnClicked
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
    <Grid item xs={3} sx={{ display: 'flex', mr: 2 }}>
      <CustomComboBox
        label={platformLabels.SelectReport}
        valueField='uniqueId'
        displayField='layoutName'
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
        disabled={exportFormats.length === 0 || !report.selectedReport}
        style={{ marginLeft: '6px' }}
      />
      <CustomButton
        onClick={handlePreviewClick}
        label={platformLabels.Preview}
        image='preview.png'
        disabled={!report.selectedReport}
      />
    </Grid>
  )
}

export default ReportGenerator
