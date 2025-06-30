import { Box } from '@mui/material'
import { VertLayout } from './Layouts/VertLayout'
import { Grow } from './Layouts/Grow'

const NormalDialog = ({ DialogText, bottomSection }) => {
  return (
    <VertLayout>
      <Grow>
        <Box sx={{ p: 12 }} textAlign='center'>
          {DialogText}
        </Box>
      </Grow>
      {bottomSection}
    </VertLayout>
  )
}

NormalDialog.width = 600
NormalDialog.height = 200

export default NormalDialog
