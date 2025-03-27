import Table from 'src/components/Shared/Table'
import { useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import toast from 'react-hot-toast'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import ComponentForm from './ComponentForm'
import { Grid } from '@mui/material'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import WindowToolbar from 'src/components/Shared/WindowToolbar'

const ComponentBOM = ({ store, labels }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  const columns = [
    {
      field: 'sku',
      headerName: labels.sku,
      flex: 1
    },
    {
      field: 'itemName',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'qty',
      headerName: labels.qty,
      flex: 1,
      type: 'number'
    },
    {
      field: 'percentage',
      headerName: labels.percentage,
      flex: 1
    },
    {
      field: 'costPct',
      headerName: labels.costPCT,
      flex: 1
    }
  ]

  async function fetchGridData() {
    const response = await getRequest({
      extension: ManufacturingRepository.Component.qry,
      parameters: `_bomId=${recordId}`
    })

    if (!response.list) return response

    const totalQty = response.list.reduce((qtySum, row) => qtySum + (parseFloat(row.baseQty) || 0), 0)

    response.list = response.list.map(billItem => ({
      ...billItem,
      percentage: totalQty > 0 ? `%${((billItem.baseQty * 100) / totalQty).toFixed(3)}` : '0%',
      costPct: billItem.costPct != null ? `%${billItem.costPct.toFixed(5)}` : null
    }))

    return response
  }

  const {
    query: { data },
    labels: _labels,
    invalidate,
    access
  } = useResourceQuery({
    enabled: !!recordId,
    datasetId: ResourceIds.BillOfMaterials,
    queryFn: fetchGridData,
    endpointId: ManufacturingRepository.Component.qry
  })

  const totalQty = data?.list.reduce((qtySum, row) => {
    const qtyValue = parseFloat(row.baseQty) || 0

    return qtySum + qtyValue
  }, 0)

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj)
  }

  const maxSeqNo = data ? data.list.reduce((acc, item) => Math.max(acc, item.seqNo), 0) + 1 : 0

  function openForm(obj) {
    stack({
      Component: ComponentForm,
      props: {
        labels: _labels,
        recordId: obj?.bomId,
        bomId: recordId,
        muId: obj?.muId,
        access,
        seqNo: obj?.seqNo ?? maxSeqNo,
        store
      },
      width: 750,
      height: 500,
      title: _labels.Component
    })
  }

  const del = async obj => {
    await postRequest({
      extension: ManufacturingRepository.Component.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  const handleSubmit = async () => {
    const res = {
      bomId: recordId,
      components: data.list.map(billItem => ({
        ...billItem,
        costPct: typeof billItem.costPct === 'string' ? parseFloat(billItem.costPct.replace('%', '')) : billItem.costPct
      }))
    }

    await postRequest({
      extension: ManufacturingRepository.Component.set2,
      record: JSON.stringify(res)
    }).then(() => {
      toast.success(platformLabels.Updated)
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={'recordId'}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          pagination={false}
          maxAccess={access}
        />
      </Grow>
      <Fixed>
        <Grid container sx={{ p: 2 }}>
          <Grid item xs={3}>
            <CustomNumberField name='totalQty' label={labels.totalQty} value={totalQty} readOnly />
          </Grid>
        </Grid>
      </Fixed>
      <Fixed>
        <WindowToolbar isSaved={true} onSave={handleSubmit} smallBox={true} />
      </Fixed>
    </VertLayout>
  )
}

export default ComponentBOM
