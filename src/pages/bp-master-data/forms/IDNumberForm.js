import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useContext, useEffect } from 'react'
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import { useForm } from 'src/hooks/form'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'

const IDNumberForm = ({ store, maxAccess, labels }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const editMode = !!store.recordId

  const { formik } = useForm({
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      rows: []
    },
    onSubmit: async values => {
      await postIdNumber(values.rows)
    }
  })

  const columns = [
    {
      component: 'textfield',
      label: labels.idCategory,
      name: 'incName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      label: labels.idNumber,
      name: 'idNum'
    }
  ]

  const postIdNumber = async obj => {
    try {
      const postBody = Object.entries(obj).map(async ([key, value]) => {
        if (value?.idNum === '') value.idNum = null

        return await postRequest({
          extension: BusinessPartnerRepository.MasterIDNum.set,
          record: JSON.stringify(value)
        })
      })

      await Promise.all(postBody)

      if (!recordId) {
        toast.success(platformLabels.Added)
      } else {
        toast.success(platformLabels.Edited)
      }
    } catch (error) {}
  }

  async function getIdNumber(recordId) {
    if (recordId) {
      const res = await getRequest({
        extension: BusinessPartnerRepository.MasterIDNum.qry,
        parameters: `_bpId=${recordId}`
      })
      const list = store.category

      var listMIN = res.list?.filter(y => {
        return list?.some(x => x.name === y.incName)
      })

      if (listMIN?.length > 0) {
        const result = listMIN.map(({ ...rest }, index) => ({
          id: index,
          ...rest
        }))
        formik.setValues({ rows: result })
      } else {
        formik.setValues({
          rows: []
        })
      }
    }
  }

  useEffect(() => {
    store.category?.length > 0 && getIdNumber(recordId)
  }, [store.category, recordId])

  return (
    <FormShell
      resourceId={ResourceIds.BPMasterData}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      isSavedClear={false}
      isCleared={false}
    >
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('rows', value)}
            value={formik.values.rows}
            error={formik.errors.rows}
            columns={columns}
            name='rows'
            allowDelete={false}
            allowAddNewLine={false}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default IDNumberForm
