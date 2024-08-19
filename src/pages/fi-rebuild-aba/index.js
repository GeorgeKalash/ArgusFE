import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
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
