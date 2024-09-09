import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
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
