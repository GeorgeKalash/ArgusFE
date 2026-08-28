import { Box } from '@mui/material'
import CustomButton from '../../Inputs/CustomButton'

export default function FilePreviewWindow({ url, isImage, window }) {
  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      {isImage ? (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden'
          }}
        >
          <img
            src={url}
            alt='preview'
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          />
        </Box>
      ) : (
        <iframe title='Preview' src={url} width='100%' height='100%' allowFullScreen />
      )}

      <Box position='absolute' top={12} right={130} zIndex={1}>
        <CustomButton
          image='popup.png'
          color='#231F20'
          onClick={() => {
            window.open(url, '_blank')
          }}
        />
      </Box>
    </Box>
  )
}