import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import MobileSystem from './form/mobileSystemDefaultForm'

const RtIndex = () => {
  return (
    <ImmediateWindow
      datasetId={ResourceIds.MobileSystemDefaults}
      titleName={'mobileSystemDefaults'}
      Component={MobileSystem}
    />
  )
}

export default RtIndex
