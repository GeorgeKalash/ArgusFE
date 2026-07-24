import { useState, useContext, useEffect, useRef } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useForm } from '@argus/shared-hooks/src/hooks/form.js'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { Grid } from '@mui/material'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import toast from 'react-hot-toast'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'
import FieldSet from '@argus/shared-ui/src/components/Shared/FieldSet'

const PropertiesForm = ({ labels, store, maxAccess }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId, _dmgId: dmgId } = store
  const { systemDefaults } = useContext(DefaultsContext)
  const { platformLabels } = useContext(ControlContext)

  const [dimensions, setDimensions] = useState([])

  const [hasSavedData, setHasSavedData] = useState(false)
  const isDmgChanged = useRef(false)

  const dimensionsUDT =
    systemDefaults?.list
      ?.filter(
        item =>
          item.key.includes('ivtUDT') &&
          item.key !== 'ivtUDTCount' &&
          item.value?.length > 0
      )
      ?.map(item => ({
        ...item,
        dimensionId: item.key.match(/\d+$/)?.[0]
      })) ?? []

  const isEmptyValue = value => value === '' || value === undefined || value === null

  const computeHasSavedData = values =>
    Object.values(values).some(value => !isEmptyValue(value))

  const loadDimensionFields = async groupId => {
    if (!groupId) {
      setDimensions([])
      setHasSavedData(false)
      
      return
    }

    const { list = [] } = await getRequest({
      extension: InventoryRepository.DimensionGroupElement.qry,
      parameters: `_groupId=${groupId}`
    })

    setDimensions(list)

    const newDimensionValues = list.reduce((acc, item) => {
      acc[item.dimension] = isDmgChanged.current ? '' : (item.id || '')
      return acc
    }, {})

    setHasSavedData(computeHasSavedData(newDimensionValues))
  }

  useEffect(() => {
    if (!store.packB) return

    const { dimensionGroupElements = [], itemDimensions = [], userDefinedTexts = [] } = store.packB
    setDimensions(dimensionGroupElements)

    const newDimensionValues = itemDimensions.reduce((acc, item) => {
      acc[item.dimension] = item.id
      return acc
    }, {})

    const newDimensionUDTValues = userDefinedTexts.reduce((acc, item) => {
      acc[`ivtUDT${item.dimension}`] = item.value
      return acc
    }, {})

    setHasSavedData(computeHasSavedData(newDimensionValues))

    formik.setValues(prev => ({
      ...prev,
      ...newDimensionValues,
      ...newDimensionUDTValues
    }))
  }, [store.packB])

  const { formik } = useForm({
    initialValues: {},
    onSubmit: async values => {
      if (dmgId != formik.values.dmgId) {
         await postRequest({
          extension: InventoryRepository.Items.set,
          record: JSON.stringify({...store?.itemObject, dmgId: formik.values.dmgId})
        })
      }
      const isEmpty = value => value === '' || value === undefined || value === null

      const filteredUdtData = dimensionsUDT
      .map(udt => ({
        dimension: udt.dimensionId,
        itemId: recordId,
        value: values[udt.key]
      }))
      .filter(item => !isEmpty(item.value))

      await postRequest({
        extension: InventoryRepository.DimensionUDT.set,
        record: JSON.stringify({ itemId: recordId, data: filteredUdtData })
      })

      await saveDimensionValues(platformLabels.Edited, values)
      setHasSavedData(dimensions.some(
        dimension => !isEmpty(values[dimension.dimensionId])
      ))
    }
  })

  async function saveDimensionValues (toastMessage, values) {
    const isEmpty = value => value === '' || value === undefined || value === null

    const filteredData = dimensions
      .map(dimension => ({
        dimension: dimension.dimensionId,
        id: values[dimension.dimensionId],
        itemId: recordId
      }))
      .filter(item => !isEmpty(item.id))

    await postRequest({
      extension: InventoryRepository.DimensionId.set,
      record: JSON.stringify({ itemId: recordId, data: filteredData })
    })

    toast.success(toastMessage)
    isDmgChanged.current = false
  }

  useEffect(() => {
   if (dmgId) formik.setFieldValue('dmgId', dmgId)
  }, [dmgId])

  const hasCurrentValues = dimensions.some(
    dimension => {
      const value = formik.values[dimension.dimensionId]
      return value !== '' && value !== null && value !== undefined
    }
  )

  const deleteDimensionFields = async () => {
    const clearedValues = dimensions.reduce((acc, dimension) => {
      acc[dimension.dimensionId] = ''
      return acc
    }, {})

    const values = { ...formik.values, ...clearedValues }
    formik.setValues(values)
    if (hasSavedData) {
      await saveDimensionValues(platformLabels.Deleted, values)
      setHasSavedData(false)
    } else {
      toast.success(platformLabels.Cleared)
    }
  }

  const actions = [
    {
      key: 'Delete',
      condition: true,
      onClick: deleteDimensionFields,
      disabled: !hasSavedData
    }
  ]

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} actions={actions}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                store={store?.dimensionGroups}
                name='dmgId'
                label={labels.dmgName}
                values={formik.values}
                valueField='recordId'
                displayField='name'
                readOnly={hasCurrentValues}
                maxAccess={maxAccess}
                onChange={async (_, newValue) => {
                  isDmgChanged.current = true
                  await loadDimensionFields(newValue?.recordId || null)
                  formik.setFieldValue('dmgId', newValue?.recordId || null)
                }}
                error={formik.touched.dmgId && Boolean(formik.errors.dmgId)}
              />
            </Grid>
            {
              dimensions && dimensions.length > 0 && (
                
                  <Grid item xs={6}>
                    <FieldSet title={labels.dimensions}>
                    {dimensions?.map((dimension, index) => {
                      const dimensionNumber = dimension.dimensionId

                      const options =
                        (store.packB?.dimensions || [])
                          .filter(d => d.dimension === dimensionNumber)
                      return (
                        <Grid container mt={0.2} spacing={2} key={index}>
                          <Grid item xs={12}>
                            <ResourceComboBox
                              store={options}
                              name={`${dimension.dimensionId}`}
                              label={dimension.dimensionName}
                              valueField='id'
                              displayField='name'
                              maxAccess={maxAccess}
                              values={formik.values}
                              onChange={(_, newValue) =>
                                formik.setFieldValue(
                                  `${dimension.dimensionId}`,
                                  newValue?.id || null
                                )
                              }
                            />
                          </Grid>
                        </Grid>
                      )
                    })}
                    
                </FieldSet>
                  </Grid>
              )
            }
            
          
            <Grid item xs={6}>
              <FieldSet title={labels.texts}>
                {dimensionsUDT.map((dimension, index) => {
                  return (
                    <Grid container mt={0.2} spacing={2} key={index}>
                      <Grid item xs={12}>
                        <CustomTextField
                          name={dimension.key}
                          label={dimension.value}
                          value={formik.values[dimension.key]}
                          onChange={formik.handleChange}
                          maxAccess={maxAccess}
                          onClear={() => formik.setFieldValue([dimension.key], '')}
                        />
                      </Grid>
                    </Grid>
                  )
                })}
              </FieldSet>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default PropertiesForm
