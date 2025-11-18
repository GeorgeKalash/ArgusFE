import { ImmediateWindow } from '@argus/shared-providers/providers/windows'
import { ResourceIds } from '@argus/shared-domain/resources/ResourceIds'
import RemittanceDefaults from './form/RemittanceDefaults'

const RtIndex = () => {
  return <ImmediateWindow datasetId={ResourceIds.SystemDefault} labelKey={'rmd'} Component={RemittanceDefaults} />
}

export default RtIndex
