import Table from '@argus/shared-ui/src/components/Shared/Table'
import { useContext } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import toast from 'react-hot-toast'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import ComponentForm from './ComponentForm'
import { Grid } from '@mui/material'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import Form from '@argus/shared-ui/src/components/Shared/Form'

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

  const totalQty = data?.list?.reduce((qtySum, row) => {
    const qtyValue = parseFloat(row.baseQty) || 0

    return qtySum + qtyValue
  }, 0)

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj)
  }

  const maxSeqNo = data ? data.list?.reduce((acc, item) => Math.max(acc, item.seqNo), 0) + 1 : 0

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
        store,
        components: data?.list,
        calculateCostPct
      },
      width: 750,
      height: 500,
      title: _labels.Component
    })
  }

  const del = async obj => {
    const updatedData = data?.list?.filter(row => row.seqNo !== obj.seqNo)

    data.list = calculateCostPct(updatedData)

    await postRequest({
      extension: ManufacturingRepository.Component.set2,
      record: JSON.stringify({ components: data?.list, bomId: recordId })
    })

    invalidate()
    toast.success(platformLabels.Deleted)
  }

  const calculateCostPct = billItems => {
    const totalCost = billItems?.reduce((sum, row) => {
      const currentCost = row.currentCost == null ? 0 : parseFloat(row.currentCost)
      const baseQty = row.baseQty == null ? 0 : parseFloat(row.baseQty)

      return sum + currentCost * baseQty
    }, 0)

    billItems = billItems?.map(billItem => {
      const currentCost = billItem.currentCost == null ? 0 : parseFloat(billItem.currentCost)
      const baseQty = billItem.baseQty == null ? 0 : parseFloat(billItem.baseQty)

      return {
        ...billItem,
        costPct: totalCost === 0 ? 0 : (currentCost * baseQty * 100) / totalCost
      }
    })

    return billItems
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
    <Form onSave={handleSubmit} maxAccess={access} fullSize>
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
      </VertLayout>
    </Form>
  )
}

export default ComponentBOM
