import { useWindow } from '@argus/shared-providers/providers/windows'
import { Router } from '@argus/shared-domain/lib/useRouter'
import { ThreadProgress } from '@argus/shared-ui/components/Shared/ThreadProgress'
import ImportForm from '@argus/shared-ui/components/Shared/ImportForm'
import { useResourceQuery } from '@argus/shared-hooks/hooks/resource'

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
