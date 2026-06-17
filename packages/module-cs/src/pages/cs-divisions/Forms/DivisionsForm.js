import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { companyStructureRepository } from '@argus/repositories/src/repositories/companyStructureRepository'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'

export default function DivisionsForm({ labels, maxAccess, recordId }) {
  const { platformLabels } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: companyStructureRepository.Divisions.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      name: '',
      activeStatus: null,
      managerId: null
    },
    maxAccess,
    validationSchema: yup.object({
      name: yup.string().required(),
      activeStatus: yup.string().required(),
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: companyStructureRepository.Divisions.set,
        record: JSON.stringify(obj)
      })

      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      !obj?.recordId && formik.setFieldValue('recordId', response.recordId)
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: companyStructureRepository.Divisions.get,
          parameters: `_recordId=${recordId}`
        })
        formik.setValues(res.record)
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.Divisions} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                required
                maxLength='50'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.ACTIVE_STATUS}
                name='activeStatus'
                label={labels.activeStatus}
                valueField='key'
                displayField='value'
                values={formik.values}
                required
                onChange={(_, newValue) => {
                  formik.setFieldValue('activeStatus', newValue?.key ?? null)
                }}
                error={formik.touched.activeStatus && Boolean(formik.errors.activeStatus)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={EmployeeRepository.Employee.snapshot}
                parameters={{
                  _startAt: 0,
                  _branchId: 0
                }}
                name='managerId'
                label={labels.manager}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'firstName', value: 'Name' }
                ]}
                valueField='managerRef'
                displayField='name'
                maxAccess={maxAccess}
                displayFieldWidth={2}
                form={formik}
                valueShow='managerRef'
                secondValueShow='managerName'
                onChange={(_, newValue) => {
                  formik.setFieldValue('managerRef', newValue.reference || '')
                  formik.setFieldValue('managerName', newValue.fullName || '')
                  
                  formik.setFieldValue('managerId', newValue.recordId || null)
                }}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}