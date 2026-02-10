import { useState, useContext, useEffect } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useForm } from '@argus/shared-hooks/src/hooks/form.js'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { Grid } from '@mui/material'
import toast from 'react-hot-toast'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { FinancialRepository } from '@argus/repositories/src/repositories/FinancialRepository'

export default function DimensionsForm({ store, maxAccess }) {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { recordId: accountId } = store

  const { platformLabels, defaultsData } = useContext(ControlContext)
  const dimCount = parseInt(
    defaultsData?.list?.find(obj => obj.key === 'DimCount')?.value,
    10
  )

  const [dimensionFields, setDimensionFields] = useState([])

  const toSafeFieldKey = value => {
    const raw = String(value ?? '').trim()
    if (!raw) return ''
    return raw.replace(/[^a-zA-Z0-9_]/g, '_')
  }

  useEffect(() => {
    if (!Number.isFinite(dimCount) || dimCount <= 0) {
      setDimensionFields([])
      return
    }

    const keys = Array.from({ length: dimCount }, (_, idx) => `tpaDimension${idx + 1}`)
    const filteredList = (defaultsData?.list || []).filter(obj => keys.includes(obj.key))

    const fields = filteredList.map((obj, index) => {
      const dimensionNumber = index + 1
      const safeValueKey = toSafeFieldKey(obj.value)
      const fallbackKey = toSafeFieldKey(obj.key)
      const fieldKey = safeValueKey || fallbackKey

      return {
        dimensionNumber,
        fieldKey,
        label: String(obj.value ?? obj.key)
      }
    })

    const seen = new Set()
    const uniqueFields = fields.map(f => {
      let k = f.fieldKey
      if (seen.has(k)) k = `${k}_${f.dimensionNumber}`
      seen.add(k)
      return { ...f, fieldKey: k }
    })

    setDimensionFields(uniqueFields)
  }, [dimCount, defaultsData])

  const { formik } = useForm({
    initialValues: { accountId: accountId ?? '' },
    validateOnChange: true,
    onSubmit: async () => {
      const submissionData = dimensionFields.map(f => ({
        dimension: f.dimensionNumber,
        id: formik.values[f.fieldKey],
        accountId
      }))

      const filteredData = submissionData.filter(
        item => item.id !== '' && item.id !== undefined && item.id !== null
      )

      if (filteredData.length > 0) {
        await postRequest({
          extension: FinancialRepository.AccountDimensions.set2,
          record: JSON.stringify({
            accountId,
            data: filteredData
          })
        })
      }

      toast.success(platformLabels.Edited)
    }
  })

  useEffect(() => {
    const run = async () => {
      if (!accountId) return
      if (!dimensionFields?.length) return

      const nextValues = { ...formik.values, accountId: accountId ?? '' }

      dimensionFields.forEach(f => {
        if (nextValues[f.fieldKey] === undefined) nextValues[f.fieldKey] = null
      })

      const res = await getRequest({
        extension: FinancialRepository.AccountDimensions.qry,
        parameters: `_filter=&_accountId=${accountId}`
      })

      const list = res?.list || []

      const mapByDimension = new Map(
        dimensionFields.map(f => [Number(f.dimensionNumber), f.fieldKey])
      )

      list.forEach(item => {
        const fieldKey = mapByDimension.get(Number(item.dimension))
        if (fieldKey) nextValues[fieldKey] = item.id ?? null
      })

      formik.setValues(nextValues, false)
    }

    run()
  }, [accountId, dimensionFields])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {dimensionFields.map(f => (
                <Grid container mt={0.2} spacing={2} key={f.fieldKey}>
                  <Grid item xs={12}>
                    <ResourceComboBox
                      endpointId={FinancialRepository.DimensionValue.qry}
                      parameters={`_dimension=${f.dimensionNumber}`}
                      name={f.fieldKey}
                      label={f.label}
                      valueField='id'
                      displayField='name'
                      values={formik.values}
                      onChange={(_, newValue) =>
                        formik.setFieldValue(f.fieldKey, newValue?.id ?? null)
                      }
                    />
                  </Grid>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}
