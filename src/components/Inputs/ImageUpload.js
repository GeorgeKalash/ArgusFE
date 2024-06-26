import { Box } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import { useRef } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'

const ImageUpload = ({ name, value, onChange, resourceId, error, seqNo, recordId, setInitialData }) => {
  const hiddenInputRef = useRef()
  const { getRequest } = useContext(RequestsContext)

  const [image, setImage] = useState()

  useEffect(() => {
    getData()
  }, [])

  async function getData() {
    try {
      const result = await getRequest({
        extension: SystemRepository.Attachment.get,
        parameters: `_resourceId=${resourceId}&_seqNo=${seqNo}&_recordId=${recordId}`
      })
      setInitialData(prevData => ({
        ...prevData,
        [name]: result?.record
      }))
    } catch (e) {}
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
        recordId: 1,
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
      onChange(name, data)
      const reader = new FileReader()
      reader.onloadend = e => {
        setImage(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleInputImageReset = () => {
    onChange(name, '')
    setImage('')
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
      <img
        src={`${image || (value?.url && value?.url + `?${new Date().getTime()}`) || '/images/emptyPhoto.jpg'}`}
        alt=''
        style={{
          width: 140,
          height: 100,
          objectFit: 'cover',
          marginRight: 16,
          border: error && '2px solid #f44336'
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
        <Box
          onClick={handleInputImageReset}
          variant='contained'
          sx={{
            mr: 1,
            backgroundColor: '#f44336',
            '&:hover': {
              opacity: 0.8
            },
            width: 40,
            height: 30,
            objectFit: 'contain',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '20%',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
          }}
        >
          <img src={`/images/buttonsIcons/clear.png`} alt={'clear'} />
        </Box>
      </Box>
    </Box>
  )
}

export default ImageUpload
