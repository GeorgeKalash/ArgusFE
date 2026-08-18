import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import ProdPlanningDefaultsForm from './Form/ProdPlanningDefaultsForm'
import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'

const PPDefaults = () => {
  return (
    <ImmediateWindow 
      datasetId={ResourceIds.PPDefaults} 
      labelKey={'ppDefaults'} 
      Component={ProdPlanningDefaultsForm} 
      height={330}
      width={450}
    />
  )
}

export default PPDefaults
