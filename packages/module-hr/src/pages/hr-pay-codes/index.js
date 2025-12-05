import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { PayrollRepository } from '@argus/repositories/src/repositories/PayrollRepository'
import PayCodesForm from './Forms/PayCodesForm'

const PayCodes = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: PayrollRepository.Paycode.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=`
    })
  }

  const {
    query: { data },
    labels,
    invalidate,
    refetch,
    paginationParameters,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: PayrollRepository.Paycode.qry,
    datasetId: ResourceIds.PayCode
  })

  const columns = [
    {
      field: 'name',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'payCode',
      headerName: labels.PayCode,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  function openForm(payCode) {
    stack({
      Component: PayCodesForm,
      props: {
        labels,
        recordId: payCode,
        maxAccess: access
      },
      width: 500,
      height: 300,
      title: labels.PayCode
    })
  }

  const edit = obj => {
    openForm(obj.payCode)
  }

  const del = async obj => {
    await postRequest({
      extension: PayrollRepository.Paycode.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access} labels={labels} />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          pageSize={50}
          refetch={refetch}
          paginationType='api'
          paginationParameters={paginationParameters}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default PayCodes
