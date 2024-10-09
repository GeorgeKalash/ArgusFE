import { Box } from '@mui/material'
import { useContext, useEffect } from 'react'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataSets } from 'src/resources/DataSets'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'

const IdFieldsForm = ({ store, setStore, labels, editMode, height, expanded, maxAccess }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId: idtId } = store
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    maxAccess: maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      IdField: yup
        .array()
        .of(
          yup.object().shape({
            accessLevel: yup.string().required(' ')
          })
        )
        .required(' ')
    }),
    initialValues: {
      IdField: [{ id: 1, idtId: idtId, accessLevel: null, accessLevel: null, accessLevelName: '', controlId: '' }]
    },
    onSubmit: async values => {
      await postIdFields(values.IdField)
    }
  })

  const postIdFields = async obj => {
    const data = {
      idtId: idtId,
      items: obj.map(({ accessLevel, controlId }) => ({
        idtId: idtId,
        accessLevel: Number(accessLevel),
        controlId: controlId
      }))
    }
    await postRequest({
      extension: CurrencyTradingSettingsRepository.IdFields.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        toast.success(platformLabels.Edited)
      })
      .catch(error => {})
  }

  const column = [
    {
      component: 'textfield',
      label: labels.control,
      name: 'controlId',
      mandatory: true
    },
    {
      component: 'resourcecombobox',
      label: labels.accessLevel,
      name: 'accessLevel',
      props: {
        datasetId: DataSets.AU_RESOURCE_CONTROL_ACCESS_LEVEL,
        valueField: 'key',
        displayField: 'value',
        mapping: [
          { from: 'value', to: 'accessLevelName' },
          { from: 'key', to: 'accessLevel' }
        ]
      }
    }
  ]
  useEffect(() => {
    idtId && getIdField(idtId)
  }, [idtId])

  const getIdField = idtId => {
    getRequest({
      extension: CurrencyTradingSettingsRepository.IdFields.qry,
      parameters: `_idtId=${idtId}`
    })
      .then(res => {
        if (res.list.length > 0) {
          const IdField = res.list.map(({ accessLevel, ...rest }, index) => ({
            id: index,
            accessLevel: accessLevel.toString(),
            ...rest
          }))
          formik.setValues({ IdField: IdField })

          setStore(prevStore => ({
            ...prevStore,
            IdField: IdField
          }))
        }
      })
      .catch(error => {})
  }

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.IdTypes}
      maxAccess={maxAccess}
      infoVisible={false}
      editMode={editMode}
    >
      <DataGrid
        onChange={value => formik.setFieldValue('IdField', value)}
        value={formik.values.IdField}
        error={formik.errors.IdField}
        columns={column}
      />
    </FormShell>
  )
}

export default IdFieldsForm
