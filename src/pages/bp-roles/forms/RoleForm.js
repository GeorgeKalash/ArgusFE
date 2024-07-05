import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'
import { Grow } from 'src/components/Shared/Layouts/Grow'

export default function RoleForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: BusinessPartnerRepository.Role.page
  })

  const { formik } = useForm({
    initialValues: { 
        recordId: null, 
        reference: '', 
        name: '',
        rcId: null,
        description: '',
        tpType: ''
    },
    enableReinitialize: true,
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required(' '),
      name: yup.string().required(' '),
      rcId: yup.string().required(' '),
      tpType: yup.string().required(' ')
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId

      const response = await postRequest({
        extension: BusinessPartnerRepository.Role.set,
        record: JSON.stringify(obj)
      })

      if (!recordId) {
        toast.success(platformLabels.Added)
        formik.setValues({
          ...obj,
          recordId: response.recordId
        })
      } else toast.success(platformLabels.Edited)

      invalidate()
    }
  })

  const editMode = !!formik.values.recordId || !!recordId

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: BusinessPartnerRepository.Role.get,
            parameters: `_recordId=${recordId}`
          })

          formik.setValues(res.record)
        }
      } catch (exception) {}
    })()
  }, [])


  return (
    <FormShell resourceId={ResourceIds.Roles} form={formik} maxAccess={maxAccess} editMode={editMode}>
        <VertLayout>
            <Grow>
                <Grid container spacing={4}>
                    <Grid item xs={12}>
                        <CustomTextField
                            name='reference'
                            label={labels.reference}
                            value={formik.values.reference}
                            required
                            maxAccess={maxAccess}
                            maxLength='30'
                            onChange={formik.handleChange}
                            onClear={() => formik.setFieldValue('reference', '')}
                            error={formik.touched.reference && Boolean(formik.errors.reference)}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <CustomTextField
                            name='name'
                            label={labels.name}
                            value={formik.values.name}
                            required
                            maxAccess={maxAccess}
                            onChange={formik.handleChange}
                            onClear={() => formik.setFieldValue('name', '')}
                            error={formik.touched.name && Boolean(formik.errors.name)}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <CustomTextArea
                            name='description'
                            label={labels.description}
                            value={formik.values.description}
                            maxLength='100'
                            maxAccess={maxAccess}
                            onChange={formik.handleChange}
                            onClear={() => formik.setFieldValue('description', '')}
                            error={formik.touched.description && Boolean(formik.errors.description)}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <ResourceComboBox
                            endpointId={BusinessPartnerRepository.RoleCategory.qry}
                            name='rcId'
                            label={labels.roleCategory}
                            valueField='recordId'
                            displayField='name'
                            values={formik.values}
                            required
                            readOnly={editMode}
                            maxAccess={maxAccess}
                            onChange={(event, newValue) => {
                            formik && formik.setFieldValue('rcId', newValue?.recordId)
                            }}
                            error={formik.touched.rcId && Boolean(formik.errors.rcId)}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <ResourceComboBox
                            datasetId={DataSets.THIRD_PARTY_TYPE}
                            name='tpType'
                            label={labels.thirdPartyType}
                            valueField='key'
                            displayField='value'
                            required
                            values={formik.values}
                            maxAccess={maxAccess}
                            onChange={(event, newValue) => {
                            formik.setFieldValue('tpType', newValue?.key)
                            }}
                            error={formik.touched.tpType && Boolean(formik.errors.tpType)}
                        />
                    </Grid>
                </Grid>
            </Grow>
        </VertLayout>
    </FormShell>
  )
}
