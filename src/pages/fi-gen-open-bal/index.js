import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import GenerateOpening from './form/GenerateOpening'

const RBIndex = () => {
  return (
    <ImmediateWindow
      datasetId={ResourceIds.GenerateOpeningBalances}
      titleName={'gob'}
      Component={GenerateOpening}
      height={460}
    />
  )
}

export default RBIndex
