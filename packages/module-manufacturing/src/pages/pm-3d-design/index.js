import { useContext } from 'react'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import toast from 'react-hot-toast'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useDocumentTypeProxy } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'
import { ProductModelingRepository } from '@argus/repositories/src/repositories/ProductModelingRepository'
import ThreeDDesignForm from '@argus/shared-ui/src/components/Shared/Forms/ThreeDDesignForm'

const ThreeDDesign = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params = [] } = options

    const response = await getRequest({
      extension: ProductModelingRepository.ThreeDDesign.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=&_params=${params}`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    if (filters.qry)
      return await getRequest({
        extension: ProductModelingRepository.ThreeDDesign.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    else return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
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
    endpointId: ProductModelingRepository.ThreeDDesign.page,
    datasetId: ResourceIds.ThreeDDesign,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const columns = [
    {
      field: 'dtName',
      headerName: labels.doctype,
      flex: 1
    },
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
      field: 'sourceName',
      headerName: labels.source,
      flex: 1
    },
    {
      field: 'sketchRef',
      headerName: labels.sketchRef,
      flex: 1,
      valueLink: {
        resourceId: ResourceIds.Sketch,
        props: row => ({
          recordId: row.sketchId,
        })
      }
    },
    {
      field: 'designerName',
      headerName: labels.designerName,
      flex: 1
    },
    {
      field: 'itemGroupName',
      headerName: labels.itemGroup,
      flex: 1
    },
    {
      field: 'collectionName',
      headerName: labels.collection,
      flex: 1
    },
    {
      field: 'metalRef',
      headerName: labels.purity,
      flex: 1
    },
    {
      field: 'castingName',
      headerName: labels.castingType,
      flex: 1
    },
    {
      field: 'fileReference',
      headerName: labels.threeDFile,
      flex: 1
    },
    {
      field: 'rsName',
      headerName: labels.releaseStatus,
      flex: 1
    },
    {
      field: 'wipName',
      headerName: labels.wipName,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: labels.status,
      flex: 1
    }
  ]

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.ThreeDDesign,
    action: async () => {
      openForm()
    }
  })

  const add = async () => {
    proxyAction()
  }

  const edit = obj => {
    openForm(obj)
  }

  async function openForm(obj) {
    stack({
      Component: ThreeDDesignForm,
      props: {
        recordId: obj?.recordId
      }
    })
  }

  const del = async obj => {
    await postRequest({
      extension: ProductModelingRepository.ThreeDDesign.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar onAdd={add} maxAccess={access} filterBy={filterBy} reportName={'PM3DD'} />
      </Fixed>
      <Grow>
        <Table
          name='3dDesignTable'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          refetch={refetch}
          deleteConfirmationType={'strict'}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
          paginationParameters={paginationParameters}
          paginationType='api'
        />
      </Grow>
    </VertLayout>
  )
}

export default ThreeDDesign
