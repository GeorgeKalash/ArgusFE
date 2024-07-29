import { Button, Grid, Tooltip } from '@mui/material'
import { useState, useEffect, useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import PreviewReport from './PreviewReport'
import { useWindow } from 'src/windows'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomComboBox from '../Inputs/CustomComboBox'
import { ControlContext } from 'src/providers/ControlContext'

const PreviewReportToolbar = ({ previewReport }) => {
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const [selectedReport, setSelectedReport] = useState(null)
  const [reportStore, setReportStore] = useState([])

  useEffect(() => {
    getReportLayout()
  }, [previewReport])

  useEffect(() => {
    if (reportStore.length > 0) {
      setSelectedReport(reportStore[0])
    } else {
      setSelectedReport(null)
    }
  }, [reportStore])

  const getReportLayout = () => {
    setReportStore([])
    if (previewReport) {
      var parameters = `_resourceId=${previewReport}`
      getRequest({
        extension: SystemRepository.ReportLayout,
        parameters: parameters
      })
        .then(res => {
          if (res?.list) {
            const formattedReports = res.list.map(item => ({
              api_url: item.api,
              reportClass: item.instanceName,
              parameters: item.parameters,
              layoutName: item.layoutName,
              assembly: 'ArgusRPT.dll'
            }))
            setReportStore(formattedReports)
            if (formattedReports.length > 0) {
              setSelectedReport(formattedReports[0])
            }
          }
        })
        .catch(error => {})
    }
  }

  return (
    <Grid item sx={{ display: 'flex', mr: 2 }}>
      <CustomComboBox
        label={platformLabels.SelectReport}
        valueField='caption'
        displayField='layoutName'
        store={reportStore}
        value={selectedReport}
        onChange={(e, newValue) => setSelectedReport(newValue)}
        sx={{ width: 250 }}
        height={35}
        disableClearable
      />
      <Button
        variant='contained'
        disabled={!selectedReport}
        onClick={() =>
          stack({
            Component: PreviewReport,
            props: {
              selectedReport: selectedReport
            },
            width: 1000,
            height: 500,
            title: platformLabels.PreviewReport
          })
        }
        sx={{
          ml: 2,
          backgroundColor: '#231F20',
          '&:hover': {
            backgroundColor: '#231F20',
            opacity: 0.8
          },
          width: 'auto',
          height: '35px',
          objectFit: 'contain'
        }}
        size='small'
      >
        <Tooltip title={platformLabels.Preview}>
          <img src='/images/buttonsIcons/preview.png' alt={platformLabels.Preview} />
        </Tooltip>
      </Button>
    </Grid>
  )
}

export default PreviewReportToolbar
