import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { PointofSaleRepository } from 'src/repositories/PointofSaleRepository'
import { useForm } from 'src/hooks/form'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { SaleRepository } from 'src/repositories/SaleRepository'

export default function PosUsersForm({ labels, maxAccess, userId, invalidate }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const editMode = !!userId

  const { formik } = useForm({
    initialValues: {
      userId: null,
      posId: null,
      spId: null
    },
    maxAccess: maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      userId: yup.string().required(' '),
      posId: yup.string().required(' ')
    }),
    onSubmit: async obj => {
      const userId = obj.userId

      const response = await postRequest({
        extension: PointofSaleRepository.PosUsers.set,
        record: JSON.stringify(obj)
      })
      if (!obj.userId) {
        toast.success('Record Added Successfully')
        formik.setValues({
          ...obj,
          userId: response.userId
        })
      } else toast.success('Record Edited Successfully')
      invalidate()
    }
  })
  useEffect(() => {
    ;(async function () {
      try {
        if (userId) {
          const res = await getRequest({
            extension: PointofSaleRepository.PosUsers.get,
            parameters: `_userId=${userId}`
          })
          formik.setValues(res.record)
        }
      } catch (e) {}
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.PriceLevels} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={SystemRepository.PosUsers.qry}
                  name='userId'
                  label={labels.userId}
                  valueField='recordId'
                  parameters={`_size=1000&_filter=&_startAt=0&_sortBy=fullName`}
                  displayField={['email']}
                  columnsInDropDown={[{ key: 'email', value: 'email' }]}
                  values={formik.values}
                  required
                  maxAccess={maxAccess}
                  readOnly={editMode}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('userId', newValue ? newValue.recordId : '')
                  }}
                  error={formik.touched.userId && Boolean(formik.errors.userId)}
                />
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={PointofSaleRepository.PosUsersPOS.qry}
                name='posId'
                label={labels.posId}
                valueField='recordId'
                displayField={['reference']}
                columnsInDropDown={[{ key: 'reference', value: 'reference' }]}
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('posId', newValue ? newValue.recordId : '')
                }}
                error={formik.touched.posId && Boolean(formik.errors.posId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SaleRepository.PosUsers.qry}
                name='spId'
                label={labels.name}
                valueField='recordId'
                displayField='name'
                columnsInDropDown={[{ key: 'name', value: 'name' }]}
                values={formik.values}
                maxAccess={maxAccess}
                readOnly={editMode}
                onChange={(event, newValue) => {
                  formik.setFieldValue('spId', newValue ? newValue.recordId : '')
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
