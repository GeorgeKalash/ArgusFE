import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import EndSiteCountForm from './forms/EndSiteCountForm'

const EndSiteCount = () => {
  return <ImmediateWindow datasetId={ResourceIds.EndSiteCount} labelKey={'endSiteCount'} Component={EndSiteCountForm} />
}

export default EndSiteCount