import { Box, Typography } from '@mui/material'
import React from 'react'
import { useRef } from 'react'
import Button from '@mui/material/Button'

const CustomImage = ({ name, value, setValue, setFile }) => {
  const hiddenInputRef = useRef()

  const handleClick = () => {
    hiddenInputRef.current.click()
  }

  const handleInputImageChange = event => {
    const file = event.target.files[0]
    if (setFile) {
      setFile(file)
    }
    if (file) {
      const fileSizeInKB = Math.round(file.size / 1024)
      if (parseInt(fileSizeInKB) > 800) {
        alert('Allowed PNG or JPEG. Max size of 800K.')

        return
      }

      const reader = new FileReader()
      reader.onloadend = e => {
        setValue(name, e.target.result)
      }
      reader.readAsDataURL(file)
    } else {
      setValue(name, '')
    }
  }

  const handleInputImageReset = () => {
    setValue(name, '')
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <img
        src={value || '/images/avatars/1.png'}
        alt='Profile Pic'
        style={{ width: 100, height: 100, objectFit: 'cover', marginRight: 16 }}
        onClick={handleClick}
      />
      <Box>
        <input
          hidden
          type='file'
          ref={hiddenInputRef}
          onChange={handleInputImageChange}
          accept='image/png, image/jpeg'
        />
        <Button
          onClick={handleInputImageReset}
          variant='contained'
          sx={{
            mr: 1,
            backgroundColor: 'red',
            '&:hover': {
              opacity: 0.8
            },
            width: 20,
            height: 35,
            objectFit: 'contain'
          }}
        >
          <img src={`/images/buttonsIcons/clear.png`} alt={'test'} />
        </Button>
        <Typography variant='caption' sx={{ mt: 4, display: 'block', color: 'text.disabled' }}>
          Allowed PNG or JPEG. Max size of 800K.
        </Typography>
      </Box>
    </Box>
  )
}

export default CustomImage
