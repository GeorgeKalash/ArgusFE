import { useContext } from 'react'
import { Grid } from '@mui/material'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useEffect } from 'react'
import * as yup from 'yup'
import { DocumentReleaseRepository } from '@argus/repositories/src/repositories/DocumentReleaseRepository'
import toast from 'react-hot-toast'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'

const CodeForm = ({ labels, editMode, maxAccess, recordId, store, window }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: DocumentReleaseRepository.StrategyCode.qry
  })

  const { recordId: stgId } = store

  const { formik } = useForm({
    maxAccess,
    initialValues: { codeId: '', groupId: store.groupId, strategyId: stgId },
    validateOnChange: true,
    validationSchema: yup.object({
      codeId: yup.string().required()
    }),

    onSubmit: async values => {
      await postGroups(values)
      window.close()
    }
  })

  const postGroups = async obj => {
    await postRequest({
      extension: DocumentReleaseRepository.StrategyCode.set,
      record: JSON.stringify(obj)
    })
    toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
    invalidate()
  }
  useEffect(() => {
    recordId && getGroupId(recordId)
  }, [recordId])

  const getGroupId = codeId => {
    getRequest({
      extension: DocumentReleaseRepository.GroupCode.qry,
      parameters: `_groupId=${store.groupId}`
    }).then(res => {
      formik.setValues(res.record)
    })
  }

  return (
    <FormShell
      form={formik}
      isInfo={false}
      resourceId={ResourceIds.Strategies}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={DocumentReleaseRepository.GroupCode.qry}
                parameters={`_groupId=${store.groupId}`}
                name='codeId'
                label={labels.code}
                valueField='codeId'
                displayField='codeRef'
                columnsInDropDown={[
                  { key: 'codeRef', value: 'Reference' },
                  { key: 'codeName', value: 'Name' }
                ]}
                values={formik.values}
                required
                readOnly={editMode}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('codeId', '')}
                onChange={(event, newValue) => {
                  formik.setFieldValue('codeId', newValue?.codeId)
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

export default CodeForm
