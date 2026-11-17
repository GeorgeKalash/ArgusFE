import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'
import BatchCloseTVForm from './Forms/BatchCloseForm'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'

const BatchCloseTV = () => {
  return <ImmediateWindow Component={BatchCloseTVForm} labelKey={'BatchCloseTV'} datasetId={ResourceIds.BatchCloseTV} />
}

export default BatchCloseTV
