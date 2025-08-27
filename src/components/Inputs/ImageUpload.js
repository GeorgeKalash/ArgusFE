import { Box } from '@mui/material'
import React, { useContext, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { useRef } from 'react'
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
    const hiddenInputRef = useRef()
    const { getRequest, postRequest } = useContext(RequestsContext)
    const { platformLabels } = useContext(ControlContext)
    const [image, setImage] = useState()
    const [initialValues, setInitialData] = useState({})

    const { formik } = useForm({
      enableReinitialize: true,
      validateOnChange: true,
      initialValues
    })
    const parentRecordId = parentImage?.recordId
    const parentResourceId = parentImage?.resourceId

    useEffect(() => {
      if (parentRecordId || recordId) {
        getData()
      } else handleInputImageReset()
    }, [parentImage, recordId])

    async function getData() {
      if (!resourceId) return
      if (isAbsolutePath && recordId) {
        const result = await getRequest({
          extension: SystemRepository.Attachment.get2,
          parameters: `_resourceId=${resourceId}&_seqNo=${seqNo}&_recordId=${recordId}`
        })
        setInitialData({ ...result?.record, resourceId })
        setImage(result?.record?.fileName)
      } else {
        const result = await getRequest({
          extension: SystemRepository.Attachment.get,
          parameters: `_resourceId=${parentResourceId || resourceId}&_seqNo=${seqNo}&_recordId=${
            parentRecordId || recordId
          }`
        })

        setInitialData({ ...result?.record, resourceId: parentResourceId || resourceId })
        setImage(result?.record?.url)
      }
    }

    const handleClick = () => {
      if (!disabled) hiddenInputRef.current.click()
    }

    const handleInputImageChange = event => {
      const file = event?.target?.files[0]
      if (file) {
        const dateObject = new Date(file.lastModifiedDate)
        const year = dateObject.getFullYear()
        const month = dateObject.getMonth() + 1
        const day = dateObject.getDate()

        let data = {
          resourceId: resourceId,
          recordId,
          seqNo: 0,
          fileName: file.name,
          folderId: null,
          folderName: null,
          date: day + '/' + month + '/' + year,
          url: null,
          file: null
        }
        const fileSizeInKB = Math.round(file.size / 1024)
        if (parseInt(fileSizeInKB) > 500) {
          alert('Allowed PNG or JPEG. Max size of 500KB.')

          return
        }
        data = { ...data, file } //binary
        formik.setValues(data)
        const reader = new FileReader()
        reader.onloadend = e => {
          setImage(e.target.result)
        }
        reader.readAsDataURL(file)
      }
    }

    const handleInputImageReset = () => {
      formik.setValues({})
      setImage('')
    }

    const submit = () => {
      if (disabled) return
      if (isAbsolutePath) {
        if (formik?.values?.file?.name || formik.values.url) {
          const obj = {
            ...formik.values,
            fileName: formik?.values?.file?.name || formik.values.url,
            resourceId,
            recordId: ref?.current?.value || recordId
          }

          return postRequest({
            extension: SystemRepository.Attachment.set2,
            record: JSON.stringify(obj),
            file: formik.values?.file
          }).then(res => {
            return res
          })
        } else if (!image && initialValues?.fileName && !formik.values?.fileName) {
          return postRequest({
            extension: SystemRepository.Attachment.del,
            record: JSON.stringify(initialValues)
          }).then(res => {
            return res
          })
        }
      } else {
        if (formik.values?.file) {
          const obj = { ...formik.values, recordId: ref?.current?.value || recordId }

          return postRequest({
            extension: SystemRepository.Attachment.set,
            record: JSON.stringify(obj),
            file: formik.values?.file
          }).then(res => {
            return res
          })
        } else if (!image && initialValues?.url && !formik.values?.url) {
          return postRequest({
            extension: SystemRepository.Attachment.del,
            record: JSON.stringify(initialValues),
            file: initialValues?.url
          }).then(res => {
            return res
          })
        }
      }
    }
    useImperativeHandle(ref, () => ({
      submit
    }))

    return (
      <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
        <img
          src={`${
            image ||
            (formik?.values?.fileName && formik?.values?.fileName + `?${new Date().getTime()}`) ||
            '/images/emptyPhoto.jpg'
          }`}
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
