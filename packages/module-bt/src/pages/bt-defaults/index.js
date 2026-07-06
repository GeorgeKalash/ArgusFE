import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import BtDefaults from './form/BtDefaults'

const BtDefaultsIndex = () => {
  return (
    <ImmediateWindow datasetId={ResourceIds.BtDefaults} labelKey={'bt_defaults'} Component={BtDefaults} height={430} />
  )
}

export default BtDefaultsIndex
