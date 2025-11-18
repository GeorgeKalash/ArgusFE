import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/components/Layouts/Grow'
import { useWindow } from '@argus/shared-providers/providers/windows'
import { useDocumentTypeProxy } from '@argus/shared-hooks/hooks/documentReferenceBehaviors'
import { SystemFunction } from '@argus/shared-domain/resources/SystemFunction'
import { ControlContext } from '@argus/shared-providers/providers/ControlContext'
import RPBGridToolbar from '@argus/shared-ui/components/Shared/RPBGridToolbar'
import { FoundryRepository } from '@argus/repositories/repositories/FoundryRepository'
import MetalSmeltingForm from './form/MetalSmeltingForm'

export default function MetalSmelting() {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params = [] } = options

    const response = await getRequest({
      extension: FoundryRepository.MetalSmelting.page,
      parameters: `_startAt=${_startAt}&_params=${params}&_pageSize=${_pageSize}`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    refetch,
    labels,
    filterBy,
    paginationParameters,
    access,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: FoundryRepository.MetalSmelting.page,
    datasetId: ResourceIds.MetalSmelting,
    filter: {
      filterFn: fetchWithSearch
    }
  })

  async function fetchWithSearch({ filters, pagination }) {
    if (filters?.qry) {
      return await getRequest({
        extension: FoundryRepository.MetalSmelting.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    } else {
      return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
    }
  }

  const columns = [
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'dtName',
      headerName: labels.docType,
      flex: 1
    },
    {
      field: 'date',
      headerName: labels.date,
      flex: 1,
      type: 'date'
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
      headerName: labels.siteName,
      flex: 1
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
      Component: MetalSmeltingForm,
      props: {
        labels,
        recordId,
        access
      },
      width: 1100,
      height: 670,
      title: labels.metalSmelting
    })
  }

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.MetalSmelting,
    action: openForm
  })

  const add = async () => {
    await proxyAction()
  }

  const del = async obj => {
    await postRequest({
      extension: FoundryRepository.MetalSmelting.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar onAdd={add} maxAccess={access} reportName={'FOTRX'} filterBy={filterBy} />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          deleteConfirmationType={'strict'}
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
