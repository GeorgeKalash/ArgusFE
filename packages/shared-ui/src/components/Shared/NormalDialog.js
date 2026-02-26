import { Box } from '@mui/material'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'

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
