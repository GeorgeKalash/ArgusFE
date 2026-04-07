import { useState, useContext, useEffect } from 'react'
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

const PropertiesForm = ({ labels, store, maxAccess }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId, _dmgId, _dmgName } = store
  const { systemDefaults } = useContext(DefaultsContext)

  const { platformLabels } = useContext(ControlContext)

  const [dimensions, setDimensions] = useState([])
  const [dimensionsUDT, setDimensionsUDT] = useState([])

  useEffect(() => {
    const loadDimensions = async () => {
      if (recordId && _dmgId) {
        const fetchDimensionResult = await getRequest({
          extension: InventoryRepository.DimensionGroupElement.qry,
          parameters: `_groupId=${_dmgId}`
        })

        setDimensions(fetchDimensionResult.list)
      }

      const filteredDimensions2 = systemDefaults?.list
        ?.filter(
          item => item.key.includes('ivtUDT') && item.key !== 'ivtUDTCount' && item?.value?.length > 0
        )
        ?.map(item => ({
          ...item,
          dimensionId: item.key.match(/\d+$/)?.[0]
        }))

      setDimensionsUDT(filteredDimensions2)
    }

    loadDimensions()
  }, [recordId, _dmgId, systemDefaults])

  useEffect(() => {
    const fetchDimensionsData = async () => {
      if (recordId && dimensions?.length > 0) {
        const dimensionRequests = dimensions.map(dimension => {
          const dimensionNumber = dimension.dimensionId

          return getRequest({
            extension: InventoryRepository.DimensionId.get,
            parameters: `_itemId=${recordId}&_dimension=${dimensionNumber}`
          })
        })

        const dimensionResponses = await Promise.all(dimensionRequests)

        const newDimensionValues = dimensionResponses.reduce((acc, res, index) => {
          const dimensionKey = dimensions[index].dimensionId
          acc[dimensionKey] = res.record?.id || ''

          return acc
        }, {})

        const udtRequests = dimensionsUDT
          .filter(dimension => dimension.dimensionId)
          .map(dimension => {
            return getRequest({
              extension: InventoryRepository.DimensionUDT.get,
              parameters: `_itemId=${recordId}&_dimension=${dimension.dimensionId}`
            })
          })

        const udtResponses = await Promise.all(udtRequests)

        const newUDTValues = udtResponses.reduce((acc, res, index) => {
          const udtKey = dimensionsUDT.filter(dimension => dimension.dimensionId)[index]?.key
          acc[udtKey] = res?.record?.value || ''

          return acc
        }, {})
        formik.setValues(prevValues => ({
          ...prevValues,
          ...newDimensionValues,
          ...newUDTValues
        }))
      }
    }

    fetchDimensionsData()
  }, [recordId, dimensionsUDT, dimensions])

  const { formik } = useForm({
    initialValues: {},

    validateOnChange: true,
    onSubmit: async () => {
      const submissionData = dimensions.map(dimension => ({
        dimension: dimension.dimensionId,
        id: formik.values[dimension.dimensionId],
        itemId: recordId
      }))

      const filteredData = submissionData.filter(item => item.id !== '' && item.id !== undefined && item.id !== null)

      const udtData = dimensionsUDT.map(udt => {
        const udtNumber = udt.key.match(/\d+$/)?.[0]

        return {
          dimension: udtNumber,
          itemId: recordId,
          value: formik.values[udt.key]
        }
      })

      const filteredUdtData = udtData.filter(
        item => item.value !== '' && item.value !== undefined && item.value !== null
      )

      if (filteredData?.length > 0) {
        await postRequest({
          extension: InventoryRepository.DimensionId.set,
          record: JSON.stringify({
            itemId: recordId,
            data: filteredData
          })
        })
      }

      if (filteredUdtData?.length > 0) {
        await postRequest({
          extension: InventoryRepository.DimensionUDT.set,
          record: JSON.stringify({
            itemId: recordId,
            data: filteredUdtData
          })
        })
      }
      toast.success(platformLabels.Edited)
    }
  })

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <CustomTextField
              name='dmgName'
              label={labels.dmgName}
              value={_dmgName}
              readOnly
            />
            {
              dimensions && dimensions.length > 0 && (
                <Grid item xs={6}>
                  {dimensions?.map((dimension, index) => {
                    const dimensionNumber = dimension.dimensionId

                    return (
                      <Grid container mt={0.2} spacing={2} key={index}>
                        <Grid item xs={12}>
                          <ResourceComboBox
                            endpointId={InventoryRepository.Dimension.qry}
                            parameters={`_dimension=${dimensionNumber}`}
                            name={`${dimension.dimensionId}`}
                            label={dimension.dimensionName}
                            valueField='id'
                            displayField='name'
                            values={formik.values}
                            onChange={(_, newValue) => formik.setFieldValue(`${dimension.dimensionId}`, newValue?.id || null)}
                          />
                        </Grid>
                      </Grid>
                    )
                  })}
                </Grid>
              )
            }
            

            <Grid item xs={6}>
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
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default PropertiesForm
