import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import { Box } from '@mui/material'

const ImageViewer = ({ imageUrl, title, window }) => {
  useSetWindow({ title, window })

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%'
      }}
    >
      <img
        src={imageUrl}
        alt=''
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain'
        }}
      />
    </Box>
  )
}

ImageViewer.width = 800
ImageViewer.height = 600

export default ImageViewer