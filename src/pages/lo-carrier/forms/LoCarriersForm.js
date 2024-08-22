import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { LogisticsRepository } from 'src/repositories/LogisticsRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { DataSets } from 'src/resources/DataSets'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import { useForm } from 'src/hooks/form'

export default function LoCarriersForms({ labels, maxAccess, recordId }) {
  const [editMode, setEditMode] = useState(!!recordId)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: LogisticsRepository.LoCarrier.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      reference: '',
      name: '',
      type: null,
      siteId: null,
      bpId: null,
      bpName: null,

      bpRef: null,
      cashAccountId: null,
      cashAccountRef: '',
      cashAccountName: ''
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required(' '),
      name: yup.string().required(' '),
      type: yup.string().required(' ')
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId

      const response = await postRequest({
        extension: LogisticsRepository.LoCarrier.set,
        record: JSON.stringify(obj)
      })

      if (!recordId) {
        toast.success('Record Added Successfully')
        formik.setValues({
          ...obj,
          recordId: response.recordId
        })
      } else toast.success('Record Edited Successfully')
      setEditMode(true)

      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: LogisticsRepository.LoCarrier.get,
            parameters: `_recordId=${recordId}`
          })

          formik.setValues(res.record)
        }
      } catch (exception) {}
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.LoCarriers} form={formik} height={300} maxAccess={maxAccess} editMode={editMode}>
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
                maxLength='10'
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
                maxLength='30'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.LO_TYPE}
                name='type'
                label={labels.type}
                valueField='key'
                required
                displayField='value'
                values={formik.values}
                onChange={(event, newValue) => {
                  if (newValue) {
                    formik.setFieldValue('type', newValue?.key)
                  } else {
                    formik.setFieldValue('type', '')
                  }
                }}
                error={formik.touched.type && Boolean(formik.errors.type)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.Site.qry}
                name='siteId'
                label={labels.site}
                values={formik.values}
                displayField='name'
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('siteId', newValue?.recordId)
                }}
                error={formik.touched.siteId && Boolean(formik.errors.siteId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={BusinessPartnerRepository.MasterData.snapshot}
                name='bpRef'
                label={labels.businessPartner}
                valueField='reference'
                displayField='name'
                valueShow='bpRef'
                secondValueShow='bpName'
                form={formik}
                onChange={(event, newValue) => {
                  formik.setValues({
                    ...formik.values,
                    bpId: newValue?.recordId || '',
                    bpRef: newValue?.reference || '',
                    bpName: newValue?.name || ''
                  })
                }}
                errorCheck={'bpId'}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={CashBankRepository.CashAccount.snapshot}
                parameters={{
                  _type: 2
                }}
                valueField='recordId'
                displayField='reference'
                name='cashAccountRef'
                label={labels.cashAccount}
                secondDisplayField={true}
                form={formik}
                firstValue={formik.values.cashAccountRef}
                secondValue={formik.values.cashAccountName}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                onChange={(event, newValue) => {
                  if (newValue) {
                    formik.setFieldValue('cashAccountId', newValue?.recordId)
                    formik.setFieldValue('cashAccountRef', newValue?.reference)
                    formik.setFieldValue('cashAccountName', newValue?.name)
                  } else {
                    formik.setFieldValue('cashAccountId', null)
                    formik.setFieldValue('cashAccountRef', null)
                    formik.setFieldValue('cashAccountName', null)
                  }
                }}
                errorCheck={'cashAccountId'}
                maxAccess={maxAccess}
                error={formik.touched.cashAccountId && Boolean(formik.errors.cashAccountId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
