import { Checkbox, FormControlLabel, Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'

import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'

import { SystemRepository } from 'src/repositories/SystemRepository'
import { ControlContext } from 'src/providers/ControlContext'
import { PointofSaleRepository } from 'src/repositories/PointofSaleRepository'

export default function RetailDocTypeForm({ labels, maxAccess, recordId, functionId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: PointofSaleRepository.DocumentTypeDefault.qry
  })

  const { formik } = useForm({
    initialValues: {
      dtId: '',
      disableSKULookup: false
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      dtId: yup.string().required()
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId
      await postRequest({
        extension: PointofSaleRepository.DocumentTypeDefault.set,
        record: JSON.stringify(obj)
      })
      if (!recordId) {
        formik.setFieldValue('recordId', obj.dtId)
      }

      toast.success(platformLabels.Updated)

      invalidate()
      window.close()
    }
  })
  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: PointofSaleRepository.DocumentTypeDefault.get,
          parameters: `_dtId=${recordId}`
        })

        formik.setValues({ ...res.record, recordId: recordId })
      }
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.POSDocTypeDefault}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      isCleared={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_startAt=0&_pageSize=1000&_dgId=${functionId}`}
                name='dtId'
                required
                label={labels.doctype}
                readOnly={editMode}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('dtId', newValue?.recordId || '')
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
              />
            </Grid>

            <Grid item xs={12}>
              <CustomCheckBox
                name='disableSKULookup'
                value={formik.values.disableSKULookup}
                onChange={event => formik.setFieldValue('disableSKULookup', event.target.checked)}
                label={labels.dsl}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
