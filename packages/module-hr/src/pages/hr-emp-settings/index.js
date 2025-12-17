import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import toast from 'react-hot-toast'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import * as yup from 'yup'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const EmpSettings = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.EmpSettings
  })

  useEffect(() => {
    ;(async function () {
      const res = await getRequest({
        extension: SystemRepository.Defaults.qry,
        parameters: `_filter=`
      })

      const keysToExtract = [
        'nameFormat',
        'passportCombo',
        'idCombo',
        'retirementAge',
        'employeeRefSize',
        'lvEdId',
        'ep_nraId'
      ]

      const myObject = {}

      for (const { key, value } of res.list) {
        if (keysToExtract.includes(key)) {
          myObject[key] = value ? parseInt(value) : null

          if (key === 'ep_nraId' && parseInt(value)) {
            const itemRes = await getRequest({
              extension: SystemRepository.NumberRange.get,
              parameters: `_recordId=${parseInt(value)}`
            })

            myObject['ep_nraRef'] = itemRes.record?.reference || null
            myObject['ep_nraDes'] = itemRes.record?.description || ''
          }
        }
      }

      formik.setValues({ ...myObject, firstNameFormat: myObject?.nameFormat })
    })()
  }, [])

  const { formik } = useForm({
    maxAccess: access,
    validateOnChange: true,
    initialValues: {
      nameFormat: null,
      passportCombo: null,
      idCombo: null,
      retirementAge: null,
      employeeRefSize: null,
      lvEdId: null,
      ep_nraId: null,
      ep_nraRef: '',
      ep_nraDes: '',
      firstNameFormat: ''
    },
    validationSchema: yup.object().shape({
      retirementAge: yup
        .number()
        .max(100)
        .nullable()
        .transform((value, originalValue) => {
          return originalValue === '' || originalValue == null ? null : value
        }),
      employeeRefSize: yup.number().required().min(0).notOneOf([1, 2]).max(10)
    }),
    onSubmit: async obj => {
      const data = Object.entries(obj)
        .filter(([key]) => !['ep_nraRef', 'ep_nraDes', 'firstNameFormat'].includes(key))

        .map(([key, value]) => ({
          key,
          value
        }))

      await postRequest({
        extension: SystemRepository.Defaults.set,
        record: JSON.stringify({ sysDefaults: data })
      })

      if (obj.nameFormat !== obj.firstNameFormat) {
        await postRequest({
          extension: EmployeeRepository.FullName.sync,
          record: JSON.stringify({ recordId: 1 })
        })
      }

      formik.setFieldValue('firstNameFormat', obj.nameFormat)
      toast.success(platformLabels.Edited)
    }
  })

  return (
    <Form onSave={formik.handleSubmit} maxAccess={access}>
      <VertLayout>
        <Grid container spacing={2} xs={5}>
          <Grid item xs={12}>
            <ResourceComboBox
              datasetId={DataSets.FULL_NAME}
              name='nameFormat'
              label={labels.nameFormat}
              valueField='key'
              displayField='value'
              values={formik.values}
              maxAccess={access}
              onChange={(event, newValue) => {
                formik.setFieldValue('nameFormat', newValue?.key || null)
              }}
              error={formik.touched.nameFormat && Boolean(formik.errors.nameFormat)}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={EmployeeRepository.HRDocTypeFilters.qry}
              name='passportCombo'
              label={labels.passportCombo}
              valueField='recordId'
              displayField='name'
              values={formik.values}
              maxAccess={access}
              onChange={(event, newValue) => {
                formik.setFieldValue('passportCombo', newValue?.recordId || null)
              }}
              error={formik.touched.passportCombo && Boolean(formik.errors.passportCombo)}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={EmployeeRepository.HRDocTypeFilters.qry}
              name='idCombo'
              label={labels.idDocType}
              valueField='recordId'
              displayField='name'
              values={formik.values}
              maxAccess={access}
              onChange={(event, newValue) => {
                formik.setFieldValue('idCombo', newValue?.recordId || null)
              }}
              error={formik.touched.idCombo && Boolean(formik.errors.idCombo)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField
              name='retirementAge'
              label={labels.retirementAge}
              value={formik.values.retirementAge}
              maxAccess={access}
              max='100'
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('retirementAge', '')}
              error={formik.touched.retirementAge && Boolean(formik.errors.retirementAge)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField
              name='employeeRefSize'
              label={labels.employeeRefSize}
              value={formik.values.employeeRefSize}
              maxAccess={access}
              required
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('employeeRefSize', '')}
              error={formik.touched.employeeRefSize && Boolean(formik.errors.employeeRefSize)}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={EmployeeRepository.EmployeeDeduction.qry}
              name='lvEdId'
              label={labels.lvEdId}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              valueField='recordId'
              displayField={['reference', 'name']}
              values={formik.values}
              maxAccess={access}
              onChange={(event, newValue) => {
                formik.setFieldValue('lvEdId', newValue?.recordId || null)
              }}
              error={formik.touched.lvEdId && Boolean(formik.errors.lvEdId)}
            />
          </Grid>

          <Grid item xs={12}>
            <ResourceLookup
              endpointId={SystemRepository.NumberRange.snapshot}
              name='ep_nraId'
              label={labels.empNumberRange}
              valueField='reference'
              displayField='description'
              valueShow='ep_nraRef'
              secondValueShow='ep_nraDes'
              form={formik}
              columnsInDropDown={[
                { key: 'reference', value: 'SKU' },
                { key: 'description', value: 'Description' }
              ]}
              onChange={(event, newValue) => {
                formik.setFieldValue('ep_nraId', newValue?.recordId || null)
                formik.setFieldValue('ep_nraDes', newValue?.description || '')
                formik.setFieldValue('ep_nraRef', newValue?.reference || '')
              }}
              displayFieldWidth={2}
              maxAccess={access}
            />
          </Grid>
        </Grid>
      </VertLayout>
    </Form>
  )
}

export default EmpSettings
