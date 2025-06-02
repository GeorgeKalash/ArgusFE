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

const ReportGenerator = ({ previewReport, condition, getReportLayout, reportStore, recordId }) => {
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
    if (reportStore.length > 0)
      setReport(prevState => ({
        ...prevState,
        selectedReport: reportStore[0]
      }))
  }, [reportStore])

  const cycleFormat = () => {
    const nextIndex = (formatIndex + 1) % exportFormats.length
    setFormatIndex(nextIndex)
    setReport(prev => ({
      ...prev,
      selectedFormat: exportFormats[nextIndex]
    }))
  }

  return (
    <Grid item xs={3} sx={{ display: 'flex', mr: 2 }}>
      <CustomComboBox
        label={platformLabels.SelectReport}
        valueField='caption'
        displayField='layoutName'
        store={reportStore}
        value={report.selectedReport}
        onChange={(e, newValue) =>
          setReport(prev => ({
            ...prev,
            selectedReport: newValue
          }))
        }
        sx={{ width: 250 }}
        disableClearable
      />
      <CustomButton
        onClick={cycleFormat}
        label={`${report.selectedFormat?.value || 'PDF'}`}
        border='1px solid #ccc'
        disabled={exportFormats.length === 0 || !report.selectedReport}
        style={{ width: '75px', marginLeft: '8px' }}
      />
      <CustomButton
        style={{ ml: 1 }}
        onClick={async () => {
          if (!report.selectedReport) return

          const result = await generateReport({
            postRequest,
            resourceId: previewReport,
            outerGrid: !recordId,
            selectedReport: report.selectedReport,
            selectedFormat: report.selectedFormat.key,
            recordId: recordId || null
          })
          switch (parseInt(report.selectedFormat.key)) {
            case 1:
              stack({
                Component: PreviewReport,
                props: {
                  pdf: result
                },
                width: 1000,
                height: 500,
                title: platformLabels.PreviewReport
              })
              break

            default:
              window.location.href = result
              break
          }
        }}
        label={platformLabels.Preview}
        image={'preview.png'}
        disabled={!report.selectedReport}
      />
    </Grid>
  )
}

export default ReportGenerator
