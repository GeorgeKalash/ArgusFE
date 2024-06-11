import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import LoDefault from './form/LoDefault'

const LoIndex = () => {
  return <ImmediateWindow datasetId={ResourceIds.carrierSite} titleName={'lod'} Component={LoDefault} />
}

export default LoIndex
