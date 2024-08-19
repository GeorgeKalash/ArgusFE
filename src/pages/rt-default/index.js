import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import RemittanceDefaults from './form/RemittanceDefaults'

const RtIndex = () => {
  return <ImmediateWindow datasetId={ResourceIds.SystemDefault} labelKey={'rmd'} Component={RemittanceDefaults} />
}

export default RtIndex
