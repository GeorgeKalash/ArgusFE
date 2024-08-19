import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import RVDocTypeDefaultsForm from './form/RVDocTypeDefaultsForm'
import { SystemFunction } from 'src/resources/SystemFunction'
import { ControlContext } from 'src/providers/ControlContext'

const RVDocTypeDefaults = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: FinancialRepository.FIDocTypeDefaults.qry,

      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=&_functionId=${SystemFunction.ReceiptVoucher}`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels: _labels,
    paginationParameters,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: FinancialRepository.FIDocTypeDefaults.qry,
    datasetId: ResourceIds.FIDocTypeDefaults
  })

  const invalidate = useInvalidate({
    endpointId: FinancialRepository.FIDocTypeDefaults.qry
  })

  const columns = [
    {
      field: 'dtName',
      headerName: _labels.doctype,
      flex: 1
    },
    {
      field: 'cashAccountName',
      headerName: _labels.cashAccount,
      flex: 1
    },
    {
      field: 'plantName',
      headerName: _labels.plant,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj)
  }

  const del = async obj => {
    await postRequest({
      extension: FinancialRepository.FIDocTypeDefaults.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  function openForm(record) {
    stack({
      Component: RVDocTypeDefaultsForm,
      props: {
        labels: _labels,
        recordId: record?.dtId,
        maxAccess: access
      },
      width: 500,
      height: 360,
      title: _labels.doctypeDefault
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
          refetch={refetch}
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default RVDocTypeDefaults
