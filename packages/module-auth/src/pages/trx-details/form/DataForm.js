import { useContext, useEffect, useState } from 'react'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import CustomJsonFormat from '@argus/shared-ui/src/components/Inputs/CustomJsonFormat'

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
        <CustomJsonFormat value={data} />
      </Fixed>
    </VertLayout>
  )
}
