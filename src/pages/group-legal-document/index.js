import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import GroupLegalDocumentForm from './forms/GroupLegalDocumentForm'
import { useWindow } from 'src/windows'

const GroupLegalDocument = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: BusinessPartnerRepository.GroupLegalDocument.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    paginationParameters,
    refetch,
    labels: _labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: BusinessPartnerRepository.GroupLegalDocument.page,
    datasetId: ResourceIds.GroupLegalDocument
  })

  const invalidate = useInvalidate({
    endpointId: BusinessPartnerRepository.GroupLegalDocument.page
  })

  const columns = [
    {
      field: 'groupName',
      headerName: _labels.group,
      flex: 1
    },
    {
      field: 'incName',
      headerName: _labels.categoryId,
      flex: 1
    },
    {
      field: 'required',
      headerName: _labels.required,
      flex: 1,
      type: 'checkbox'
    },
    {
      field: 'mandatory',
      headerName: _labels.mandatory,
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
        labels: _labels,
        record,
        maxAccess: access,
        recordId: record ? record.groupId * 10000 + record.incId : null
      },
      width: 600,
      height: 370,
      title: _labels.groupLegalDocument
    })
  }

  const del = async obj => {
    await postRequest({
      extension: BusinessPartnerRepository.GroupLegalDocument.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
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

export default GroupLegalDocument

BusinessPartnerRepository.CategoryID.qry
BusinessPartnerRepository.Group.qry
