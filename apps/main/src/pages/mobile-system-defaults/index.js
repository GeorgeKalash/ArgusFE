import { ImmediateWindow } from '@argus/shared-providers/providers/windows'
import { ResourceIds } from '@argus/shared-domain/resources/ResourceIds'
import MobileSystem from './form/mobileSystemDefaultForm'

const RtIndex = () => {
  return (
    <ImmediateWindow
      datasetId={ResourceIds.MobileSystemDefaults}
      labelKey={'mobileSystemDefaults'}
      Component={MobileSystem}
    />
  )
}

export default RtIndex
