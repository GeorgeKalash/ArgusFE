import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import SerialsTrackingsForm from './form/SerialsTrackingsForm'

const SerialsTracking = () => {
  return (
    <ImmediateWindow
      datasetId={ResourceIds.SerialsTrackings}
      labelKey={'SerialsTracking'}
      Component={SerialsTrackingsForm}
    />
  )
}

export default SerialsTracking
