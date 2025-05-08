import { useContext, useState } from 'react'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import { Grid } from '@mui/material'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import CustomButton from 'src/components/Inputs/CustomButton'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useEffect } from 'react'
import useResourceParams from 'src/hooks/useResourceParams'
import JobOrderWindow from '../mf-job-orders/window/JobOrderWindow'

const AssetsDescription = () => {
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels, userDefaultsData } = useContext(ControlContext)

  const { stack } = useWindow()
  const workCenterId = parseInt(userDefaultsData?.list?.find(obj => obj.key === 'workCenterId')?.value) || null
  const [workCenter, setWorkCenter] = useState({ workCenterId: workCenterId, name: '' })

  const {
    query: { data },
    refetch,
    labels,
    access,
    paginationParameters
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ManufacturingRepository.workInProcess.wipJOB,
    datasetId: ResourceIds.JobsInProcess
  })

  const { labels: _labels, access: maxAccess } = useResourceParams({
    datasetId: ResourceIds.MFJobOrders
  })

  useEffect(() => {
    ;(async function () {
      if (workCenterId) {
        const { record } = await getRequest({
          extension: ManufacturingRepository.WorkCenter.get,
          parameters: `_recordId=${workCenterId}`
        })

        setWorkCenter({ workCenterId: workCenterId, name: record.name })
      }
    })()
  }, [workCenterId])

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options
    if (workCenter?.workCenterId) {
      const response = await getRequest({
        extension: ManufacturingRepository.workInProcess.wipJOB,
        parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_workCenterId=${workCenter?.workCenterId}&_params=`
      })

      return { ...response, _startAt: _startAt }
    } else {
      return { list: [], _startAt: _startAt }
    }
  }

  const columns = [
    {
      field: 'reference',
      headerName: labels.jobRef,
      flex: 1
    },
    {
      field: 'sku',
      headerName: labels.sku,
      flex: 1
    },
    {
      field: 'itemName',
      headerName: labels.itemName,
      flex: 1
    },
    {
      field: 'routingName',
      headerName: labels.routing,
      flex: 1
    },
    {
      field: 'designRef',
      headerName: labels.design,
      flex: 1
    },
    {
      field: 'seqName',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'wcName',
      headerName: labels.workCenter,
      flex: 1
    },
    {
      field: 'qty',
      headerName: labels.qty,
      flex: 1,
      type: 'number'
    },
    {
      field: 'pcs',
      headerName: labels.pcs,
      flex: 1,
      type: 'number'
    },
    {
      field: 'statusName',
      headerName: labels.status,
      flex: 1
    }
  ]

  function openForm(recordId) {
    stack({
      Component: JobOrderWindow,
      props: {
        labels: _labels,
        access: maxAccess,
        recordId
      },
      width: 1150,
      height: 700,
      title: _labels.jobOrder
    })
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  return (
    <VertLayout>
      <Fixed>
        <Grid container spacing={2} padding={2}>
          <Grid item xs={4}>
            <ResourceLookup
              endpointId={ManufacturingRepository.WorkCenter.snapshot}
              valueField='name'
              name='workCenterId'
              label={labels.workCenter}
              valueShow='name'
              maxAccess={access}
              formObject={workCenter}
              secondDisplayField={false}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              onChange={(event, newValue) => {
                setWorkCenter({
                  workCenterId: newValue?.recordId,
                  name: newValue?.name
                })
              }}
            />
          </Grid>
          <Grid item xs={2}>
            <CustomButton
              variant='contained'
              label={platformLabels.Preview}
              onClick={() => refetch()}
              color='#231f20'
            />
          </Grid>
        </Grid>
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          isLoading={false}
          pageSize={50}
          paginationType='api'
          deleteConfirmationType={'strict'}
          paginationParameters={paginationParameters}
          refetch={refetch}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default AssetsDescription
