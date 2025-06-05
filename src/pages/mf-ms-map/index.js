import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
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
