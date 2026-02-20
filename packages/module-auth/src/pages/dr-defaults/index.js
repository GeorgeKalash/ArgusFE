import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import DrDefaults from './form/DrDefaults'

const DrIndex = () => {
  return (
    <ImmediateWindow
      datasetId={ResourceIds.DrDefaults}
      labelKey={'drd'}
      Component={DrDefaults}
      height={250}
      width={500}
    />
  )
}

export default DrIndex
