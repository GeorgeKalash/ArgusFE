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
import Tree from 'src/components/Shared/Tree'
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
  const [dataTree, setDataTree] = useState([])

  const {
    query: { data },
    labels: _labels,
    paginationParameters,
    invalidate,
    filterBy,
    clearFilter,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: InventoryRepository.Category.page,
    datasetId: ResourceIds.Category,

    filter: {
      endpointId: InventoryRepository.Category.snapshot,
      filterFn: fetchWithSearch
    }
  })

  async function fetchWithSearch({ filters }) {
    return filters.qry
      ? await getRequest({
          extension: InventoryRepository.Category.snapshot,
          parameters: `_filter=${filters.qry}`
        })
      : await fetchGridData()
  }

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: InventoryRepository.Category.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_name=`
    })

    return { ...response, _startAt: _startAt }
  }

  useEffect(() => {
    ;(async () => {
      const response = await getRequest({
        extension: InventoryRepository.Category.page,
        parameters: `_pageSize=1000&_startAt=0&_name=`
      })
      setDataTree(response)
    })()
  }, [])

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
    await postRequest({
      extension: InventoryRepository.Category.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
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
  }, [])

  useEffect(() => {
    if (reportStore.length > 0) {
      setSelectedReport(reportStore[0])
    } else {
      setSelectedReport(null)
    }
  }, [reportStore])

  const getReportLayout = () => {
    setReportStore([])

    getRequest({
      extension: SystemRepository.ReportLayout,
      parameters: `_resourceId=${ResourceIds.Category}`
    }).then(res => {
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
  }

  function onTreeClick() {
    stack({
      Component: Tree,
      props: {
        data: dataTree
      },
      width: 500,
      height: 400,
      title: _labels.tree
    })
  }

  const actions = [
    {
      key: 'Tree',
      condition: true,
      onClick: onTreeClick,
      disabled: false
    }
  ]

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          onSearch={value => {
            filterBy('qry', value)
          }}
          onSearchClear={() => {
            clearFilter('qry')
          }}
          inputSearch={true}
          actions={actions}
          onTree={onTreeClick}
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
                      selectedReport: selectedReport,
                      outerGrid: true
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
