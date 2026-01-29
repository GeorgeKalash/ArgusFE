import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import AUDefaultsForm from './Form/AUDefaultsForm'

const AUDefaults = () => {
  return (
    <ImmediateWindow
      datasetId={ResourceIds.AUDefaults}
      labelKey={'defaults'}
      Component={AUDefaultsForm}
    />
  )
}

export default AUDefaults
