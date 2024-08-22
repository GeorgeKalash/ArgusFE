import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import CtDefaults from './form/CtDefaults'

const CtIndex = () => {
  return <ImmediateWindow datasetId={ResourceIds.CtDefaults} labelKey={'rmd'} Component={CtDefaults} height={560} />
}

export default CtIndex
