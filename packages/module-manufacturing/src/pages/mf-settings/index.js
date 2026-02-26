import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import MfSettingForm from './forms/MfSettingForm'

export default function MfSetting() {
  return (
    <ImmediateWindow datasetId={ResourceIds.MF_Settings} labelKey={'defaults'} Component={MfSettingForm} height={500} />
  )
}
