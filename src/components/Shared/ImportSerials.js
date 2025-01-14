import React from 'react'
import { Button, Grid } from '@mui/material'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import CustomTextArea from '../Inputs/CustomTextArea'
import { useFormik } from 'formik'
import { useContext, useState, useRef } from 'react'
import { ControlContext } from 'src/providers/ControlContext'
import ImportConfirmation from './ImportConfirmation'
import { useWindow } from 'src/windows'
import { RequestsContext } from 'src/providers/RequestsContext'
import toast from 'react-hot-toast'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const ImportSerials = ({ endPoint, draftId, onCloseimport, maxAccess, window }) => {
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)
  const imageInputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [parsedFileContent, setParsedFileContent] = useState([])
  const { postRequest } = useContext(RequestsContext)

  const formik = useFormik({
    initialValues: {
      serials: '',
      serialCount: 0
    }
  })

  const handleSerialChange = inputSerials => {
    const input = inputSerials

    const lines = input.split('\n')
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
      },
      width: 470,
      height: 170,
      title: platformLabels.import
    })
  }

  const importSerialsData = async () => {
    const transformedSerials = formik.values.serials?.replace(/\n/g, ',\r\n')

    const SerialsPack = {
      draftId: draftId,
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
    <VertLayout>
      <Grow>
        <Grid container spacing={2} sx={{ padding: 2 }}>
          <Grid item xs={12}>
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
              <Grid item xs={5}>
                <Button
                  sx={{ ml: 6, minWidth: '90px !important' }}
                  variant='contained'
                  size='small'
                  disabled={!!file?.name || formik.values.serials}
                  onClick={() => {
                    imageInputRef.current.click()
                  }}
                >
                  {platformLabels.Browse}...
                </Button>
                <input
                  type='file'
                  accept='.csv'
                  ref={imageInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <Button
                  onClick={clearFile}
                  sx={{
                    backgroundColor: '#f44336',
                    '&:hover': {
                      backgroundColor: '#f44336',
                      opacity: 0.8
                    },
                    ml: 2
                  }}
                  variant='contained'
                >
                  <img src='/images/buttonsIcons/clear.png' alt={platformLabels.Clear} />
                </Button>
              </Grid>
            </Grid>
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
              onClear={() => formik.setFieldValue('serials', '')}
              error={formik.touched.serials && Boolean(formik.errors.serials)}
              maxAccess={maxAccess}
            />
          </Grid>
        </Grid>
      </Grow>
      <Fixed>
        <WindowToolbar smallBox={true} actions={actions} />
      </Fixed>
    </VertLayout>
  )
}

export default ImportSerials
