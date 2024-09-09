import { ImmediateWindow } from 'src/windows'
import CARebuildAccountBalance from './form/CARebuildForm'
import { ResourceIds } from 'src/resources/ResourceIds'

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
