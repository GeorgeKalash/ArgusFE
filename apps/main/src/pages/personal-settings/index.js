import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import PersonalSettings from './form/PersonalSettings'

const PersonalSet = () => {
  return (
    <ImmediateWindow
      datasetId={ResourceIds.PersonalSettings}
      labelKey={'personalSettings'}
      Component={PersonalSettings}
    />
  )
}

export default PersonalSet
