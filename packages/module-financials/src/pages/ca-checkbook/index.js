import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { CashBankRepository } from '@argus/repositories/src/repositories/CashBankRepository'
import CheckbookForm from './forms/CheckbookForm'

const Checkbook = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: CashBankRepository.CACheckbook.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels: _labels,
    paginationParameters,
    refetch,
    access,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: CashBankRepository.CACheckbook.page,
    datasetId: ResourceIds.Checkbook
  })

  const columns = [
    {
      field: 'bankAccountName',
      headerName: _labels.bankAccountName,
      flex: 1
    },
    {
      field: 'bankAccountRef',
      headerName: _labels.bankAccountRef,
      flex: 1
    },
    {
      field: 'size',
      headerName: _labels.size,
      flex: 1
    },
    {
      field: 'firstCheckNo',
      headerName: _labels.firstCheckNo,
      flex: 1
    },
    {
      field: 'lastCheckNo',
      headerName: _labels.lastCheckNo,
      flex: 1
    },
    {
      field: 'issueDate',
      headerName: _labels.issueDate,
      flex: 1,
      type: 'date'
    }
  ]

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  function openForm(recordId) {
    stack({
      Component: CheckbookForm,
      props: {
        labels: _labels,
        recordId,
        maxAccess: access
      },
      width: 500,
      height: 450,
      title: _labels.checkbook
    })
  }

  const del = async obj => {
    await postRequest({
      extension: CashBankRepository.CACheckbook.del,
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
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          paginationType='api'
          paginationParameters={paginationParameters}
          refetch={refetch}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default Checkbook
