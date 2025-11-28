import React from 'react'
import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import VerifyIntegrityForm from './Forms/VerifyIntegrityForm'

const VerifyIntegrity = () => {
  return <ImmediateWindow datasetId={ResourceIds.SAVerifyTransIntegrity} labelKey={'verifyTransIntegrity'} Component={VerifyIntegrityForm} height={300}/>
}

export default VerifyIntegrity