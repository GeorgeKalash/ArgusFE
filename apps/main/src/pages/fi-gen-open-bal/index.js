import { ImmediateWindow } from '@argus/shared-providers/providers/windows'
import { ResourceIds } from '@argus/shared-domain/resources/ResourceIds'
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
