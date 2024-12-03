import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import IRDefault from './Forms/IRDefaults'

const IRDefaults = () => {
  return <ImmediateWindow datasetId={ResourceIds.IRDefaults} labelKey={'iRd'} Component={IRDefault} />
}

export default IRDefaults
