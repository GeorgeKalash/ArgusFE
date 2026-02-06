import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import IvSettings from './form/IvSettings'

const IvSettingsIndex = () => {
  return (
    <ImmediateWindow datasetId={ResourceIds.IvSettings} labelKey={'ivSettings'} Component={IvSettings} height={300} />
  )
}

export default IvSettingsIndex
