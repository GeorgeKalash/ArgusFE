import { ImmediateWindow } from '@argus/shared-providers/providers/windows'
import { ResourceIds } from '@argus/shared-domain/resources/ResourceIds'
import LoDefault from './form/LoDefault'

const LoIndex = () => {
  return (
    <ImmediateWindow
      datasetId={ResourceIds.carrierSite}
      labelKey={'lod'}
      Component={LoDefault}
      height={250}
      width={500}
    />
  )
}

export default LoIndex
