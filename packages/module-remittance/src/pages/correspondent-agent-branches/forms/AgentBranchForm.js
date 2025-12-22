import { Grid } from '@mui/material'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { RemittanceSettingsRepository } from '@argus/repositories/src/repositories/RemittanceRepository'
import { useEffect, useContext } from 'react'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

export default function AgentBranchForm({ _labels, maxAccess, store, setStore, editMode }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId, address } = store
  const { platformLabels } = useContext(ControlContext)

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
    validateOnChange: true,
    validationSchema: yup.object({
      agentId: yup.string().required(),
      swiftCode: yup.string().required()
    }),
    onSubmit: async obj => {
      const addressId = address?.recordId || null
      if (addressId) {
        obj = { ...obj, addressId }
      }

      const response = await postRequest({
        extension: RemittanceSettingsRepository.CorrespondentAgentBranches.set,
        record: JSON.stringify(obj)
      })

      if (!editMode) {
        toast.success(platformLabels.Added)
      } else toast.success(platformLabels.Edited)

      setStore(prevStore => ({
        ...prevStore,
        agentBranch: obj,
        recordId: response.recordId
      }))

      formik.setFieldValue('recordId', response.recordId)

      invalidate()
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
          <Grid container spacing={2}>
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
