import { ImmediateWindow } from '@argus/shared-providers/providers/windows'
import { ResourceIds } from '@argus/shared-domain/resources/ResourceIds'
import PlantSupervisorsForm from './Forms/PlantSupervisorsForm'

const PlantSupervisors = () => {
  return <ImmediateWindow datasetId={ResourceIds.PlantSupervisors} labelKey={'plantSupervisors'} Component={PlantSupervisorsForm} />
}

export default PlantSupervisors