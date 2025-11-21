import React from 'react'
import { Grid } from '@mui/material'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import CustomTextArea from '../Inputs/CustomTextArea'
import { useFormik } from 'formik'
import { useContext, useState, useRef } from 'react'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import ImportConfirmation from './ImportConfirmation'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import toast from 'react-hot-toast'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import CustomButton from '../Inputs/CustomButton'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import Form from './Form'

const ImportSerials = ({ endPoint, header, onCloseimport, maxAccess, window }) => {
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)
  const imageInputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [parsedFileContent, setParsedFileContent] = useState([])
  const { postRequest } = useContext(RequestsContext)

  useSetWindow({ title: platformLabels.importSerials, window })

  const formik = useFormik({
    initialValues: {
      serials: '',
      serialCount: 0
    }
  })

  const handleSerialChange = inputSerials => {
    const lines = inputSerials.split('\n')
    const rowCountWithData = lines.filter(line => line.trim() !== '').length

    formik.setFieldValue('serialCount', rowCountWithData)
  }

  const handleFileChange = event => {
    const file = event.target.files[0]

    setFile(file)

    if (file) {
      const reader = new FileReader()
      reader.onload = e => {
        const text = e.target.result
        setParsedFileContent(text)
      }
      reader.readAsText(file)
    }
  }

  const clearFile = () => {
    setFile(null)
    setParsedFileContent([])
    imageInputRef.current.value = null
  }

  const onImportConfirmation = async () => {
    stack({
      Component: ImportConfirmation,
      props: {
        open: { flag: true },
        fullScreen: false,
        onConfirm: importSerialsData,
        dialogText: platformLabels.importConfirmation
      }
    })
  }

  const importSerialsData = async () => {
    const transformedSerials = formik.values.serials?.replace(/\n/g, ',\r\n')

    const SerialsPack = {
      ...header,
      serials: transformedSerials ? transformedSerials : parsedFileContent
    }

    await postRequest({
      extension: endPoint,
      record: JSON.stringify(SerialsPack)
    })

    toast.success(platformLabels.Imported)
    onCloseimport()
    window.close()
  }

  const actions = [
    {
      key: 'Import',
      condition: true,
      onClick: onImportConfirmation,
      disabled: !file?.name && !formik?.values?.serials
    }
  ]

  return (
    <Form
      actions={actions}
      onSave={() => onImportConfirmation()}
      disabledSubmit={!file?.name && !formik?.values?.serials}
      isSaved={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={7}>
              <CustomTextField
                name='name'
                label={platformLabels.SelectCSV}
                value={file?.name}
                disabled={formik.values.serials || !!file?.name}
                readOnly
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomButton
                onClick={() => {
                  imageInputRef.current.click()
                }}
                label={`${platformLabels.Browse}...`}
                color='primary'
                disabled={!!file?.name || formik.values.serials}
              />
            </Grid>
            <Grid item xs={2}>
              <CustomButton image='clear.png' onClick={clearFile} label={platformLabels.Clear} color='#f44336' />
            </Grid>
            <Grid item xs={12}>
              {formik.values.serialCount > 0 && (
                <label style={{ marginBottom: '8px', display: 'block' }} maxAccess={maxAccess}>
                  {platformLabels.serials} ( {formik.values.serialCount} )
                </label>
              )}
              <CustomTextArea
                name='serials'
                label={platformLabels.serials}
                value={formik.values.serials}
                rows={3}
                readOnly={file?.name}
                onChange={e => {
                  formik.setFieldValue('serials', e.target.value)
                  handleSerialChange(e.target.value)
                }}
                onClear={() => {
                  formik.setFieldValue('serials', '')
                  formik.setFieldValue('serialCount', 0)
                }}
                error={formik.touched.serials && Boolean(formik.errors.serials)}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>

        <input type='file' accept='.csv' ref={imageInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
      </VertLayout>
    </Form>
  )
}
ImportSerials.width = 550
ImportSerials.height = 270

export default ImportSerials
