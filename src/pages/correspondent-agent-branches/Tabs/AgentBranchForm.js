// ** MUI Imports
import { Grid } from '@mui/material'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useForm } from 'src/hooks/form'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { useState, useEffect, useContext } from 'react'
import { useInvalidate } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import * as yup from 'yup'

export default function AgentBranchForm({ _labels, maxAccess, store, setStore, editMode, setEditMode }) {
  
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId } = store

  const [initialValues, setInitialData] = useState({
    recordId: recordId || null,
    agentId: '',
    swiftCode: '',
    addressId: '',
    address: ''
  })

  const invalidate = useInvalidate({
    endpointId: RemittanceSettingsRepository.CorrespondentAgentBranches.page
  })

  const { formik } = useForm({
    maxAccess,
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      agentId: yup.string().required(' '),
      swiftCode: yup.string().required(' ')
    }),
    onSubmit: async obj => {
      //console.log(obj)
      //const recordIdd = obj.recordId

      const response = await postRequest({
        extension: RemittanceSettingsRepository.CorrespondentAgentBranches.set,
        record: JSON.stringify(obj)
      })

      if (response.recordId) {
        toast.success('Record Added Successfully')
        setStore(prevStore => ({
          ...prevStore,
          agentBranch: obj,
          recordId: response.recordId
        }))
        invalidate()
      } else toast.success('Record Edited Successfully')
      setEditMode(true)
    }
  })

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: RemittanceSettingsRepository.CorrespondentAgentBranches.get,
          parameters: `_recordId=${recordId}`
        })
        setInitialData(res.record)
        setStore(prevStore => ({
          ...prevStore,
          agentBranch: res
        }))
      }
    })()
  }, [])

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.CorrespondentAgentBranch}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <ResourceComboBox
            name='agentId'
            endpointId={RemittanceSettingsRepository.CorrespondentAgents.qry}
            //parameters = {`_params=&_startAt=0&_pageSize=1000`}
            label={_labels?.agent}
            valueField='recordId'
            displayField='name'
            required
            values={formik.values}
            onChange={(event, newValue) => {
              formik.setFieldValue('agentId', newValue?.recordId)
            }}
            error={formik.touched.agentId && Boolean(formik.errors.agentId)}
            maxAccess={maxAccess}
          />
        </Grid>

        <Grid item xs={12}>
          <CustomTextField
            name='swiftCode'
            label={_labels?.swiftCode}
            value={formik.values?.swiftCode}
            required
            maxLength='20'
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('swiftCode', '')}
            error={formik.touched.swiftCode && Boolean(formik.errors.swiftCode)}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}
