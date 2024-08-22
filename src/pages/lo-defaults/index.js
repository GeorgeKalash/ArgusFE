import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import LoDefault from './form/LoDefault'

const LoIndex = () => {
  return <ImmediateWindow datasetId={ResourceIds.carrierSite} labelKey={'lod'} Component={LoDefault} />
}

export default LoIndex
