import React from 'react'
import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import DeliverySettingsForm from './Forms/DeliverySettingsForm'

const DeliverySettings = () => {
   return <ImmediateWindow datasetId={ResourceIds.DeliverySettings} labelKey={'deliverySettings'} Component={DeliverySettingsForm} height={250}/>
  }

export default DeliverySettings
