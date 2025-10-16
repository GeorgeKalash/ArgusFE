import { Box } from '@mui/material'
import React, { useContext, useEffect, useState, forwardRef, useImperativeHandle, useRef } from 'react'
import { useForm } from 'src/hooks/form'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomButton from './CustomButton'
import { ControlContext } from 'src/providers/ControlContext'

const ImageUpload = forwardRef(
  (
    {
      resourceId,
      error,
      seqNo,
      recordId,
      width = 140,
      height = 140,
      customWidth,
      customHeight,
      disabled = false,
      isAbsolutePath = false,
      parentImage
    },
    ref
  ) => {
    const hiddenInputRef = useRef(null)
    const readerRef = useRef(null)
    const SavedImageInfo = useRef({})

    const { getRequest, postRequest } = useContext(RequestsContext)
    const { platformLabels } = useContext(ControlContext)
    const [image, setImage] = useState('')

    const parentRecordId = parentImage?.recordId
    const parentResourceId = parentImage?.resourceId
    const { formik } = useForm({ initialValues: {} })
    useImperativeHandle(ref, () => ({ submit }))

    const submit = () => {
      if (disabled) return
      const currentRecordId = ref?.current?.value || recordId
      if (isAbsolutePath) {
        if (formik?.values?.file?.name || formik.values.url) {
          const payload = {
            ...formik.values,
            fileName: formik?.values?.file?.name || formik.values.url,
            resourceId,
            recordId: currentRecordId
          }

          return postRequest({
            extension: SystemRepository.Attachment.set2,
            record: JSON.stringify(payload),
            file: formik.values?.file
          }).then(res => {
            getData(currentRecordId)

            return res
          })
        }

        if (!image && SavedImageInfo.current?.fileName && !formik.values?.fileName) {
          return postRequest({
            extension: SystemRepository.Attachment.del,
            record: JSON.stringify(SavedImageInfo.current)
          }).then(res => {
            getData(currentRecordId)

            return res
          })
        }

        return
      }
      if (formik.values?.file) {
        const payload = {
          ...formik.values,
          recordId: currentRecordId
        }

        return postRequest({
          extension: SystemRepository.Attachment.set,
          record: JSON.stringify(payload),
          file: formik.values?.file
        }).then(res => {
          getData(currentRecordId)

          return res
        })
      }

      if (!image && SavedImageInfo.current?.url && !formik.values?.url) {
        return postRequest({
          extension: SystemRepository.Attachment.del,
          record: JSON.stringify(SavedImageInfo.current),
          file: SavedImageInfo.current?.url
        }).then(res => {
          getData(currentRecordId)

          return res
        })
      }
    }

    const handleClick = () => {
      if (!disabled) hiddenInputRef.current.click()
    }

    const handleInputImageChange = event => {
      const file = event?.target?.files?.[0]
      if (!file) return

      const fileSizeInKB = Math.round(file.size / 1024)
      if (fileSizeInKB > 500) {
        alert('Allowed PNG or JPEG. Max size of 500KB.')

        return
      }

      if (readerRef.current) {
        readerRef.current.onloadend = null
        readerRef.current.abort?.()
      }

      const lastModified = new Date(file.lastModifiedDate)
      const formattedDate = `${lastModified.getDate()}/${lastModified.getMonth() + 1}/${lastModified.getFullYear()}`

      formik.setValues({
        resourceId,
        recordId,
        seqNo: 0,
        fileName: file.name,
        folderId: null,
        folderName: null,
        date: formattedDate,
        url: null,
        file
      })

      const reader = new FileReader()
      readerRef.current = reader

      reader.onloadend = e => {
        setImage(e.target.result)
      }
      reader.readAsDataURL(file)
    }

    const handleInputImageReset = () => {
      formik.setValues({})
      setImage('')
    }

    const getData = async currentRecordId => {
      const updatedRecordId = currentRecordId || recordId
      if (!resourceId) return
      if (isAbsolutePath && updatedRecordId) {
        const result = await getRequest({
          extension: SystemRepository.Attachment.get2,
          parameters: `_resourceId=${resourceId}&_seqNo=${seqNo}&_recordId=${updatedRecordId}`
        })

        const record = result?.record || {}
        formik.setValues({ ...record, resourceId })
        SavedImageInfo.current = { ...record, resourceId }

        setImage(record?.fileName ? `${record.fileName}?t=${Date.now()}` : '')

        return
      } else {
        if (!parentRecordId && !updatedRecordId) return

        const effectiveResourceId = parentResourceId || resourceId

        const result = await getRequest({
          extension: SystemRepository.Attachment.get,
          parameters: `_resourceId=${effectiveResourceId}&_seqNo=${seqNo}&_recordId=${
            parentRecordId || updatedRecordId
          }`
        })

        const record = result?.record || {}
        formik.setValues({ ...record, resourceId: effectiveResourceId })
        SavedImageInfo.current = { ...record, resourceId: effectiveResourceId }

        setImage(record?.url || '')
      }
    }

    useEffect(() => {
      if (parentRecordId || recordId) getData()
      else handleInputImageReset()
    }, [parentRecordId, recordId])

    return (
      <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
        <img
          src={image || '/images/emptyPhoto.jpg'}
          alt=''
          style={{
            width: customWidth || width,
            height: customHeight || height,
            objectFit: 'contain',
            border: error && '2px solid #F44336'
          }}
          onClick={handleClick}
          onError={e => {
            e.currentTarget.src = '/images/emptyPhoto.jpg'
          }}
        />
        <Box>
          <input
            hidden
            type='file'
            ref={hiddenInputRef}
            onChange={handleInputImageChange}
            accept='image/png, image/jpeg, image/jpg'
            disabled={disabled}
          />
          <CustomButton
            onClick={handleInputImageReset}
            label={platformLabels.Clear}
            color='#F44336'
            image='clear.png'
            disabled={disabled}
          />
        </Box>
      </Box>
    )
  }
)

export default ImageUpload
