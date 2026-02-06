import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import RebuildAccountBalances from './form/RebuildAccountBalances'

const RBIndex = () => {
  return (
    <ImmediateWindow
      datasetId={ResourceIds.RebuildAccountBalances}
      labelKey={'rab'}
      Component={RebuildAccountBalances}
      height={460}
    />
  )
}

export default RBIndex
