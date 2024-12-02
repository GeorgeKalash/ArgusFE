import { Box } from '@mui/material'
import { VertLayout } from './Layouts/VertLayout'
import { Grow } from './Layouts/Grow'

const NormalDialog = ({ DialogText, bottomSection }) => {
  return (
    <VertLayout>
      <Grow>
        <Box sx={{ p: 12, height: '100px' }} textAlign='center'>
          {DialogText}
        </Box>
      </Grow>
      {bottomSection}
    </VertLayout>
  )
}

export default NormalDialog
