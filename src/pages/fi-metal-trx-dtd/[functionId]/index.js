import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import { useRouter } from 'next/router'
import { ControlContext } from 'src/providers/ControlContext'
import { SystemFunction } from 'src/resources/SystemFunction'
import MetalTransactionDTDForm from '../Forms/MetalTransactionDTD'
import { FinancialRepository } from 'src/repositories/FinancialRepository'

const MetalTransactionDTD = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const router = useRouter()
  const { functionId } = router.query

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: FinancialRepository.FIDocTypeDefaults.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_functionId=${functionId}`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels,
    access,
    invalidate,
    refetch,
    paginationParameters
  } = useResourceQuery({
    endpointId: FinancialRepository.FIDocTypeDefaults.page,
    datasetId: ResourceIds.FIDocTypeDefaults,
    filter: {
      filterFn: fetchGridData,
      default: { functionId }
    }
  })

  const columns = [
    {
      field: 'dtName',
      headerName: labels.doctype,
      flex: 1
    },
    {
      field: 'plantName',
      headerName: labels.plant,
      flex: 1
    },
    {
      field: 'siteRef',
      headerName: labels.siteRef,
      flex: 1
    },
    {
      field: 'siteName',
      headerName: labels.site,
      flex: 1
    }
  ]

  const edit = obj => {
    openForm(obj)
  }

  function openForm(record) {
    stack({
      Component: MetalTransactionDTDForm,
      props: {
        labels: labels,
        recordId: record?.dtId,
        maxAccess: access,
        functionId
      },
      width: 600,
      height: 380,
      title: (functionId == SystemFunction.MetalReceiptVoucher ? labels.metalTransactionReceipt: labels.metalTransactionPayment)
    })
  }

  const add = async () => {
    openForm()
  }

  const del = async obj => {
    await postRequest({
      extension: FinancialRepository.FIDocTypeDefaults.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
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
          rowId={['dtId']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          paginationParameters={paginationParameters}
          refetch={refetch}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default MetalTransactionDTD
