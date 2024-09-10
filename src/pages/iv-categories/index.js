import { useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { Button, Grid, Tooltip } from '@mui/material'
import { useWindow } from 'src/windows'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import PreviewReport from 'src/components/Shared/PreviewReport'
import { ControlContext } from 'src/providers/ControlContext'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CategoryWindow from './window/CategoryWindow'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'

const Category = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const [selectedReport, setSelectedReport] = useState(null)
  const [reportStore, setReportStore] = useState([])

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    try {
      const response = await getRequest({
        extension: InventoryRepository.Category.qry,
        parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=&_name=&_params=`
      })

      return { ...response, _startAt: _startAt }
    } catch (error) {}
  }

  const {
    query: { data },
    labels: _labels,
    invalidate,
    paginationParameters,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: InventoryRepository.Category.qry,
    datasetId: ResourceIds.IvCategories
  })

  const columns = [
    {
      field: 'caRef',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'parentName',
      headerName: _labels.parentCat,
      flex: 1
    },
    {
      field: 'measurementName',
      headerName: _labels.measurementSchedule,
      flex: 1
    },
    ,
    {
      field: 'nraRef',
      headerName: _labels.nra,
      flex: 1
    },
    {
      field: 'taxName',
      headerName: _labels.vatSchedule,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const del = async obj => {
    try {
      await postRequest({
        extension: InventoryRepository.Category.del,
        record: JSON.stringify(obj)
      })
      invalidate()
      toast.success(platformLabels.Deleted)
    } catch (error) {}
  }

  function openForm(recordId) {
    stack({
      Component: CategoryWindow,
      props: {
        labels: _labels,
        recordId: recordId,
        maxAccess: access
      },
      width: 800,
      height: 600,
      title: _labels.categories
    })
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  useEffect(() => {
    getReportLayout()
  }, [ResourceIds.IvCategories])

  useEffect(() => {
    if (reportStore.length > 0) {
      setSelectedReport(reportStore[0])
    } else {
      setSelectedReport(null)
    }
  }, [reportStore])

  const getReportLayout = () => {
    setReportStore([])
    if (ResourceIds.IvCategories) {
      var parameters = `_resourceId=${ResourceIds.IvCategories}`
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
          globalStatus={false}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          refetch={refetch}
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default Category