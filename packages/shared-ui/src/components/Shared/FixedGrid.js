import { Grid } from '@mui/material'
import { useContext } from 'react'
import { AuthContext } from '@argus/shared-providers/src/providers/AuthContext'

const FixedGrid = ({ children, ...props }) => {
  const { languageId } = useContext(AuthContext)

  return (
    <Grid direction={languageId == 2 ? 'row' : 'row-reverse'} {...props}>
      {children}
    </Grid>
  )
}

export default FixedGrid
