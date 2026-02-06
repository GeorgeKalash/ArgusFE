import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import RemittanceDefaults from './form/RemittanceDefaults'

const RtIndex = () => {
  return <ImmediateWindow datasetId={ResourceIds.SystemDefault} labelKey={'rmd'} Component={RemittanceDefaults} />
}

export default RtIndex
