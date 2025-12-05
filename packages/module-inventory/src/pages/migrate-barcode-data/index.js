import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'
import MigrateBarcodeForm from './forms/migrateBarcodeForm'

const MigrateBarcodeData = () => {
  return (
    <ImmediateWindow
      datasetId={ResourceIds.MigrateBarcodeData}
      labelKey={'transferFromBarcode'}
      Component={MigrateBarcodeForm}
      height={500}
      width={1000}
    />
  )
}

export default MigrateBarcodeData
