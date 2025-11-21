import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import DocumentTypeDefaultForm from './forms/DocumentTypeDefaultForms'

const DocumentTypeDefault = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    try {
      const response = await getRequest({
        extension: SaleRepository.DocumentTypeDefault.qry,
        parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=&_functionId=5107`
      })

      return { ...response, _startAt: _startAt }
    } catch (error) {}
  }

  const {
    query: { data },
    labels: _labels,
    invalidate,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SaleRepository.DocumentTypeDefault.qry,
    datasetId: ResourceIds.DocumentTypeDefault
  })

  const columns = [
    {
      field: 'dtName',
      headerName: _labels.documentType,
      flex: 1
    },
    {
      field: 'commitItems',
      headerName: _labels.commitItems,
      type: 'checkbox',
      flex: 1
    },
    {
      field: 'disableSKULookup',
      headerName: _labels.dsl,
      type: 'checkbox',
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const del = async obj => {
    try {
      await postRequest({
        extension: SaleRepository.DocumentTypeDefault.del,
        record: JSON.stringify(obj)
      })
      invalidate()
      toast.success(platformLabels.Deleted)
    } catch (error) {}
  }

  function openForm(record) {
    stack({
      Component: DocumentTypeDefaultForm,
      props: {
        labels: _labels,
        recordId: record?.dtId,
        maxAccess: access
      },
      width: 600,
      height: 500,
      title: _labels.dtDefault
    })
  }

  const edit = obj => {
    openForm(obj)
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
          paginationType='client'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default DocumentTypeDefault
