import { DialogContent, Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'

export default function DataForm({ obj }) {
  const [data, setData] = useState({})
  const { getRequest } = useContext(RequestsContext)

  useEffect(() => {
    ;(async function () {
      const res = await getRequest({
        extension: SystemRepository.TrxDetails.get,
        parameters: `_recordId=${obj.recordId}`
      })

      setData(JSON.parse(res.record.data))
    })()
  }, [])

  return (
    <VertLayout>
      <Fixed>
        <DialogContent
          sx={{
            overflow: 'auto'
          }}
        >
          <Grid item style={{ height: 290 }}>
            {<pre style={{ margin: 0, fontFamily: 'inherit', fontWeight: 450 }}>{JSON.stringify(data, null, 2)}</pre>}
          </Grid>
        </DialogContent>
      </Fixed>
    </VertLayout>
  )
}

{
  /* <Grid data-unique-id item xs={4} sx={{ paddingBottom: '15px', height: '18vh', overflow: 'auto', m: 2 }}>
{Object.entries(data).map(([key, value]) => (
  <Grid key={key} style={{ display: 'flex', alignItems: 'center' }}>
    <Grid style={{ minWidth: '100px', fontWeight: 'bold' }}>{key}:</Grid>
    <Grid>{key && key === 'date' ? formatDateDefault(value) : value}</Grid>
  </Grid>
))}
</Grid> */
}
