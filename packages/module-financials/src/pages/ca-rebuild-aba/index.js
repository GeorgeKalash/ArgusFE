import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'
import CARebuildAccountBalance from './form/CARebuildForm'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'

const CaRebuildAba = () => {
  return (
    <ImmediateWindow
      datasetId={ResourceIds.CARebuildAccountBalance}
      labelKey={'accountRebuild'}
      Component={CARebuildAccountBalance}
    />
  )
}

export default CaRebuildAba
