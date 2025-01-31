import { useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import Table from 'src/components/Shared/Table'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import GridToolbar from 'src/components/Shared/GridToolbar'
import cancelIcon from '../../../public/images/TableIcons/cancel.png'
import Image from 'next/image'
import { Box, Grid, IconButton } from '@mui/material'
import toast from 'react-hot-toast'
import { ControlContext } from 'src/providers/ControlContext'
import CancelDialog from 'src/components/Shared/CancelDialog'
import { useWindow } from 'src/windows'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'

const GateKeeper = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const {
    query: { data },
    labels,
    refetch,
    access,
    filterBy,
    filters,
    clearFilter
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ManufacturingRepository.LeanProductionPlanning.preview,
    datasetId: ResourceIds.GateKeeper,
    filter: {
      endpointId: ManufacturingRepository.LeanProductionPlanning.snapshot,
      filterFn: fetchWithFilter
    }
  })

  async function fetchGridData() {
    const response = await getRequest({
      extension: ManufacturingRepository.LeanProductionPlanning.preview,
      parameters: `_status=2`
    })

    response.list = response?.list?.map(item => ({
      ...item,
      balance: item.qty - (item.qtyProduced ?? 0)
    }))

    return response
  }

  async function fetchWithFilter({ filters }) {
    const res = await getRequest({
      extension: ManufacturingRepository.LeanProductionPlanning.snapshot,
      parameters: `_filter=${filters.qry ?? ''}&_status=${filters.status ?? 2}`
    })
    res.list = res?.list?.map(item => ({
      ...item,
      balance: item.qty - (item.qtyProduced ?? 0)
    }))

    return res
  }

  const columns = [
    {
      field: 'functionName',
      headerName: labels.function,
      flex: 2
    },
    {
      field: 'sku',
      headerName: labels.sku,
      flex: 2
    },
    {
      field: 'qty',
      headerName: labels.qty,
      flex: 1,
      type: 'number'
    },
    {
      field: 'qtyProduced',
      headerName: labels.produced,
      flex: 1,
      type: 'number'
    },
    {
      field: 'balance',
      headerName: labels.balance,
      flex: 1,
      type: 'number'
    },
    {
      field: 'itemName',
      headerName: labels.itemName,
      flex: 2
    },
    {
      field: 'date',
      label: labels[6],
      flex: 2,
      type: 'date'
    },
    (!filters?.status || filters?.status == 2) && {
      flex: 0.5,
      headerName: 'Cancel',
      cellRenderer: row => {
        const { data } = row

        if (data.qty == data.producedQty) return

        return (
          <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
            <IconButton size='small' onClick={() => openCancel(data)}>
              <Image src={cancelIcon} width={18} height={18} alt={labels.cancel} />
            </IconButton>
          </Box>
        )
      }
    }
  ].filter(Boolean)

  const onCancel = async data => {
    await postRequest({
      extension: ManufacturingRepository.LeanProductionPlanning.cancel,
      record: JSON.stringify(data)
    })
    refetch()
    toast.success(platformLabels.Cancelled)
  }

  function openCancel(data) {
    stack({
      Component: CancelDialog,
      props: {
        open: [true, {}],
        fullScreen: false,
        onConfirm: () => onCancel(data)
      },
      width: 450,
      height: 170,
      title: platformLabels.Cancel
    })
  }

  const onChange = value => {
    if (value) filterBy('status', value)
    else clearFilter('status')
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          maxAccess={access}
          onSearch={value => {
            filterBy('qry', value)
          }}
          onSearchClear={() => {
            clearFilter('qry')
          }}
          labels={labels}
          inputSearch={true}
          leftSection={
            <Grid item sx={{ display: 'flex', width: '300px' }}>
              <ResourceComboBox
                datasetId={DataSets.LEAN_STATUS}
                name='status'
                label={labels.status}
                valueField='key'
                displayField='value'
                values={{
                  status: filters?.status || 2
                }}
                onChange={(event, newValue) => {
                  onChange(newValue?.key)
                }}
              />
            </Grid>
          }
        />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          isLoading={false}
          pageSize={2000}
          paginationType='client'
          refetch={refetch}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default GateKeeper
