import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { useInvalidate } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { PointofSaleRepository } from 'src/repositories/PointofSaleRepository'
import { useForm } from 'src/hooks/form'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { ControlContext } from 'src/providers/ControlContext'

export default function PosUsersForm({ labels, maxAccess, recordId, record, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: PointofSaleRepository.PosUsers.qry
  })



  const { formik } = useForm({
    initialValues: {
      recordId,
      userId: null,
      posId: null,
      spId: null
    },
    maxAccess: maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      userId: yup.string().required(),
      posId: yup.string().required()
    }),
    onSubmit: async obj => {
      try {
        await postRequest({
          extension: PointofSaleRepository.PosUsers.set,
          record: JSON.stringify(obj)
        })
        toast.success(platformLabels.Saved)
  
        window.close()
  
        invalidate()
      } catch (error) {}
    }
  })

  const editMode = !!formik.values.recordId && !!recordId;

  useEffect(() => {
    ;(async function () {
      try {
        if (record && record.userId && recordId) {
          const res = await getRequest({
            extension: PointofSaleRepository.PosUsers.get,
            parameters: `_userId=${record.userId}`
          })
          formik.setValues({ ...res.record, recordId: res.record.userId })
        }
      } catch (e) {}
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.POSUsers} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.PosUsers.qry}
                name='userId'
                label={labels.user}
                valueField='recordId'
                parameters={`_size=1000&_filter=&_startAt=0&_sortBy=fullName`}
                displayField={['email']}
                columnsInDropDown={[{ key: 'email', value: 'email' }]}
                values={formik.values}
                required
                maxAccess={maxAccess}
                readOnly={editMode}
                onChange={(event, newValue) => {
                  formik.setFieldValue('userId', newValue?.recordId)
                }}
                error={formik.touched.userId && Boolean(formik.errors.userId)}
              />
            </Grid>

            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={PointofSaleRepository.PosUsersPOS.qry}
                name='posId'
                label={labels.pos}
                valueField='recordId'
                displayField={['reference']}
                columnsInDropDown={[{ key: 'reference', value: 'reference' }]}
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('posId', newValue ? newValue?.recordId : '')
                }}
                error={formik.touched.posId && Boolean(formik.errors.posId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SaleRepository.PosUsers.qry}
                name='spId'
                label={labels.spName}
                valueField='recordId'
                displayField='name'
                columnsInDropDown={[{ key: 'name', value: 'name' }]}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('spId', newValue?.recordId)
                }}
                error={formik.touched.spId && Boolean(formik.errors.spId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
