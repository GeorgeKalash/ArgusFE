import { Box } from '@mui/material'
import React, {
  useContext,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useRef
} from 'react'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useWindowDimensions } from '@argus/shared-domain/src/lib/useWindowDimensions'
import CustomButton from '../CustomButton'

const EMPTY_PHOTO =
  require('@argus/shared-ui/src/components/images/emptyPhoto.jpg').default.src

const css = `
.ImageUpload_container {
  display: flex;
  flex-direction: row;
  width: 100%;
  gap: 10px;
  align-items: stretch;
}

.ImageUpload_previewBox {
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  cursor: pointer;
}

.ImageUpload_previewImage {
  display: block;
  
}

.ImageUpload_bottomSection {
  flex: 0 0 auto;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 10px;
}
`

const ImageUpload = forwardRef(
  (
    {
      resourceId,
      error,
      seqNo,
      recordId,
      width,
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

    const { width: screenWidth } = useWindowDimensions()

    const scaleFactor = (() => {
      if (screenWidth >= 1680) return 1
      if (screenWidth >= 1600) return 0.9

      const minW = 1024
      const maxW = 1600
      const minScale = 0.7
      const maxScale = 0.92

      if (screenWidth <= minW) return minScale
      return (
        minScale +
        ((screenWidth - minW) / (maxW - minW)) * (maxScale - minScale)
      )
    })()

    const baseHeight = customHeight ?? height
    const baseWidth = customWidth ?? width ?? baseHeight

    const scaledHeight = baseHeight * scaleFactor
    const scaledWidth = baseWidth * scaleFactor

    useImperativeHandle(ref, () => ({ submit }))

    const submit = () => {
      if (disabled) return
      const currentRecordId = ref?.current?.value || recordId

      if (isAbsolutePath) {
        if (formik.values?.file?.name || formik.values.url) {
          const payload = {
            ...formik.values,
            fileName: formik.values.file?.name || formik.values.url,
            resourceId,
            recordId: currentRecordId
          }

          return postRequest({
            extension: SystemRepository.Attachment.set2,
            record: JSON.stringify(payload),
            file: formik.values?.file
          }).then(() => getData(currentRecordId))
        }

        if (!image && SavedImageInfo.current?.fileName && !formik.values?.fileName) {
          return postRequest({
            extension: SystemRepository.Attachment.del,
            record: JSON.stringify(SavedImageInfo.current)
          }).then(() => getData(currentRecordId))
        }

        return
      }

      if (formik.values?.file) {
        const payload = { ...formik.values, recordId: currentRecordId }

        return postRequest({
          extension: SystemRepository.Attachment.set,
          record: JSON.stringify(payload),
          file: formik.values?.file
        }).then(() => getData(currentRecordId))
      }

      if (!image && SavedImageInfo.current?.url && !formik.values?.url) {
        return postRequest({
          extension: SystemRepository.Attachment.del,
          record: JSON.stringify(SavedImageInfo.current),
          file: SavedImageInfo.current?.url
        }).then(() => getData(currentRecordId))
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
        alert(platformLabels.MaxFileSize)
        return
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
      reader.onloadend = e => setImage(e.target.result)
      reader.readAsDataURL(file)
    }

    const handleInputImageReset = () => {
      setImage('')
      formik.setValues({})
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
      }

      const effectiveResId = parentResourceId || resourceId
      const effectiveRecId = parentRecordId || updatedRecordId
      if (!effectiveRecId) return

      const result = await getRequest({
        extension: SystemRepository.Attachment.get,
        parameters: `_resourceId=${effectiveResId}&_seqNo=${seqNo}&_recordId=${effectiveRecId}`
      })

      const record = result?.record || {}
      formik.setValues({ ...record, resourceId: effectiveResId })
      SavedImageInfo.current = { ...record, resourceId: effectiveResId }

      setImage(record?.url ? `${record.url}?t=${Date.now()}` : '')
    }

    useEffect(() => {
      if (parentRecordId || recordId) getData()
      else handleInputImageReset()
    }, [parentRecordId, recordId])

    return (
      <>
        <style>{css}</style>

        <Box className="ImageUpload_container">
          <Box
            className="ImageUpload_previewBox"
            style={{
              width: '100%',
              maxWidth: scaledWidth,
              height: scaledHeight
            }}
            onClick={handleClick}
          >
            <img
              src={image || EMPTY_PHOTO}
              alt=""
              className="ImageUpload_previewImage"
              style={{
                border: error ? '2px solid #F44336' : 'none',
                ...(image
                  ? {
                      width: 'auto',
                      height: 'auto',
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }
                  : {
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    })
              }}
              onError={e => {
                e.currentTarget.src = EMPTY_PHOTO
              }}
            />
          </Box>

          <Box className="ImageUpload_bottomSection">
            <input
              hidden
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              ref={hiddenInputRef}
              onChange={handleInputImageChange}
              disabled={disabled}
            />

            <CustomButton
              onClick={handleInputImageReset}
              image="clear.png"
              tooltipText={platformLabels.Clear}
              color="#F44336"
              border="none"
              disabled={disabled}
            />
          </Box>
        </Box>
      </>
    )
  }
)

export default ImageUpload
