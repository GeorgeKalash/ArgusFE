import React, { useContext, useState, useEffect } from 'react'
import Table from './Table'
import { ResourceIds } from 'src/resources/ResourceIds'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from './Layouts/VertLayout'
import { Grow } from './Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { useWindow } from 'src/windows'
import { Fixed } from './Layouts/Fixed'
import GridToolbar from './GridToolbar'
import AttachmentForm from './AttachmentForm'
import toast from 'react-hot-toast'

const AttachmentList = ({ resourceId, recordId }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const [maxSeqNo, setMaxSeqNo] = useState(0)

  const {
    query: { data },
    labels: _labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SystemRepository.Attachment.qry,
    datasetId: ResourceIds.SystemAttachments
  })

  const columns = [
    {
      field: 'fileName',
      headerName: _labels.reference,
      flex: 1
    }
  ]

  async function fetchGridData() {
    return await getRequest({
      extension: SystemRepository.Attachment.qry,
      parameters: `_resourceId=${ResourceIds.SystemAttachments}&_recordId=${recordId}`
    })
  }

  useEffect(() => {
    if (data?.list) {
      const maxSeq = Math.max(...data.list.map(item => item.seqNo), 0)
      setMaxSeqNo(maxSeq + 1)
    }
  }, [data])
  function openForm() {
    stack({
      Component: AttachmentForm,
      props: {
        labels: _labels,
        recordId,
        maxAccess: access,
        resourceId,
        seqNo: maxSeqNo
      },
      width: 800,
      height: 500,
      title: _labels.Attachment
    })
  }

  const add = () => {
    openForm()
  }

  const del = async obj => {
    await postRequest({
      extension: SystemRepository.Attachment.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar maxAccess={access} labels={_labels} onAdd={add} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          onDelete={del}
          rowId={['seqNo']}
          isLoading={false}
          maxAccess={access}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

export default AttachmentList
