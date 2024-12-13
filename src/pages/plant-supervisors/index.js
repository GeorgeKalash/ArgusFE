import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import PlantSupervisorsForm from './Forms/PlantSupervisorsForm'

const PlantSupervisors = () => {
  return <ImmediateWindow datasetId={ResourceIds.PlantSupervisors} labelKey={'plantSupervisors'} Component={PlantSupervisorsForm} />
}

export default PlantSupervisors