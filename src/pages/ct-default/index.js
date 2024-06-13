import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import CtDefaults from './form/CtDefaults'

const CtIndex = () => {
  return <ImmediateWindow datasetId={ResourceIds.CtDefaults} titleName={'rmd'} Component={CtDefaults} height={500} />
}

export default CtIndex
