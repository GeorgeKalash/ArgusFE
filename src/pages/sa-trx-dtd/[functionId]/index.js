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

import { useRouter } from 'next/router'
import { useDocumentTypeProxy } from 'src/hooks/documentReferenceBehaviors'
import { SaleRepository } from 'src/repositories/SaleRepository'
import DocumentTypeDefaultForm from '../form/DocumentTypeDefaultForm'
import { ControlContext } from 'src/providers/ControlContext'

const CAadjustment = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { stack } = useWindow()

  const router = useRouter()
  const { functionId } = router.query

  async function fetchGridData(options = {}) {
    const {
      pagination: { _startAt = 0, _pageSize = 50 }
    } = options

    const response = await getRequest({
      extension: SaleRepository.DocumentTypeDefault.page,
      parameters: `_startAt=${_startAt}&_params=&_pageSize=50&_sortBy=reference&_functionId=${functionId}`
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
    endpointId: SaleRepository.DocumentTypeDefault.page,
    datasetId: ResourceIds.DocumentTypeDefault,

    filter: {
      filterFn: fetchGridData,
      default: { functionId }
    }
  })

  const columns = [
    {
      field: 'commitItems',
      headerName: _labels.commitItems,
      flex: 1
    },
    {
      field: 'dtName',
      headerName: _labels.documentType,
      flex: 1
    },

    {
      field: 'plantName',
      headerName: _labels.plant,
      flex: 1
    },
    {
      field: 'siteRef',
      headerName: _labels.siteRef,
      flex: 1
    },
    {
      field: 'siteName',
      headerName: _labels.site,
      flex: 1
    }
  ]

  const edit = obj => {
    openForm(obj?.dtId)
  }

  function openForm(dtId) {
    stack({
      Component: DocumentTypeDefaultForm,
      props: {
        labels: _labels,
        dtId,
        maxAccess: access,
        functionId
      },
      width: 800,
      height: 600,
      title: _labels.dtDefault
    })
  }

  const { proxyAction } = useDocumentTypeProxy({
    functionId: functionId,
    action: openForm
  })

  const add = async () => {
    await proxyAction()
  }

  const del = async obj => {
    await postRequest({
      extension: SaleRepository.DocumentTypeDefault.del,
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

export default CAadjustment
