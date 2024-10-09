import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useFormik } from 'formik'
import { DataGrid } from 'src/components/Shared/DataGrid'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useContext, useState } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'

const ProductAgentForm = ({
  store,
  labels,
  editMode,

  maxAccess
}) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId: pId, dispersals } = store
  const [_dispersalId, setDispersalId] = useState({})
  const { platformLabels } = useContext(ControlContext)

  const columns = [
    {
      component: 'resourcecombobox',
      label: labels.agents,
      name: 'agentId',
      props: {
        endpointId: RemittanceSettingsRepository.CorrespondentAgents.qry,
        valueField: 'recordId',
        displayField: 'name',
        mapping: [
          { from: 'recordId', to: 'agentId' },
          { from: 'name', to: 'agentName' }
        ],
        columnsInDropDown: [{ key: 'name', value: 'name' }]
      }
    }
  ]

  const formik = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      agents: yup
        .array()
        .of(
          yup.object().shape({
            agentId: yup.string().required('agent recordId is required')
          })
        )
        .required('agents array is required')
    }),
    initialValues: {
      agents: [{ id: 1, dispersalId: '', agentId: '', agentName: '' }]
    },
    onSubmit: async values => {
      await postProductAgents(values.agents)
    }
  })

  const postProductAgents = async obj => {
    const data = {
      dispersalId: pId,
      productDispersalAgents: obj.map(({ dispersalId, ...rest }, index) => ({
        id: index + 1,

        dispersalId: _dispersalId.dispersalId,

        ...rest
      }))
    }
    await postRequest({
      extension: RemittanceSettingsRepository.ProductDispersalAgents.set2,
      record: JSON.stringify(data)
    }).then(res => {
      if (res) toast.success(platformLabels.Edited)
    })
  }

  const onDispersalSelection = dispersalId => {
    const _dispersalId = dispersalId
    const defaultParams = `_dispersalId=${_dispersalId}`
    var parameters = defaultParams
    formik.setValues({ agents: [{ id: 1, dispersalId: '', agentId: '', agentName: '' }] })

    dispersalId &&
      getRequest({
        extension: RemittanceSettingsRepository.ProductDispersalAgents.qry,
        parameters: parameters
      })
        .then(res => {
          if (res.list.length > 0) {
            formik.setValues({
              agents: res.list.map(({ ...rest }, index) => ({
                id: index + 1,
                ...rest
              }))
            }) //map
          }
        })
        .catch(error => {
          setErrorMessage(error)
        })
  }

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.ProductMaster}
      maxAccess={maxAccess}
      infoVisible={false}
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <ResourceComboBox
            name='dispersalId'
            label={labels.dispersal}
            store={dispersals}
            valueField='recordId'
            displayField={['reference', 'name']}
            columnsInDropDown={[
              { key: 'reference', value: 'Reference' },
              { key: 'name', value: 'Name' }
            ]}
            values={_dispersalId}
            required
            onChange={(event, newValue) => {
              setDispersalId({ dispersalId: newValue?.recordId })
              onDispersalSelection(newValue?.recordId)
            }}
            error={Boolean(formik.errors.dispersalId)}
            helperText={formik.errors.dispersalId}
          />
          <DataGrid
            onChange={value => formik.setFieldValue('agents', value)}
            value={formik.values.agents}
            error={formik.errors.agents}
            columns={columns}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default ProductAgentForm
