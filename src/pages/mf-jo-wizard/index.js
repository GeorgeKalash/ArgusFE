import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import { useDocumentTypeProxy } from 'src/hooks/documentReferenceBehaviors'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { SystemFunction } from 'src/resources/SystemFunction'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import JobOrderWizardForm from './Forms/JobOrderWizardForm'

const JobOrderWizard = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: ManufacturingRepository.JobOrderWizard.page,
      parameters: `_filter=&_startAt=${_startAt}&&_pageSize=${_pageSize}`
    })

    if (response && response?.list) {
      response.list = response?.list?.map(item => ({
        ...item,
        producedWeight: item.pcs * item.avgWeight
      }))
    }

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithSearch({ qry }) {
    const response = await getRequest({
      extension: ManufacturingRepository.JobOrderWizard.snapshot,
      parameters: `_filter=${qry}`
    })

    if (response && response?.list) {
      response.list = response?.list?.map(item => ({
        ...item,
        producedWeight: item.pcs * item.avgWeight
      }))
    }

    return response
  }

  const {
    query: { data },
    labels,
    search,
    clear,
    paginationParameters,
    refetch,
    access,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ManufacturingRepository.JobOrderWizard.page,
    datasetId: ResourceIds.JobOrderWizard,
    search: {
      searchFn: fetchWithSearch
    }
  })

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.JobOrderWizard,
    action: openForm,
    hasDT: false
  })

  const add = async () => {
    await proxyAction()
  }

  const columns = [
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'date',
      headerName: labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'jobRef',
      headerName: labels.jobRef,
      flex: 1
    },
    {
      field: 'sfItemSku',
      headerName: labels.semiFinishedSku,
      flex: 1
    },
    {
      field: 'sfItemName',
      headerName: labels.sfItemName,
      flex: 1
    },
    {
      field: 'pcs',
      headerName: labels.producedPcs,
      flex: 1,
      type: 'number'
    },
    {
      field: 'producedWeight',
      headerName: labels.producedWeight,
      flex: 1,
      type: 'number'
    },
    {
      field: 'statusName',
      headerName: labels.status,
      flex: 1
    }
  ]

  const edit = obj => {
    openForm(obj?.recordId)
  }

  function openForm(recordId) {
    stack({
      Component: JobOrderWizardForm,
      props: {
        labels,
        recordId,
        maxAccess: access
      },
      width: 1000,
      height: 700,
      title: labels.JobOrderWizard
    })
  }

  const del = async obj => {
    await postRequest({
      extension: ManufacturingRepository.JobOrderWizard.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          onAdd={add}
          maxAccess={access}
          onSearch={search}
          onSearchClear={clear}
          labels={labels}
          inputSearch={true}
        />
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

export default JobOrderWizard
