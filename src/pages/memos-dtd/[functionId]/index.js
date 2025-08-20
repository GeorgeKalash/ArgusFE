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
import { FinancialRepository } from 'src/repositories/FinancialRepository'

import MemosDtdForm from './form/MemosDtdForm'
import { ControlContext } from 'src/providers/ControlContext'
import { Router } from 'src/lib/useRouter'

const Financial = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { stack } = useWindow()

  const { functionId } = Router()

  async function fetchGridData(options = {}) {
    const {
      pagination: { _startAt = 0, _pageSize = 50 }
    } = options

    const response = await getRequest({
      extension: FinancialRepository.FIDocTypeDefaults.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_functionId=${functionId}`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels: _labels,
    access,
    paginationParameters,
    invalidate,
    refetch
  } = useResourceQuery({
    endpointId: FinancialRepository.FIDocTypeDefaults.qry,
    datasetId: ResourceIds.FIDocTypeDefaults,

    filter: {
      filterFn: fetchGridData,
      default: { functionId }
    }
  })

  const columns = [
    {
      field: 'dtName',
      headerName: _labels.doctype,
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
      Component: MemosDtdForm,
      props: {
        labels: _labels,
        functionId,
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
          paginationParameters={paginationParameters}
          refetch={refetch}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default Financial
