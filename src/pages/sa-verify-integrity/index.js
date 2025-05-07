import React from 'react'
import { ImmediateWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import VerifyIntegrityForm from './Forms/VerifyIntegrityForm'

const VerifyIntegrity = () => {
  return <ImmediateWindow datasetId={ResourceIds.SAVerifyTransIntegrity} labelKey={'verifyTransIntegrity'} Component={VerifyIntegrityForm} height={300}/>
}

export default VerifyIntegrity