import React, { useContext, useState, useEffect } from 'react'
import { ResourceIds } from 'src/resources/ResourceIds'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ControlContext } from 'src/providers/ControlContext'
import { useWindow } from 'src/windows'
import toast from 'react-hot-toast'
import { Box } from '@mui/material'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import Table from 'src/components/Shared/Table'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import FileForm from './Forms/FileForm'
import FolderForm from './Forms/FolderForm'
import CustomButton from 'src/components/Inputs/CustomButton'
import { useError } from 'src/error'
import AttachmentPreview from './Forms/AttachmentPreview'

const CompFile = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const [maxSeqNo, setMaxSeqNo] = useState(0)

  const {
    query: { data },
    labels,
    paginationParameters,
    refetch,
    access,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SystemRepository.Attachment.qry,
    datasetId: ResourceIds.Files
  })

  const columns = [
    {
      field: 'fileName',
      headerName: labels.reference,
      flex: 1,
      width: 'auto'
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
              message: labels.preview
            })
          } else {
            stack({
              Component: AttachmentPreview,
              props: {
                url: row.data.url,
                labels
              },
              width: 500,
              height: 400
            })
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
                    maxAccess: access
                  },
                  width: 400,
                  height: 200,
                  title: labels.FolderForm
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

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: SystemRepository.Attachment.qry,
      parameters: `_resourceId=${ResourceIds.Files}&_recordId=0&_filter=&_size=${_pageSize}&_startAt=${_startAt}&_classId=0`
    })

    return { ...response, _startAt: _startAt }
  }

  useEffect(() => {
    if (data?.list) {
      const maxSeq = Math.max(...data.list.map(item => item.seqNo), 0)
      setMaxSeqNo(maxSeq + 1)
    }
  }, [data])

  function openForm() {
    stack({
      Component: FileForm,
      props: {
        recordId: 0,
        resourceId: ResourceIds.Files,
        seqNo: maxSeqNo,
        labels
      },
      width: 800,
      height: 500,
      title: platformLabels.Attachment
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
          rowId={['recordId']}
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

export default CompFile
