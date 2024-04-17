import { Grid } from '@mui/material'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import FormGrid from 'src/components/form/layout/FormGrid'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataSets } from 'src/resources/DataSets'
import { useFormik } from 'formik'
import { RemittanceBankInterface } from 'src/repositories/RemittanceBankInterface'

export default function InstantCash() {
  const { labels: _labels, maxAccess } = useResourceQuery({
    datasetId: ResourceIds.InstantCash
  })

  const formik = useFormik({
    //maxAccess,
    initialValues: {
      payingAgent: '',
      deliveryModeId: '',
      currency: '',
      partnerReference: '',
      sourceAmount: '',
      fromCountryId: '',
      toCountryId: '',
      sourceOfFundsId: '',
      remittancePurposeId: '',
      totalTransactionAmountPerAnnum: '',
      transactionsPerAnnum: '',
      remitter: [
        {
          cardNo: '',
          firstName: '',
          middleName: '',
          lastName: '',
          mobileNumber: '',
          phoneNumber: '',
          email: '',
          address: [
            {
              addressLine1: '',
              addressLine2: '',
              district: '',
              city: '',
              postCode: '',
              state: '',
              country: ''
            }
          ],
          primaryId: [
            {
              type: '',
              number: '',
              issueDate: '',
              expiryDate: '',
              placeOfIssue: ''
            }
          ],
          dateOfBirth: '',
          gender: '',
          nationality: '',
          countryOfBirth: '',
          countryOfResidence: '',
          relation: '',
          otherRelation: '',
          profession: '',
          employerName: '',
          employerStatus: ''
        }
      ],
      beneficiary: [
        {
          cardNo: '',
          firstName: '',
          middleName: '',
          lastName: '',
          mobileNumber: '',
          phoneNumber: '',
          email: '',
          address: [
            {
              addressLine1: '',
              addressLine2: '',
              district: '',
              city: '',
              postCode: '',
              state: '',
              country: ''
            }
          ],
          dateOfBirth: '',
          gender: '',
          nationality: '',
          countryOfBirth: '',
          bankDetails: [
            {
              bankCode: '',
              bankName: '',
              bankAddress1: '',
              bankAccountNumber: ''
            }
          ]
        }
      ]
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      // name: yup.string().required(' ')
    })
  })

  return (
    <FormShell resourceId={ResourceIds.InstantCash} form={formik} height={480} maxAccess={maxAccess}>
      <Grid container>
        {/* First Column */}
        <Grid container rowGap={2} xs={6} sx={{ px: 2, pt: 2 }}>
          <FormGrid hideonempty xs={12}>
            <ResourceComboBox
              endpointId={RemittanceBankInterface.DeliveryModes.qry}
              parameters={`_combo=1`}
              name='deliveryModeId'
              label={_labels.deliveryModeId}
              valueField='recordId'
              displayField='name'
              values={formik.values}
              onChange={(event, newValue) => {
                if (newValue) {
                  formik.setFieldValue('deliveryModeId', newValue?.recordId)
                } else {
                  formik.setFieldValue('deliveryModeId', '')
                }
              }}
              maxAccess={maxAccess}
              error={formik.touched.deliveryModeId && Boolean(formik.errors.deliveryModeId)}
              helperText={formik.touched.deliveryModeId && formik.errors.deliveryModeId}
            />
          </FormGrid>
        </Grid>
        {/* Second Column */}
        <Grid container rowGap={2} xs={6} sx={{ px: 2, pt: 2 }}></Grid>
      </Grid>
    </FormShell>
  )
}
