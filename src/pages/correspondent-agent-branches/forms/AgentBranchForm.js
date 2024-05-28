import { Grid } from '@mui/material'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useForm } from 'src/hooks/form'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { useEffect, useContext } from 'react'
import { useInvalidate } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'

export default function AgentBranchForm({ _labels, maxAccess, store, setStore, editMode }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId } = store

  const invalidate = useInvalidate({
    endpointId: RemittanceSettingsRepository.CorrespondentAgentBranches.page
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId: recordId || null,
      agentId: '',
      swiftCode: '',
      addressId: '',
      address: ''
    },
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      agentId: yup.string().required(' '),
      swiftCode: yup.string().required(' ')
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: RemittanceSettingsRepository.CorrespondentAgentBranches.set,
        record: JSON.stringify(obj)
      })

      if (response.recordId) {
        if (!recordId) {
          toast.success('Record Added Successfully')
        } else toast.success('Record Edited Successfully')

        setStore(prevStore => ({
          ...prevStore,
          agentBranch: obj,
          recordId: response.recordId
        }))

        formik.setFieldValue('recordId', response.recordId)

        invalidate()
      }
    }
  })

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: RemittanceSettingsRepository.CorrespondentAgentBranches.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues(res.record)
        setStore(prevStore => ({
          ...prevStore,
          agentBranch: res.record
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
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceComboBox
                name='agentId'
                endpointId={RemittanceSettingsRepository.CorrespondentAgents.qry}
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
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
