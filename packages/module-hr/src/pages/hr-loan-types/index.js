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
import HrLoanForm from './forms/HrLoanForm'
import { LoanTrackingRepository } from '@argus/repositories/src/repositories/LoanTrackingRepository'

const HrLoanTypesPage = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: LoanTrackingRepository.LoanType.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=`
    })

    return { ...response, _startAt }
  }

  const {
    query: { data },
    labels,
    paginationParameters,
    refetch,
    invalidate,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: LoanTrackingRepository.LoanType.page,
    datasetId: ResourceIds.LoanTypes
  })

  const columns = [
    {
      field: 'reference',
      headerName: labels.Reference,
      flex: 1
    },
    {
      field: 'name',
      headerName: labels.Name,
      flex: 1
    },
    {
      field: 'ldValue',
      headerName: labels.payment,
      flex: 1
    },
    {
      field: 'ldName',
      headerName: labels.loan,
      flex: 1
    },
    {
      field: 'disableEditing',
      headerName: labels.disable,
      type: 'checkbox',
      flex: 1
    }
  ]

  const add = () => openForm()
  const edit = obj => openForm(obj?.recordId)

  function openForm(recordId) {
    stack({
      Component: HrLoanForm,
      props: { labels, recordId, maxAccess: access },
      width: 500,
      height: 400,
      title: labels.loanType
    })
  }

  const del = async obj => {
    await postRequest({
      extension: LoanTrackingRepository.LoanType.del,
      record: JSON.stringify(obj)
    })
    toast.success(platformLabels.Deleted)
    invalidate()
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

export default HrLoanTypesPage
