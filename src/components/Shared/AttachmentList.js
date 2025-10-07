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
import { Box } from '@mui/material'
import useSetWindow from 'src/hooks/useSetWindow'
import CustomButton from '../Inputs/CustomButton'
import FolderForm from './FolderForm'
import { useError } from 'src/error'

const AttachmentList = ({ resourceId, recordId, window }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const [maxSeqNo, setMaxSeqNo] = useState(0)
  const { stack: stackError } = useError()

  useSetWindow({ title: platformLabels.Attachment, window })

  const {
    query: { data },
    labels,
    access,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: `${SystemRepository.Attachment.qry}::r=${resourceId}::rec=${recordId ?? 0}`,
    datasetId: ResourceIds.SystemAttachments
  })

  const columns = [
    {
      field: 'fileName',
      headerName: labels.reference,
      width: 'auto',
      flex: 1
    },
    {
      field: 'folderName',
      headerName: labels.folderName,
      flex: 1,
      width: 'auto'
    },
    {
      width: 100,
      headerName: '',
      field: 'download',
      cellRenderer: row => {
        return (
          <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
            <CustomButton
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
              label={platformLabels.Download}
              image='download-black.png'
              color='transparent'
            />
          </Box>
        )
      }
    },
    {
      width: 100,
      field: 'preview',
      headerName: '',
      cellRenderer: row => {
        const handlePreview = () => {
          const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg']

          const isImage = imageExtensions.some(ext => row.data.url?.toLowerCase().includes(ext))

          if (!isImage) {
            return stackError({
              message: platformLabels.errorPreview
            })
          } else {
            const url = row.data.url
            globalThis.open(url, '_blank')
          }
        }

        return (
          <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
            <CustomButton
              onClick={handlePreview}
              label={platformLabels.Preview}
              image='preview-black.png'
              color='transparent'
            />
          </Box>
        )
      }
    },
    {
      width: 100,
      field: 'folder-plus-icon',
      headerName: '',
      cellRenderer: row => {
        return (
          <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
            <CustomButton
              onClick={() => {
                stack({
                  Component: FolderForm,
                  props: {
                    labels,
                    values: row.data,
                    maxAccess: access,
                    recordId,
                    resourceId
                  },
                  width: 400,
                  height: 200,
                  title: labels.folderName
                })
              }}
              label={platformLabels.Plus}
              image='folder-plus-icon.png'
              color='transparent'
            />
          </Box>
        )
      }
    }
  ]

  async function fetchGridData() {
    return await getRequest({
      extension: SystemRepository.Attachment.qry,
      parameters: `_resourceId=${resourceId}&_recordId=${recordId}`
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
      }
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
        <GridToolbar maxAccess={access} labels={labels} onAdd={add} />
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

AttachmentList.width = 1000
AttachmentList.height = 650

export default AttachmentList
