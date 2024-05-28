import { Grid } from '@mui/material'
import * as yup from 'yup'
import { useEffect, useContext } from 'react'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FormShell from 'src/components/Shared/FormShell'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { RequestsContext } from 'src/providers/RequestsContext'
import toast from 'react-hot-toast'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { CTCLRepository } from 'src/repositories/CTCLRepository'
import { formatDateFromApi } from 'src/lib/date-helper'
import FieldSet from 'src/components/Shared/FieldSet'
import { useWindow } from 'src/window'
import BenificiaryBank from 'src/pages/outwards-transfer/Tabs/BenificiaryBank'
import BenificiaryCash from 'src/pages/outwards-transfer/Tabs/BenificiaryCash'

export default function OutwardsModificationForm({ maxAccess, labels, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const [editMode, setEditMode] = !!recordId

  const { formik } = useForm({
    maxAccess: maxAccess,
    initialValues: {
      recordId: null,
      reference: '',

      //date: new Date(),
      outwardsDate: null,
      outwardRef: '',
      ttNo: '',
      productName: '',
      clientId: '',
      clientRef: '',
      clientName: ''
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(' '),
      bankId: yup.string().required(' ')
    }),
    onSubmit: async values => {
      /*   const res = await postRequest({
        extension: RemittanceOutwardsRepository.BeneficiaryBank.set,
        record: JSON.stringify(values)
      })

      if (res.recordId) {
        toast.success('Record Updated Successfully')
      }*/
    }
  })
  function fillOutwardData(data) {
    formik.setFieldValue('outwardRef', data ? data.reference : '')
    formik.setFieldValue('outwardsDate', data ? formatDateFromApi(data.date) : '')
    formik.setFieldValue('amount', data ? data.amount : '')
    formik.setFieldValue('productName', data ? data.productId : '')
    formik.setFieldValue('clientId', data ? data.clientId : '')
    formik.setFieldValue('clientRef', data ? data.clientRef : '')
    formik.setFieldValue('clientName', data ? data.clientName : '')
    formik.setFieldValue('ttNo', data ? data.ttNo : '')
    viewBeneficiary(data ? data.dispersalType : '')
  }
  function viewBeneficiary(dispersalType) {
    if (formValues.dispersalType === 1) {
      stack({
        Component: BenificiaryCash,
        props: {
          clientId: formik.values.clientId,
          countryId: formik.values.countryId,
          beneficiaryId: formik.values.beneficiaryId
        },
        width: 700,
        height: 500,
        title: 'Cash'
      })
    } else if (formValues.dispersalType === 2) {
      stack({
        Component: BenificiaryBank,
        props: {
          clientId: formik.values.clientId,
          dispersalType: formik.values.dispersalType,
          countryId: formik.values.countryId,
          beneficiaryId: formik.values.beneficiaryId
        },
        width: 900,
        height: 600,
        title: 'Bank'
      })
    }
  }

  return (
    <FormShell resourceId={ResourceIds.OutwardsModification} form={formik} height={480} maxAccess={maxAccess}>
      <VertLayout>
        <Grow>
          <Grid container>
            <Grid container sx={{ display: 'flex', flexDirection: 'row' }}>
              <Grid item xs={4}>
                <CustomTextField
                  name='reference'
                  label={labels.reference}
                  value={formik.values.reference}
                  maxAccess={maxAccess}
                  maxLength='15'
                  readOnly
                  required
                />
              </Grid>
              <Grid item xs={4} sx={{ pl: 1 }}>
                <CustomDatePicker
                  name='date'
                  required
                  label={labels.date}
                  value={formik.values.date}
                  editMode={editMode}
                  maxAccess={maxAccess}
                  error={formik.touched.date && Boolean(formik.errors.date)}
                />
              </Grid>
            </Grid>
            <Grid container sx={{ display: 'flex', flexDirection: 'row' }}>
              <Grid item xs={4}>
                <ResourceLookup
                  endpointId={RemittanceOutwardsRepository.OutwardsTransfer.snapshot}
                  valueField='reference'
                  displayField='reference'
                  name='outwardRef'
                  secondDisplayField={false}
                  required
                  label={labels.outward}
                  form={formik}
                  onChange={(event, newValue) => {
                    fillOutwardData(newValue)
                  }}
                  error={formik.touched.outwardRef && Boolean(formik.errors.outwardRef)}
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={4} sx={{ pl: 1, pt: 2 }}>
                <CustomTextField
                  name='ttNo'
                  label={labels.ttNo}
                  value={formik.values.ttNo}
                  readOnly
                  error={formik.touched.ttNo && Boolean(formik.errors.ttNo)}
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={4} sx={{ pl: 1, pt: 2 }}>
                <CustomDatePicker
                  name='outwardsDate'
                  label={labels.outwardsDate}
                  value={formik.values.outwardsDate}
                  editMode={editMode}
                  maxAccess={maxAccess}
                  readOnly
                  error={formik.touched.date && Boolean(formik.errors.date)}
                />
              </Grid>
            </Grid>
            <Grid container sx={{ display: 'flex', flexDirection: 'row' }}>
              <Grid item xs={4} sx={{ pt: 2 }}>
                <CustomNumberField
                  name='amount'
                  label={labels.amount}
                  value={formik.values.amount}
                  maxAccess={maxAccess}
                  readOnly
                  error={formik.touched.amount && Boolean(formik.errors.amount)}
                />
              </Grid>
              <Grid item xs={8} sx={{ pl: 1, pt: 2 }}>
                <ResourceLookup
                  endpointId={CTCLRepository.ClientCorporate.snapshot}
                  parameters={{
                    _category: 0
                  }}
                  valueField='reference'
                  displayField='name'
                  name='clientId'
                  label={labels.client}
                  form={formik}
                  readOnly
                  displayFieldWidth={2}
                  valueShow='clientRef'
                  secondValueShow='clientName'
                  maxAccess={maxAccess}
                  errorCheck={'clientId'}
                />
              </Grid>
            </Grid>
            <Grid item xs={4} sx={{ pt: 2 }}>
              <CustomTextField
                name='productName'
                label={labels.product}
                value={formik.values.productName}
                readOnly
                error={formik.touched.ttNo && Boolean(formik.errors.productName)}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
          <Grid container>
            <Grid container rowGap={2} xs={6} spacing={2} sx={{ pt: 5, pl: 2 }}>
              <FieldSet title='Benificiary [Old]'></FieldSet>
            </Grid>
            <Grid container rowGap={2} xs={6} spacing={2} sx={{ pt: 5, pl: 4 }}>
              <FieldSet title='Benificiary [New]'></FieldSet>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
