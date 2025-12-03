import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import RebuildAgingForm from './Forms/RebuildAgingForm'

const RebuildAging = () => {
  return (
    <ImmediateWindow
      datasetId={ResourceIds.RebuildAging}
      labelKey={'rebuildAging'}
      Component={RebuildAgingForm}
    />
  )
}

export default RebuildAging