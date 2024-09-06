import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import IvSettings from './form/IvSettings'

const IvSettingsIndex = () => {
  return (
    <ImmediateWindow datasetId={ResourceIds.IvSettings} labelKey={'ivSettings'} Component={IvSettings} height={300} />
  )
}

export default IvSettingsIndex
