import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
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
