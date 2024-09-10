import { useContext, useEffect } from 'react'
import { useForm } from 'src/hooks/form'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { SCRepository } from 'src/repositories/SCRepository'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import toast from 'react-hot-toast'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import FormShell from 'src/components/Shared/FormShell'
import { DataGrid } from 'src/components/Shared/DataGrid'

const Controller = ({ store, maxAccess, labels }) => {
  const { recordId, isPosted, isClosed } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      stockCountId: '',
      rows: []
    },
    onSubmit: async () => {
      try {
        const itemsList = formik.values.rows
        .map((item, index) => ({
          ...item,
          id: index + 1,
          status: item.status || 1,
          controllerId: item.recordId,
          siteId: formik.values.siteId,
          stockCountId: recordId,
        }))
        .filter(item => item.isChecked); 

        const data = {
          stockCountId: recordId,
          siteId: formik.values.siteId,
          items: itemsList
        }

        const res = await postRequest({
          extension: SCRepository.PHY.set2,
          record: JSON.stringify(data)
        })
        toast.success(platformLabels.Updated)
        const res2 = await fetchGridData(recordId, formik.values.siteId)
        formik.setValues({ rows: res2.list })
      } catch (error) {}
    }
  })

  const fetchGridData = async (recordId, siteId) => {
    try {
      const response = await getRequest({
        extension: SCRepository.Controller.qry,
        parameters: `_siteId=${siteId}`
      })

      const checkedResponse = await getRequest({
        extension: SCRepository.PHY.qry,
        parameters: `_siteId=${siteId}&_stockCountId=${recordId}`
      })

      response.list.map((item, index) => {
        const checkedItem = checkedResponse.list.find(checked => checked.controllerId === item.recordId)

        if (checkedItem) {
          item.isChecked = true
          item.statusName = checkedItem.statusName
          item.status = checkedItem.status
        }

        return {
          ...item,
          id: index + 1
        }
      })

      if (response && response?.list) {
        response.list = response?.list?.map((item, index) => ({
          ...item,
          id: index,
          isChecked: item?.isChecked === undefined ? false : item?.isChecked
        }))
      }

      formik.setFieldValue('stockCountId', recordId)
      formik.setValues({ rows: response.list })
      formik.setFieldValue('siteId', siteId)
    } catch (error) {}
  }

  useEffect(() => {
    ;(async function () {
      if (formik.values.siteId) {
        await fetchGridData(recordId, formik.values.siteId)
      }
    })()
  }, [formik.values.siteId])

  const columns = [
    {
      component: 'checkbox',
      label: ' ',
      name: 'isChecked',
      flex: .2,
      props: {
        disabled: isPosted || isClosed
      },
    },
    {
      component: 'textfield',
      name: 'name',
      label: labels.name,
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      name: 'statusName',
      label: labels.statusName,
      flex: 1,
      props: {
        readOnly: true
      }
    }
  ]

  function handleRowsChange(newValues) {
    const updatedRows = formik.values.rows.map(row => {
      const newValue = newValues.find(newRow => newRow.id === row.id)

      return newValue ? newValue : row
    })

    formik.setFieldValue('rows', updatedRows)
  }

  return (
    <FormShell form={formik} infoVisible={false} isCleared={false} disabledSubmit={isPosted || isClosed}>
      <VertLayout>
        <Grow>
          <Fixed>
            <ResourceComboBox
              name='siteId'
              endpointId={SCRepository.Sites.qry}
              parameters={recordId ? `_stockCountId=${recordId}` : ''}
              label={labels.sites}
              filter={item => item.isChecked}
              readOnly={isPosted || isClosed}
              valueField='siteId'
              displayField='siteName'
              values={formik.values}
              onChange={(event, newValue) => {
                formik.setFieldValue('siteId', newValue ? newValue?.siteId : '')
              }}
              error={formik.touched.siteId && Boolean(formik.errors.siteId)}
              maxAccess={maxAccess}
            />
          </Fixed>
          <DataGrid
            onChange={value => handleRowsChange(value)}
            value={formik.values.rows}
            error={formik.errors.rows}
            columns={columns}
            allowAddNewLine={false}
            allowDelete={false}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default Controller
