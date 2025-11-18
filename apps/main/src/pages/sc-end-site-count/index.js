import { ImmediateWindow } from '@argus/shared-providers/providers/windows'
import { ResourceIds } from '@argus/shared-domain/resources/ResourceIds'
import EndSiteCountForm from './forms/EndSiteCountForm'

const EndSiteCount = () => {
  return <ImmediateWindow datasetId={ResourceIds.EndSiteCount} labelKey={'endSiteCount'} Component={EndSiteCountForm} />
}

export default EndSiteCount