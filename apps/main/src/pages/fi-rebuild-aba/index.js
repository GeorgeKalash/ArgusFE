import { ImmediateWindow } from '@argus/shared-providers/providers/windows'
import { ResourceIds } from '@argus/shared-domain/resources/ResourceIds'
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
