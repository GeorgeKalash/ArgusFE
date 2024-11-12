import { Grid } from '@mui/material'

export default function FormGrid({ hideonempty = false, children, ...props }) {
  if (children?.props?.HideParentGrid) {
    return null
  }

  return (
    <Grid {...props} className={hideonempty ? '__hide-on-empty' : ''}>
      {children}
    </Grid>
  )
}
