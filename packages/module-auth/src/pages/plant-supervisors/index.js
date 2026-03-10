import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import PlantSupervisorsForm from './Forms/PlantSupervisorsForm'

const PlantSupervisors = () => {
  return <ImmediateWindow datasetId={ResourceIds.PlantSupervisors} labelKey={'plantSupervisors'} Component={PlantSupervisorsForm} />
}

export default PlantSupervisors