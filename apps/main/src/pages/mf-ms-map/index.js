import { ImmediateWindow } from '@argus/shared-providers/providers/windows'
import { ResourceIds } from '@argus/shared-domain/resources/ResourceIds'
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
