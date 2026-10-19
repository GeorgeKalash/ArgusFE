import { useEffect, useContext } from 'react'
import { Grid } from '@mui/material'
import toast from 'react-hot-toast'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import * as yup from 'yup'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'

const IvSettings = ({ _labels, access }) => {
  const { platformLabels } = useContext(ControlContext)
  const { systemDefaults, updateSystemDefaults } = useContext(DefaultsContext)
  const { getRequest, postRequest } = useContext(RequestsContext)

  const arrayAllow = ['itemSearchStyle', 'itemSearchFields', 'iv_minSerialSize', 'minItemSearchTextSize','iv_clone_srl_nra', 'iv_dmgId']

  const { formik } = useForm({
    maxAccess: access,
    initialValues: arrayAllow.reduce((acc, key) => ({ ...acc, [key]: null }), {}),
    validationSchema: yup.object({
      iv_minSerialSize: yup.number().min(1).max(20).nullable(),
      minItemSearchTextSize: yup.number().min(3).max(20).required()
    }),
    onSubmit: async obj => {
      const data = []
      Object.entries(obj).forEach(([key, value]) => {
        const newObj = { key: key, value: value }
        data.push(newObj)
      })
      await postRequest({
        extension: SystemRepository.Defaults.set,
        record: JSON.stringify({ sysDefaults: data })
      })
      updateSystemDefaults(data)
      toast.success(platformLabels.Edited)
    }
  })

  async function fillNbInfo(nraId){
    if (!nraId) return

    const res = await getRequest({
      extension: SystemRepository.NumberRange.get,
      parameters: `_recordId=${nraId}`
    })

    formik.setFieldValue('nraRef', res?.record?.reference || '')
    formik.setFieldValue('nraDescription', res?.record?.description || '')
  }

  useEffect(() => {
  ;(async function () {
    const myObject = {}

    systemDefaults?.list?.forEach(obj => {
      if (arrayAllow.includes(obj.key)) {
        const parsedValue = obj.value ? parseFloat(obj.value) : null
        myObject[obj.key] = parsedValue
        formik.setFieldValue(obj.key, parsedValue)

        if (obj.key === 'iv_clone_srl_nra' && parsedValue) {
          fillNbInfo(parsedValue)
        }
      }
    })
  })()
  }, [systemDefaults])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={access}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.ITEM_SEARCH_STYLE}
                name='itemSearchStyle'
                label={_labels.itemSearchStyle}
                valueField='key'
                displayField='value'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('itemSearchStyle', newValue?.key || '')
                }}
                error={formik.touched.itemSearchStyle && Boolean(formik.errors.itemSearchStyle)}
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.ITEM_SEARCH_FIELDS}
                name='itemSearchFields'
                label={_labels.itemSearchFields}
                valueField='key'
                displayField='value'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('itemSearchFields', newValue?.key || '')
                }}
                error={formik.touched.itemSearchFields && Boolean(formik.errors.itemSearchFields)}
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='iv_minSerialSize'
                label={_labels.serial}
                value={formik.values.iv_minSerialSize}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('iv_minSerialSize', '')}
                error={formik.touched.iv_minSerialSize && Boolean(formik.errors.iv_minSerialSize)}
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='minItemSearchTextSize'
                label={_labels.minItemSearchTextSize}
                value={formik.values.minItemSearchTextSize}
                onChange={formik.handleChange}
                required
                onClear={() => formik.setFieldValue('minItemSearchTextSize', '')}
                error={formik.touched.minItemSearchTextSize && Boolean(formik.errors.minItemSearchTextSize)}
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={SystemRepository.NumberRange.snapshot}
                form={formik}
                valueField='reference'
                displayField='description'
                name='nraRef'
                label={_labels.serialNbRange}
                valueShow='nraRef'
                secondValueShow='nraDescription'
                displayFieldWidth={2}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'description', value: 'Description' }
                ]}
                onChange={(_, newValue) => {
                  formik.setFieldValue('iv_clone_srl_nra', newValue?.recordId || null )
                  formik.setFieldValue('nraRef', newValue?.reference || '')
                  formik.setFieldValue('nraDescription', newValue?.description || '')
                }}
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={12}>
             <ResourceComboBox
                endpointId={InventoryRepository.DimensionGroup.qry}
                name='iv_dmgId'
                label={_labels.dimensionGroup}
                values={formik.values}
                valueField='recordId'
                displayField='name'
                maxAccess={access}
                onChange={(_, newValue) => formik.setFieldValue('iv_dmgId', newValue?.recordId || null)}
                onClear={() => formik.setFieldValue('iv_dmgId', null)}
                error={formik.touched.iv_dmgId && Boolean(formik.errors.iv_dmgId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default IvSettings
