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
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import CheckbookForm from './forms/CheckbookForm'
import { formatDateDefault } from 'src/lib/date-helper'

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
      height: 500,
      title: _labels.checkbook
    })
  }

  const del = async obj => {
    try {
      await postRequest({
        extension: CashBankRepository.CACheckbook.del,
        record: JSON.stringify(obj)
      })
      invalidate()
      toast.success(platformLabels.Deleted)
    } catch (exception) {}
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
