import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import GenerateOpening from './form/GenerateOpening'

const RBIndex = () => {
  return (
    <ImmediateWindow
      datasetId={ResourceIds.GenerateOpeningBalances}
      labelKey={'gob'}
      Component={GenerateOpening}
      height={460}
    />
  )
}

export default RBIndex
