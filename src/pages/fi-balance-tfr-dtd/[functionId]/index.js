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
import { ControlContext } from 'src/providers/ControlContext'
import { Router } from 'src/lib/useRouter'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import BalanceTransferDTDForm from './form/BalanceTransferDTDForm'

const BalanceTransferDTD = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { stack } = useWindow()

  const { functionId } = Router()

  async function fetchGridData(options = {}) {
    const {
      pagination: { _startAt = 0, _pageSize = 50 }
    } = options

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
    paginationParameters,
    invalidate,
    refetch
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
      field: 'crossAccountBalanceTransfer',
      headerName: labels.crossAccountBalanceTransfer,
      type: 'checkbox',
      flex: 1
    },
    {
      field: 'plantName',
      headerName: labels.plant,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj?.dtId)
  }

  const del = async obj => {
    await postRequest({
      extension: FinancialRepository.FIDocTypeDefaults.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  function openForm(recordId) {
    stack({
      Component: BalanceTransferDTDForm,
      props: {
        labels,
        functionId,
        recordId,
        maxAccess: access
      },
      width: 500,
      height: 360,
      title: labels.doctypeDefault
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

export default BalanceTransferDTD
