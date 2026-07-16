import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { BusinessPartnerRepository } from '@argus/repositories/src/repositories/BusinessPartnerRepository'
import { useInvalidate, useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import GroupLegalDocumentForm from './forms/GroupLegalDocumentForm'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

const GroupLegalDocument = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: BusinessPartnerRepository.GroupLegalDocument.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    paginationParameters,
    refetch,
    labels,
    access,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: BusinessPartnerRepository.GroupLegalDocument.page,
    datasetId: ResourceIds.GroupLegalDocument
  })

  const columns = [
    {
      field: 'groupName',
      headerName: labels.group,
      flex: 1
    },
    {
      field: 'incName',
      headerName: labels.categoryId,
      flex: 1
    },
    {
      field: 'required',
      headerName: labels.required,
      flex: 1,
      type: 'checkbox'
    },
    {
      field: 'mandatory',
      headerName: labels.mandatory,
      flex: 1,
      type: 'checkbox'
    }
  ]

  const edit = obj => {
    openForm(obj)
  }

  const add = () => {
    openForm()
  }

  function openForm(record) {
    stack({
      Component: GroupLegalDocumentForm,
      props: {
        labels,
        record,
        maxAccess: access,
        recordId: record ? record.groupId * 10000 + record.incId : null
      },
      width: 600,
      height: 370,
      title: labels.groupLegalDocument
    })
  }

  const del = async obj => {
    await postRequest({
      extension: BusinessPartnerRepository.GroupLegalDocument.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access} />{' '}
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['groupId', 'incId']}
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

export default GroupLegalDocument

BusinessPartnerRepository.CategoryID.qry
BusinessPartnerRepository.Group.qry
