import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CtDefaults from './form/CtDefaults'

const CtIndex = () => {
  return (
    <ImmediateWindow
      datasetId={ResourceIds.CtDefaults}
      labelKey={'rmd'}
      Component={CtDefaults}
      height={500}
      width={850}
    />
  )
}

export default CtIndex
