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
import { Box, Button } from '@mui/material'

const AttachmentList = ({ resourceId, recordId }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const [maxSeqNo, setMaxSeqNo] = useState(0)

  const {
    query: { data },
    labels: _labels,
    access,
    invalidate
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
    },
    {
      width: 100,
      headerName: _labels.preview,
      cellRenderer: row => {
        return (
          <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
            <Button
              onClick={() => {
                const url = row.data.url
                window.open(url, '_blank')
              }}
              variant='contained'
              sx={{
                mr: 1,
                backgroundColor: 'transparent',
                '&:hover': {
                  backgroundColor: 'transparent',
                  opacity: 0.8
                },
                width: '50px',
                height: '35px',
                objectFit: 'contain',
                minWidth: '30px'
              }}
            >
              <img src='/images/buttonsIcons/preview-black.png' alt='Preview' />
            </Button>
          </Box>
        )
      }
    },
    {
      width: 100,
      headerName: _labels.download,
      cellRenderer: row => {
        return (
          <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
            <Button
              onClick={() => {
                const url = row.data.url
                fetch(url)
                  .then(response => response.blob())
                  .then(blob => {
                    const link = document.createElement('a')
                    link.href = URL.createObjectURL(blob)
                    link.download = row.data.fileName
                    link.click()
                  })
              }}
              variant='contained'
              sx={{
                mr: 1,
                backgroundColor: 'transparent',
                '&:hover': {
                  backgroundColor: 'transparent',
                  opacity: 0.8
                },
                width: '50px',
                height: '35px',
                objectFit: 'contain',
                minWidth: '30px'
              }}
            >
              <img src='/images/buttonsIcons/download-black.png' alt='Download' />
            </Button>
          </Box>
        )
      }
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
        recordId,
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
