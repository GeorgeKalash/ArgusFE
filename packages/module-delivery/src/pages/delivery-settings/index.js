import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'
import React from 'react'
import DeliverySettingsForm from './Forms/DeliverySettingsForm'

const DeliverySettings = () => {
   return <ImmediateWindow datasetId={ResourceIds.DeliverySettings} labelKey={'deliverySettings'} Component={DeliverySettingsForm} height={250}/>
  }

export default DeliverySettings
