import { useState, useContext, useEffect } from 'react'
import { Button, Grid, Tooltip } from '@mui/material'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useWindow } from 'src/windows'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import SitesForm from './forms/SitesForm'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import PreviewReport from 'src/components/Shared/PreviewReport'

const Sites = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)
  const [selectedReport, setSelectedReport] = useState(null)
  const [reportStore, setReportStore] = useState([])

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: InventoryRepository.Site.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels: _labels,
    access,
    search,
    clear,
    refetch,
    paginationParameters
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: InventoryRepository.Site.page,
    datasetId: ResourceIds.Sites,

    search: {
      endpointId: InventoryRepository.Site.snapshot,
      searchFn: fetchWithSearch
    }
  })

  async function fetchWithSearch({ qry }) {
    const response = await getRequest({
      extension: InventoryRepository.Site.snapshot,
      parameters: `_filter=${qry}`
    })

    return response
  }

  const invalidate = useInvalidate({
    endpointId: InventoryRepository.Site.page
  })

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },
    ,
    {
      field: 'plantName',
      headerName: _labels.plant,
      flex: 1
    },
    {
      field: 'costCenterName',
      headerName: _labels.costCenter,
      flex: 1
    }
  ]

  const del = async obj => {
    await postRequest({
      extension: InventoryRepository.Site.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  const add = () => {
    openForm()
  }

  function openForm(recordId) {
    stack({
      Component: SitesForm,
      props: {
        labels: _labels,
        recordId: recordId ? recordId : null,
        maxAccess: access
      },
      width: 500,
      height: 580,
      title: _labels.sites
    })
  }

  useEffect(() => {
    getReportLayout()
  }, [ResourceIds.Sites])

  useEffect(() => {
    if (reportStore.length > 0) {
      setSelectedReport(reportStore[0])
    } else {
      setSelectedReport(null)
    }
  }, [reportStore])

  const getReportLayout = () => {
    setReportStore([])
    if (ResourceIds.Sites) {
      var parameters = `_resourceId=${ResourceIds.Sites}`
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
    <VertLayout>
      <Fixed>
        <GridToolbar
          onAdd={add}
          maxAccess={access}
          onSearch={search}
          onSearchClear={clear}
          labels={_labels}
          inputSearch={true}
          previewReport={ResourceIds.Sites}
          rightSection={
            <Grid item sx={{ display: 'flex', mr: 2 }}>
              <CustomComboBox
                label={platformLabels.SelectReport}
                valueField='caption'
                displayField='layoutName'
                store={reportStore}
                value={selectedReport}
                onChange={(e, newValue) => setSelectedReport(newValue)}
                sx={{ width: 250 }}
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
          }
        />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          refetch={refetch}
          maxAccess={access}
          pageSize={50}
          paginationParameters={paginationParameters}
          paginationType='api'
        />
      </Grow>
    </VertLayout>
  )
}

export default Sites
