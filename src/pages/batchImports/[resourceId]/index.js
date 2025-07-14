import { useWindow } from 'src/windows'
import { Router } from 'src/lib/useRouter'
import { ThreadProgress } from 'src/components/Shared/ThreadProgress'
import ImportForm from 'src/components/Shared/ImportForm'
import { ControlContext } from 'src/providers/ControlContext'
import { useContext } from 'react'
import { useResourceQuery } from 'src/hooks/resource'

const BatchImports = () => {
  const { stack } = useWindow()
  const { resourceId } = Router()
  const { access } = useResourceQuery({ datasetId: resourceId })

  return (
    <ImportForm
      resourceId={resourceId}
      access={access}
      onSuccess={res => {
        stack({
          Component: ThreadProgress,
          props: {
            recordId: res.recordId,
            access
          },
          closable: false
        })
      }}
    />
  )
}

export default BatchImports
