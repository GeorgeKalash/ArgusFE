import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import RemittanceDefaults from './form/RemittanceDefaukts'

const RtIndex = () => {
  return <ImmediateWindow datasetId={ResourceIds.SystemDefault} titleName={'rmd'} Component={RemittanceDefaults} />
}

export default RtIndex
