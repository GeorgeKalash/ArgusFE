import { useWindow } from 'src/windows'
import { Router } from 'src/lib/useRouter'
import { ThreadProgress } from 'src/components/Shared/ThreadProgress'
import ImportForm from 'src/components/Shared/ImportForm'
import { ControlContext } from 'src/providers/ControlContext'
import { useContext } from 'react'
import { useResourceQuery } from 'src/hooks/resource'

const BatchImports = () => {
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)
  const { resourceId } = Router()
  const { access } = useResourceQuery({ datasetId: resourceId })

  return (
    <ImportForm
      resourceId={resourceId}
      access={access}
      platformLabels={platformLabels}
      onSuccess={res => {
        stack({
          Component: ThreadProgress,
          props: {
            recordId: res.recordId,
            access
          },
          width: 500,
          height: 450,
          closable: false,
          title: platformLabels.Progress
        })
      }}
    />
  )
}

export default BatchImports
