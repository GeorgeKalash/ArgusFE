import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { Grid } from '@mui/material'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { BusinessPartnerRepository } from '@argus/repositories/src/repositories/BusinessPartnerRepository'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'

export default function BankForm({ recordId, labels, maxAccess, seqInfo, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: BusinessPartnerRepository.Bank.qry
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      bpId: recordId || null,
      seqNo: seqInfo?.seqNo || null,
      bankName: '',
      countryId: null,
      accNo: '',
      accName: '',
      swiftCode: '',
      addInfo1: '',
      addInfo2: ''
    },
    validationSchema: yup.object({
      bankName: yup.string().required(),
      countryId: yup.number().required(),
      accNo: yup.string().required(),
      accName: yup.string().required()
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: BusinessPartnerRepository.Bank.set,
        record: JSON.stringify({ ...obj, seqNo: obj?.seqNo || seqInfo?.maxSeqNo + 1 })
      })
      toast.success(platformLabels.Edited)
      invalidate()
      window.close()
    }
  })

  useEffect(() => {
    ;(async function () {
      if (!recordId || !seqInfo?.seqNo) return

      const res = await getRequest({
        extension: BusinessPartnerRepository.Bank.get,
        parameters: `_bpId=${recordId}&_seqNo=${seqInfo?.seqNo}`
      })
      if (res?.record) formik.setValues(res?.record)
    })()
  }, [recordId])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='bankName'
                label={labels.bank}
                value={formik.values?.bankName}
                maxAccess={maxAccess}
                required
                maxLength='30'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('bankName', '')}
                error={formik.touched.bankName && Boolean(formik.errors.bankName)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Country.qry}
                name='countryId'
                label={labels.country}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                required
                values={formik.values}
                valueField='recordId'
                displayField={['reference', 'name', 'flName']}
                maxAccess={maxAccess}
                onChange={(_, newValue) => formik.setFieldValue('countryId', newValue?.recordId || null)}
                error={formik.touched.countryId && Boolean(formik.errors.countryId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='accNo'
                label={labels.accNo}
                value={formik.values?.accNo}
                maxAccess={maxAccess}
                required
                maxLength='30'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('accNo', '')}
                error={formik.touched.accNo && Boolean(formik.errors.accNo)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='accName'
                label={labels.accName}
                value={formik.values?.accName}
                required
                maxLength='30'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('accName', '')}
                error={formik.touched.accName && Boolean(formik.errors.accName)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='swiftCode'
                label={labels.swiftCode}
                value={formik.values?.swiftCode}
                maxAccess={maxAccess}
                maxLength='15'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('swiftCode', '')}
                error={formik.touched.swiftCode && Boolean(formik.errors.swiftCode)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='addInfo1'
                label={labels.addInfo1}
                value={formik.values?.addInfo1}
                maxAccess={maxAccess}
                maxLength='30'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('addInfo1', '')}
                error={formik.touched.addInfo1 && Boolean(formik.errors.addInfo1)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='addInfo2'
                label={labels.addInfo2}
                value={formik.values?.addInfo2}
                maxAccess={maxAccess}
                maxLength='30'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('addInfo2', '')}
                error={formik.touched.addInfo2 && Boolean(formik.errors.addInfo2)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}
