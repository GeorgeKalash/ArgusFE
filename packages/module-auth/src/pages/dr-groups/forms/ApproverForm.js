import React, { useContext, useEffect } from 'react'
import { Grid } from '@mui/material'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { DocumentReleaseRepository } from '@argus/repositories/src/repositories/DocumentReleaseRepository'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

const ApproverForm = ({ labels, maxAccess, store, window }) => {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId: grId } = store

  const invalidate = useInvalidate({
    endpointId: DocumentReleaseRepository.GroupCode.qry
  })

  const { formik } = useForm({
    initialValues: {
      codeId: null,
      groupId: grId
    },
    validationSchema: yup.object({
      codeId: yup.string().required()
    }),
    onSubmit: async values => {
      await postGroups(values)
    },
    validateOnChange: true,
    maxAccess
  })

  const postGroups = async obj => {
    await postRequest({
      extension: DocumentReleaseRepository.GroupCode.set,
      record: JSON.stringify(obj)
    })
    toast.success(platformLabels.Saved)
    window.close()
    invalidate()
  }

  return (
    <FormShell form={formik} isInfo={false} resourceId={ResourceIds.DRGroups} maxAccess={maxAccess}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={DocumentReleaseRepository.ReleaseCode.qry}
                parameters={`_startAt=${0}&_pageSize=${100}`}
                name='codeId'
                label={labels.code}
                valueField='recordId'
                displayField='name'
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('codeId', newValue?.recordId)
                }}
                error={formik.touched.codeId && Boolean(formik.errors.codeId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default ApproverForm
