import { Box } from '@mui/material'
import React, { useContext, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { useRef } from 'react'
import { useForm } from 'src/hooks/form'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomButton from './CustomButton'
import { ControlContext } from 'src/providers/ControlContext'

const ImageUpload = forwardRef(
  ({ resourceId, error, seqNo, recordId, width = 140, height = 140, customWidth, customHeight, rerender }, ref) => {
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
    const uniqueRecord = recordId || ref?.current?.value

    useEffect(() => {
      if (rerender || uniqueRecord) {
        getData()
      }
    }, [uniqueRecord, rerender])

    async function getData() {
      const result = await getRequest({
        extension: SystemRepository.Attachment.get,
        parameters: `_resourceId=${resourceId}&_seqNo=${seqNo}&_recordId=${rerender || uniqueRecord}`
      })
      setInitialData(result?.record)
    }

    const handleClick = () => {
      hiddenInputRef.current.click()
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
          recordId: uniqueRecord,
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
      if (formik.values?.file) {
        const obj = { ...formik.values, recordId: ref.current.value || recordId }

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
    useImperativeHandle(ref, () => ({
      submit
    }))

    return (
      <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
        <img
          src={`${
            image ||
            (formik?.values?.url && formik?.values?.url + `?${new Date().getTime()}`) ||
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
        />
        <Box>
          <input
            hidden
            type='file'
            ref={hiddenInputRef}
            onChange={handleInputImageChange}
            accept='image/png, image/jpeg, image/jpg'
          />
          <CustomButton
            onClick={handleInputImageReset}
            label={platformLabels.Clear}
            color='#F44336'
            image='clear.png'
          />
        </Box>
      </Box>
    )
  }
)

export default ImageUpload
