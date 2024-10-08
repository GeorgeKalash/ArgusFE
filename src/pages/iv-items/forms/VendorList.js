import { useContext } from 'react'
import { useWindow } from 'src/windows'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { PurchaseRepository } from 'src/repositories/PurchaseRepository'
import VendorForm from './VendorForm'

const VendorList = ({ store, labels, maxAccess }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId } = store
  const { platformLabels } = useContext(ControlContext)

  const { stack } = useWindow()

  async function fetchGridData() {
    const response = await getRequest({
      extension: PurchaseRepository.PriceList.qry,
      parameters: `&_itemId=${recordId}`
    })

    return response
  }

  const {
    query: { data },
    labels: _labels,
    refetch
  } = useResourceQuery({
    enabled: !!recordId,
    datasetId: ResourceIds.PriceList,
    queryFn: fetchGridData,
    endpointId: PurchaseRepository.PriceList.qry
  })

  const columns = [
    {
      field: 'vendorName',
      headerName: labels.vendorName,
      flex: 1
    },
    {
      field: 'currencyRef',
      headerName: labels.currency,
      flex: 1
    },
    {
      field: 'baseLaborPrice',
      headerName: labels.baseLabor,
      flex: 1
    },
    {
      field: 'priceList',
      headerName: labels.priceList,
      flex: 1
    },
    {
      field: 'markdown',
      headerName: labels.markdown,
      flex: 1
    },
    {
      field: 'sku',
      headerName: labels.sku,
      flex: 1
    },
    {
      field: 'isPreferred',
      headerName: labels.isPreffered,
      type: 'checkbox',
      flex: 1
    },
    {
      field: 'deliveryLeadDays',
      headerName: labels.dld,
      flex: 1
    }
  ]

  const delVendor = async obj => {
    await postRequest({
      extension: PurchaseRepository.PriceList.del,
      record: JSON.stringify(obj)
    })
    refetch()

    toast.success(platformLabels.Deleted)
  }

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj)
  }

  function openForm(record) {
    stack({
      Component: VendorForm,
      props: {
        labels: labels,
        recordId: recordId ? recordId : null,
        record: record,
        maxAccess,
        store
      },

      title: labels.vendor
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={maxAccess} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['vendorId', 'currencyId']}
          isLoading={false}
          pageSize={50}
          onEdit={edit}
          pagination={false}
          onDelete={delVendor}
          maxAccess={maxAccess}
          height={200}
        />
      </Grow>
    </VertLayout>
  )
}

export default VendorList
