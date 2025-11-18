import { ImmediateWindow } from '@argus/shared-providers/providers/windows'
import { ResourceIds } from '@argus/shared-domain/resources/ResourceIds'
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
