import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useForm } from 'src/hooks/form'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { ControlContext } from 'src/providers/ControlContext'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'
import { useInvalidate } from 'src/hooks/resource'

export default function IntegrationLogicForm({ labels, maxAccess, setStore, store, editMode, onImportData }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId, header } = store

  const invalidate = useInvalidate({
    endpointId: GeneralLedgerRepository.IntegrationLogic.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: '',
      name: '',
      distributionLevel: ''
    },
    validateOnChange: true,
    validationSchema: yup.object({
      distributionLevel: yup.string().required(),
      name: yup.string().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: GeneralLedgerRepository.IntegrationLogic.set,
        record: JSON.stringify(obj)
      })

      if (!obj.recordId) {
        setStore(prevStore => ({
          ...prevStore,
          recordId: response.recordId
        }))
        toast.success(platformLabels.Added)
        formik.setFieldValue('recordId', response.recordId)
      } else toast.success(platformLabels.Edited)

      invalidate()
    }
  })

  useEffect(() => {
    if (header) {
      formik.setValues({
        recordId: header.recordId,
        name: header.name,
        distributionLevel: header.distributionLevel
      })
    }
  }, [header])

  const onExport = async () => {
    const res = await getRequest({
      extension: GeneralLedgerRepository.IntegrationLogic.get2,
      parameters: `_recordId=${recordId}`
    })

    if (res.record) {
      const jsonString = JSON.stringify(res, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `integration_logic_${recordId}.json`

      document.body.appendChild(link)
      link.click()

      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  const onImport = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.style.display = 'none'

    input.onchange = async e => {
      const file = e.target.files[0]
      if (!file) return

      const text = await file.text()
      const json = JSON.parse(text)

      const pack = {
        ...json.record,
        recordId: formik.values.recordId || store.recordId
      }

      if (!pack?.header) return

      const clonedPack = structuredClone(pack)
      let newRecordId = store.recordId || formik.values.recordId
      if (!newRecordId) return

      clonedPack.header.recordId = newRecordId
      clonedPack.items =
        clonedPack.items?.map(i => ({
          ...i,
          ilId: newRecordId
        })) ?? []

      setStore(prev => ({ ...prev, recordId: newRecordId }))

      await postRequest({
        extension: GeneralLedgerRepository.IntegrationLogic.set2,
        record: JSON.stringify({
          header: clonedPack.header,
          items: clonedPack.items
        })
      })

      setStore(prev => ({
        ...prev,
        recordId: newRecordId,
        header: clonedPack.header,
        items: clonedPack.items
      }))

      invalidate()

      if (onImportData) {
        onImportData(clonedPack)
      }
    }

    document.body.appendChild(input)
    input.click()
    document.body.removeChild(input)
  }

  const actions = [
    {
      key: 'Export',
      condition: true,
      onClick: onExport,
      disabled: !editMode
    },
    {
      key: 'Import',
      condition: true,
      onClick: onImport,
      disabled: !editMode
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.IntegrationLogics}
      actions={actions}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.GLI_DISTRIBUTION_LEVEL}
                name='distributionLevel'
                label={labels.distributionLevel}
                values={formik.values}
                valueField='key'
                displayField='value'
                required
                maxAccess={maxAccess}
                onChange={(_, newValue) => formik.setFieldValue('distributionLevel', newValue ? newValue.key : '')}
                error={formik.touched.distributionLevel && Boolean(formik.errors.distributionLevel)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
