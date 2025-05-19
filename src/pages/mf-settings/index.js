import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import MfSettingForm from './forms/MfSettingForm'

export default function MfSetting() {
  return (
    <ImmediateWindow datasetId={ResourceIds.MF_Settings} labelKey={'defaults'} Component={MfSettingForm} height={500} />
  )
}
