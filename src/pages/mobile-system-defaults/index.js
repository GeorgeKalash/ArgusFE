import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import MobileSystem from './form/mobileSystemDefaultForm'

const RtIndex = () => {
  return (
    <ImmediateWindow
      datasetId={ResourceIds.MobileSystemDefaults}
      labelKey={'mobileSystemDefaults'}
      Component={MobileSystem}
      height={450}
    />
  )
}

export default RtIndex
