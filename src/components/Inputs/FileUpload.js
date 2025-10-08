import { Box, Typography, IconButton, Button, Grid } from '@mui/material'
import React, { useContext, useEffect, useState, forwardRef, useImperativeHandle, useRef } from 'react'
import { useForm } from 'src/hooks/form'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import DeleteIcon from '@mui/icons-material/Delete'
import { ControlContext } from 'src/providers/ControlContext'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useInvalidate } from 'src/hooks/resource'

const FileUpload = forwardRef(({ resourceId, seqNo, recordId }, ref) => {
  const hiddenInputRef = useRef()
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [files, setFiles] = useState([])
  const [initialValues, setInitialData] = useState({})

  const invalidate = useInvalidate({
    endpointId: `${SystemRepository.Attachment.qry}::r=${resourceId}::rec=${recordId ?? 0}`
  })

  const { formik } = useForm({
    validateOnChange: true,
    initialValues
  })

  const uniqueRecord = recordId || ref?.current?.value

  useEffect(() => {
    if (uniqueRecord) {
      getData()
    }
  }, [uniqueRecord])

  async function getData() {
    const result = await getRequest({
      extension: SystemRepository.Attachment.get,
      parameters: `_resourceId=${resourceId}&_seqNo=${seqNo}&_recordId=${uniqueRecord}`
    })

    setInitialData(result?.record)
  }

  const handleClick = () => {
    hiddenInputRef.current.click()
  }

  const handleInputFileChange = event => {
    const selectedFiles = event?.target?.files
    if (selectedFiles?.length) {
      let newFiles = []

      for (let i = 0; i < selectedFiles.length; i++) {
        const selectedFile = selectedFiles[i]
        const dateObject = new Date(selectedFile.lastModifiedDate)
        const year = dateObject.getFullYear()
        const month = dateObject.getMonth() + 1
        const day = dateObject.getDate()

        let data = {
          resourceId: resourceId,
          recordId: uniqueRecord,
          seqNo: null,
          fileName: selectedFile.name,
          folderId: null,
          folderName: null,
          date: day + '/' + month + '/' + year,
          url: null,
          file: selectedFile,
          folderId: null
        }

        const fileSizeInKB = Math.round(selectedFile.size / 1024)
        if (parseInt(fileSizeInKB) > 500) {
          alert(platformLabels.MaxFileSize)

          continue
        }

        newFiles.push(data)
      }

      setFiles(prevFiles => [...prevFiles, ...newFiles])

      formik.setValues(prev => ({
        ...prev,
        files: [...files, ...newFiles]
      }))
    }
  }

  const handleInputFileReset = () => {
    formik.setValues({})
    setFiles([])
  }

  const handleRemoveFile = fileIndex => {
    const updatedFiles = files.filter((_, index) => index !== fileIndex)
    setFiles(updatedFiles)

    formik.setValues(prev => ({
      ...prev,
      files: updatedFiles
    }))
  }

  const submit = async () => {
    if (!files.length && initialValues?.url && !formik.values?.url) {
      return postRequest({
        extension: SystemRepository.Attachment.del,
        record: JSON.stringify(initialValues),
        file: initialValues?.url
      })
    }

    if (!files.length) return

    const recId = ref?.current?.value ?? recordId

    const folderResult = await getRequest({
      extension: SystemRepository.Folders.qry,
      parameters: `_params=&_filter=`
    })
    const defaultFolderId = folderResult?.list.length > 0 ? folderResult?.list[0].recordId : null

    return files
      .reduce((promise, file) => {
        return promise.then(async () => {
          await postRequest({
            extension: SystemRepository.Attachment.set,
            record: JSON.stringify({
              resourceId: file.resourceId,
              recordId: recId,
              seqNo: file.seqNo,
              fileName: file.fileName,
              date: file.date,
              url: file.url,
              folderId: file.folderId ?? defaultFolderId
            }),
            file: file.file
          })
        })
      }, Promise.resolve())
      .then(res => {
        invalidate()

        return res
      })
  }

  useImperativeHandle(ref, () => ({
    submit
  }))

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          borderRadius: '4px',
          flex: 1,
          border: 'grey dashed 1px',
          cursor: 'pointer'
        }}
      >
        {files.length > 0 && (
          <Box
            sx={{
              width: '95%',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              flex: 0,
              margin: 3,
              borderRadius: '4px'
            }}
          >
            {files.map((file, index) => (
              <Box
                key={index}
                sx={{
                  border: 'black solid 1px',
                  borderRadius: '4px',
                  p: 1,
                  mb: 1
                }}
              >
                <Grid container alignItems='center' spacing={1} padding={1}>
                  <Grid item xs={8}>
                    <Typography variant='body2' component='span'>
                      {file.fileName}
                    </Typography>
                    <Typography variant='body2' component='span' sx={{ ml: 1 }}>
                      ({Math.round(file.file.size / 1024)} KB)
                    </Typography>
                  </Grid>

                  <Grid item xs={3}>
                    <ResourceComboBox
                      endpointId={SystemRepository.Folders.qry}
                      name={`files[${index}].folderId`}
                      label={platformLabels.folder}
                      valueField='recordId'
                      displayField='name'
                      values={formik.values}
                      value={file.folderId ?? 1}
                      onChange={(_, newValue) => {
                        const newFolderId = newValue?.recordId || 1
                        setFiles(prev => {
                          const copy = [...prev]
                          copy[index] = { ...copy[index], folderId: newFolderId }

                          return copy
                        })
                        formik.setFieldValue(`files[${index}].folderId`, newFolderId)
                      }}
                    />
                  </Grid>

                  <Grid item xs={1}>
                    <IconButton onClick={() => handleRemoveFile(index)} size='small' sx={{ color: 'red' }}>
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Box>
        )}

        <Box sx={{ flex: 1, display: 'flex', width: '100%' }}>
          <input hidden type='file' ref={hiddenInputRef} onChange={handleInputFileChange} multiple />
          <Box
            onClick={handleClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              flex: 1
            }}
          >
            <span>{platformLabels.fileUpload}</span>
          </Box>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', width: '100%' }}>
        <Button
          onClick={handleInputFileReset}
          variant='contained'
          sx={{
            mr: 1,
            backgroundColor: '#f44336',
            '&:hover': {
              backgroundColor: '#f44336',
              opacity: 0.8
            },
            width: '50px',
            height: '35px',
            objectFit: 'contain',
            minWidth: '30px'
          }}
        >
          <img src={`/images/buttonsIcons/clear.png`} alt={'clear'} style={{ width: '20px', height: '20px' }} />
        </Button>
      </Box>
    </>
  )
})

export default FileUpload
