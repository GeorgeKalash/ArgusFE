import { Checkbox, FormControlLabel, Grid } from '@mui/material'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import { useContext, useEffect } from 'react'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FormShell from 'src/components/Shared/FormShell'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useInvalidate } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { DataSets } from 'src/resources/DataSets'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { MasterSource } from 'src/resources/MasterSource'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'

const AccountsForms = ({ labels, maxAccess, setStore, store }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId } = store

  const invalidate = useInvalidate({
    endpointId: FinancialRepository.Account.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      groupId: null,
      groupename: '',
      reference: null,
      name: '',
      keywords: null,
      flName: null,
      type: null,
      BpRef: null,
      szId: null,
      spId: null,
      inactive: false
    },
    maxAccess: maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(),
      type: yup.string().required(),
      groupId: yup.string().required(),
      reference: yup.string().required()
    }),
    onSubmit: async values => {
      await postAccount(values)
    }
  })

  const postAccount = async obj => {
    const recordId = obj.recordId
    await postRequest({
      extension: FinancialRepository.Account.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        if (!recordId) {
          setStore(prevStore => ({
            ...prevStore,
            recordId: res.recordId
          }))
          formik.setFieldValue('recordId', res.recordId)
          toast.success(platformLabels.Added)
          invalidate()
        } else toast.success(platformLabels.Edited)
      })
      .catch(error => {})
  }

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: FinancialRepository.Account.get,
          parameters: `_recordId=${recordId}`
        })
        formik.setValues(res.record)
      }
    })()
  }, [])

  const editMode = !!formik.values.recordId

  const actions = [
    {
      key: 'RecordRemarks',
      condition: true,
      onClick: 'onRecordRemarks',
      disabled: !editMode
    },
    {
      key: 'Integration Account',
      condition: true,
      onClick: 'onClickGIA',
      disabled: !editMode
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.Accounts}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
      masterSource={MasterSource.Account}
    >
      <VertLayout>
        <Grow>
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
                <CustomTextField
                  name='keywords'
                  label={labels.keyWords}
                  value={formik.values.keywords}
                  maxAccess={maxAccess}
                  maxLength='30'
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('keywords', '')}
                  error={formik.touched.keywords && Boolean(formik.errors.keywords)}
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
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default AccountsForms
