// ** MUI Imports
import { Checkbox, FormControlLabel, Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'

import { FinancialRepository } from 'src/repositories/FinancialRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'
import { SaleRepository } from 'src/repositories/SaleRepository'

export default function AccountsForms({ labels, maxAccess, recordId }) {
  const [isLoading, setIsLoading] = useState(false)
  const [editMode, setEditMode] = useState(!!recordId)

  const [initialValues, setInitialData] = useState({
    recordId: null,
    groupId: null,
    groupename: '',
    reference: null,
    name: '',
    keyWords: null,
    flName: null,
    type: null,
    BpRef: null,
    szId: null,
    spId: null,
    inactive: false
  })

  const { getRequest, postRequest } = useContext(RequestsContext)

  //const editMode = !!recordId

  const invalidate = useInvalidate({
    endpointId: FinancialRepository.Account.page
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(),
      type: yup.string().required(),
      groupId: yup.string().required(),
      reference: yup.string().required()
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId

      const response = await postRequest({
        extension: FinancialRepository.Account.set,
        record: JSON.stringify(obj)
      })

      if (!recordId) {
        toast.success('Record Added Successfully')
        setInitialData({
          ...obj, // Spread the existing properties
          recordId: response.recordId // Update only the recordId field
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
          setIsLoading(true)

          const res = await getRequest({
            extension: FinancialRepository.Account.get,
            parameters: `_recordId=${recordId}`
          })
          setInitialData(res.record)
        }
      } catch (exception) {
        setErrorMessage(error)
      }
      setIsLoading(false)
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.Accounts} form={formik} height={600} maxAccess={maxAccess} editMode={editMode}>
      <Grid container>
        <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={FinancialRepository.Group.qry}
              name='groupId'
              required
              label={labels.accountGroup}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              valueField='recordId'
              displayField='name'
              values={formik.values}
              onChange={(event, newValue) => {
                if (newValue) {
                  formik.setFieldValue('groupId', newValue?.recordId)
                  formik.setFieldValue('groupName', newValue?.name)
                } else {
                  formik.setFieldValue('groupId', '')
                  formik.setFieldValue('groupName', '')
                }
              }}
              error={formik.touched.groupId && Boolean(formik.errors.groupId)}

              // helperText={formik.touched.groupId && formik.errors.groupId}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='reference'
              label={labels.reference}
              value={formik.values.reference}
              maxAccess={maxAccess}
              required
              maxLength='10'
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('reference', '')}
              error={formik.touched.reference && Boolean(formik.errors.reference)}

              // helperText={formik.touched.reference && formik.errors.reference}
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

              // helperText={formik.touched.name && formik.errors.name}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='keyWords'
              label={labels.keyWords}
              value={formik.values.keyWords}
              maxAccess={maxAccess}
              maxLength='30'
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('keyWords', '')}
              error={formik.touched.keyWords && Boolean(formik.errors.keyWords)}

              // helperText={formik.touched.keyWords && formik.errors.keyWords}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='flName'
              label={labels.foreinLanguageName}
              value={formik.values.flName}
              maxAccess={maxAccess}
              maxLength='30'
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('flName', '')}
              error={formik.touched.flName && Boolean(formik.errors.flName)}

              // helperText={formik.touched.flName && formik.errors.flName}
            />
          </Grid>
        </Grid>
        <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
          <Grid item xs={12}>
            <ResourceComboBox
              name='type'
              label={labels.type}
              datasetId={DataSets.FI_GROUP_TYPE}
              required
              values={formik.values}
              valueField='key'
              displayField='value'
              onChange={(event, newValue) => {
                if (newValue) {
                  formik.setFieldValue('type', newValue?.key)
                } else {
                  formik.setFieldValue('type', newValue?.key)
                }
              }}
              error={formik.touched.type && Boolean(formik.errors.type)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='BpRef'
              label={labels.BpRef}
              value={formik.values.BpRef}
              readOnly
              maxAccess={maxAccess}
              maxLength='30'
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('BpRef', '')}
              error={formik.touched.BpRef && Boolean(formik.errors.BpRef)}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={SaleRepository.SalesZone.qry}
              parameters={`_startAt=0&_pageSize=1000&_sortField="recordId"&_filter=`}
              name='szId'
              label={labels.salesZone}
              columnsInDropDown={[{ key: 'name', value: 'Name' }]}
              valueField='recordId'
              displayField='name'
              values={formik.values}
              onChange={(event, newValue) => {
                if (newValue) {
                  formik.setFieldValue('szId', newValue?.recordId)
                } else {
                  formik.setFieldValue('szId', '')
                }
              }}
              error={formik.touched.szId && Boolean(formik.errors.szId)}

              // helperText={formik.touched.szId && formik.errors.szId}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={SaleRepository.SalesPerson.qry}
              name='spId'
              label={labels.salesPerson}
              columnsInDropDown={[{ key: 'name', value: 'Name' }]}
              valueField='recordId'
              displayField='name'
              values={formik.values}
              onChange={(event, newValue) => {
                if (newValue) {
                  formik.setFieldValue('spId', newValue?.recordId)
                } else {
                  formik.setFieldValue('spId', '')
                }
              }}
              error={formik.touched.spId && Boolean(formik.errors.spId)}

              // helperText={formik.touched.spId && formik.errors.spId}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  name='inactive'
                  maxAccess={maxAccess}
                  checked={formik.values?.inactive}
                  onChange={event => {
                    formik.setFieldValue('inactive', event.target.checked)
                  }}
                />
              }
              label={labels.inactive}
            />
          </Grid>
        </Grid>
      </Grid>
    </FormShell>
  )
}
