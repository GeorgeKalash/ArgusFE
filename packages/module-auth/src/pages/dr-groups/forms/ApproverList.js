import { useState, useContext, useEffect } from 'react'
import { Box, toast } from '@mui/material'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import ApproverForm from './ApproverForm'
import { DocumentReleaseRepository } from '@argus/repositories/src/repositories/DocumentReleaseRepository'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'

const ApproverList = ({ store, labels, maxAccess }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId } = store

  const { stack } = useWindow()

  async function fetchGridData() {
    const response = await getRequest({
      extension: DocumentReleaseRepository.GroupCode.qry,

      parameters: `_filter=&_groupId=${recordId}`
    })

    return response
  }

  const {
    query: { data },
    labels: _labels,

    refetch
  } = useResourceQuery({
    enabled: !!recordId,
    datasetId: ResourceIds.DRGroups,
    queryFn: fetchGridData,
    endpointId: DocumentReleaseRepository.GroupCode.qry
  })

  const columns = [
    { field: 'codeRef', headerName: labels.reference, flex: 1 },
    { field: 'codeName', headerName: labels.name, flex: 1 }
  ]

  const openForm = (recordId = null) => {
    stack({
      Component: ApproverForm,
      props: { labels, recordId, maxAccess, store },
      width: 500,
      height: 400,
      title: labels.approver
    })
  }

  const delApprover = async obj => {
    try {
      await postRequest({
        extension: DocumentReleaseRepository.GroupCode.del,
        record: JSON.stringify(obj)
      })
      refetch()
      toast.success('Record Deleted Successfully')
    } catch (error) {}
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={() => openForm()} maxAccess={maxAccess} />
      </Fixed>
      <Grow>
        <Table
          name='approver'
          columns={columns}
          gridData={data}
          rowId={['codeId']}
          pageSize={50}
          pagination={false}
          onDelete={obj => delApprover(obj)}
          maxAccess={maxAccess}
          height={200}
        />
      </Grow>
    </VertLayout>
  )
}

export default ApproverList
