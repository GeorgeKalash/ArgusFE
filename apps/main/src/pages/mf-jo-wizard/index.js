import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useDocumentTypeProxy } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import JobOrderWizardForm from './Forms/JobOrderWizardForm'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'

const JobOrderWizard = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params = [] } = options

    const response = await getRequest({
      extension: ManufacturingRepository.JobOrderWizard.page,
      parameters: `_filter=&_startAt=${_startAt}&&_pageSize=${_pageSize}&_params=${params}`
    })

    if (response && response?.list) {
      response.list = response?.list?.map(item => ({
        ...item,
        producedWeight: item.pcs * item.avgWeight
      }))
    }

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    let response = null
    if (filters.qry) {
      response = await getRequest({
        extension: ManufacturingRepository.JobOrderWizard.snapshot,
        parameters: `_filter=${filters.qry}`
      })
      if (response && response?.list) {
        response.list = response?.list?.map(item => ({
          ...item,
          producedWeight: item.pcs * item.avgWeight
        }))
      }
    } else response = fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })

    return response
  }

  const {
    query: { data },
    filterBy,
    refetch,
    labels,
    access,
    paginationParameters,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ManufacturingRepository.JobOrderWizard.page,
    datasetId: ResourceIds.JobOrderWizard,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.JobOrderWizard,
    action: openForm
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
        access
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
        <RPBGridToolbar onAdd={add} maxAccess={access} filterBy={filterBy} reportName={'MFJOZ'} />
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
