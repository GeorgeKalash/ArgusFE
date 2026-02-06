import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import MeasurementScheduleMapForm from './form/MeasurementScheduleMapForm'

const MeasurementScheduleMap = () => {
  return (
    <ImmediateWindow
      datasetId={ResourceIds.MeasurementScheduleMaps}
      labelKey={'msMap'}
      Component={MeasurementScheduleMapForm}
    />
  )
}

export default MeasurementScheduleMap
