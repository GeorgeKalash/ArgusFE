import { ImmediateWindow } from '@argus/shared-providers/providers/windows'
import { ResourceIds } from '@argus/shared-domain/resources/ResourceIds'
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