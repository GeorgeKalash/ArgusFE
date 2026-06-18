import { Grid, Box } from '@mui/material'
import { useState, useContext, useEffect, useRef } from 'react'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import CustomComboBox from '../Inputs/CustomComboBox'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import PreviewReport from './PreviewReport'
import { generateReport } from '@argus/shared-utils/src/utils/ReportUtils'
import CustomButton from '../Inputs/CustomButton'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'
import usePageInteraction from '@argus/shared-providers/src/providers/usePageInteraction'

const ReportGenerator = ({
  previewReport,
  condition,
  getReportLayout,
  reportStore,
  recordId,
  form,
  resourceId,
  previewBtnClicked,
  reportSize = 3,
  defaultLayoutId
}) => {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { exportFormat } = useContext(DefaultsContext)
  const { stack } = useWindow()
  const trackInteraction = usePageInteraction()
  const [formatIndex, setFormatIndex] = useState(0)
  const [report, setReport] = useState({
    selectedFormat: '',
    selectedReport: ''
  })

  const initialReportRef = useRef(null)
  const initialFormatRef = useRef(null)

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
      const defaultReport = reportStore.find(
        item => item.id === defaultLayoutId
      )
      const selected = defaultReport || reportStore[0]
  
      setReport(prev => ({
        ...prev,
        selectedReport: selected
      }))

      if (initialReportRef.current === null) {
        initialReportRef.current = selected
      }
    }
  }, [reportStore, defaultLayoutId])

  useEffect(() => {
    if (exportFormat.length > 0 && initialFormatRef.current === null) {
      initialFormatRef.current = exportFormat[0]
    }
  }, [exportFormat])

  const trackFieldChange = (currentReport, currentFormat) => {
    const initialReport = initialReportRef.current
    const initialFormat = initialFormatRef.current

    if (!initialReport || !initialFormat) return

    const initialValues = {
      selectedReport: initialReport,
      selectedFormat: initialFormat?.key
    }

    const currentValues = {
      selectedReport: currentReport || '',
      selectedFormat: currentFormat?.key || ''
    }

    trackInteraction.trackPageFields(currentValues, initialValues, 'reportGenerator')
  }

  const cycleFormat = () => {
    const nextIndex = (formatIndex + 1) % exportFormat.length
    const nextFormat = exportFormat[nextIndex]
    setFormatIndex(nextIndex)
    setReport(prev => {
      const updated = { ...prev, selectedFormat: nextFormat }
      trackFieldChange(updated.selectedReport, nextFormat)

      return updated
    })
  }

  const handleReportChange = (e, newValue) => {
    setReport(prev => {
      const updated = { ...prev, selectedReport: newValue }
      trackFieldChange(newValue, updated.selectedFormat)

      return updated
    })
  }

  const handlePreviewClick = async () => {
    if (!report.selectedReport) return

    trackInteraction('reportGenerator')

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
          onChange={handleReportChange}
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
