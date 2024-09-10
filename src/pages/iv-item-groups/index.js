import { useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Button, Grid, Tooltip } from '@mui/material'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import PreviewReport from 'src/components/Shared/PreviewReport'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useWindow } from 'src/windows'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import IvItemGroupsForm from './form/IvItemGroupsForm'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'

const IvItemGroups = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const [selectedReport, setSelectedReport] = useState(null)
  const [reportStore, setReportStore] = useState([])

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
    endpointId: InventoryRepository.Group.page,
    datasetId: ResourceIds.InventoryGroup,

    filter: {
      endpointId: InventoryRepository.Group.snapshot,
      filterFn: fetchWithSearch
    }
  })

  async function fetchWithSearch({ filters, pagination }) {
    return filters.qry
      ? await getRequest({
          extension: InventoryRepository.Group.snapshot,
          parameters: `_filter=${filters.qry}`
        })
      : await fetchGridData(pagination)
  }

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: InventoryRepository.Group.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}`
    })

    return { ...response, _startAt: _startAt }
  }

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
    }
  ]

  const add = () => {
    openForm()
  }

  const del = async obj => {
    try {
      await postRequest({
        extension: InventoryRepository.Group.del,
        record: JSON.stringify(obj)
      })
      invalidate()
      toast.success(platformLabels.Deleted)
    } catch (error) {}
  }

  function openForm(recordId) {
    stack({
      Component: IvItemGroupsForm,
      props: {
        labels: _labels,
        recordId: recordId,
        maxAccess: access
      },
      width: 600,
      height: 500,
      title: _labels.itemGroup
    })
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  useEffect(() => {
    getReportLayout()
  }, [ResourceIds.InventoryGroup])

  useEffect(() => {
    if (reportStore.length > 0) {
      setSelectedReport(reportStore[0])
    } else {
      setSelectedReport(null)
    }
  }, [reportStore])

  const getReportLayout = () => {
    setReportStore([])
    if (ResourceIds.InventoryGroup) {
      var parameters = `_resourceId=${ResourceIds.InventoryGroup}`
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
          onSearch={value => {
            filterBy('qry', value)
          }}
          onSearchClear={() => {
            clearFilter('qry')
          }}
          inputSearch={true}
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

export default IvItemGroups
