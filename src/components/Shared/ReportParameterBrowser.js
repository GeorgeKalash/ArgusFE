// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Paper,
    Tabs,
    Tab,
    Box,
    Typography,
    IconButton,
    Button,
} from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import { makeStyles } from '@material-ui/core/styles'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'

// ** 3rd Party Imports
import Draggable from 'react-draggable'

// ** Custom Imports
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import WindowToolbar from './WindowToolbar'
import ErrorWindow from 'src/components/Shared/ErrorWindow'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'

function PaperComponent(props) {
    return (
        <Draggable
            handle="#draggable-dialog-title"
            cancel={'[class*="MuiDialogContent-root"]'}
        >
            <Paper {...props} />
        </Draggable>
    )
}

const ReportParameterBrowser = ({
    open,
    onClose,
    height = 200,
    onSave,
    reportName,
    functionStore
}) => {

    const { getRequest } = useContext(RequestsContext)

    const [errorMessage, setErrorMessage] = useState(null)
    const [parameters, setParameters] = useState(null)

    const useStyles = makeStyles((theme) => ({
        customBackdrop: {
            left: 300,
            top: 136,
            pointerEvents: 'all',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
        },
    }))

    const classes = useStyles();

    const parametersValidation = useFormik({
        enableReinitialize: false,
        validateOnChange: false,

        validationSchema: yup.object({
            fromFunctionId: yup.string().required('This field is required'),
            toFunctionId: yup.string().required('This field is required'),
        }),
        onSubmit: values => {
            console.log({ values })

            // postDocumentTypeMap(values)
        }
    })

    const getParameterDefinition = () => {
        var parameters = '_reportName=' + reportName

        getRequest({
            'extension': SystemRepository.ParameterDefinition,
            'parameters': parameters,
        })
            .then((res) => {
                console.log({ res })
                setParameters(res.list)
            })
            .catch((error) => {
                console.log({ error })
                setErrorMessage(error.response.data)
            })
    }

    const handleClose = (event, reason) => {
        if (reason && reason == "backdropClick")
            return;
        onClose()
    }

    useEffect(() => {
        getParameterDefinition()
    }, [])

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth='sm'
                PaperComponent={PaperComponent}
                onKeyUp={(e) => {
                    const ENTER = 13

                    if (e.keyCode === ENTER) {
                        onSave()
                    }
                }}
                sx={{ left: 300, top: 136, pointerEvents: 'all', }}
                BackdropProps={{
                    classes: {
                        root: classes.customBackdrop,
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        cursor: 'move',
                        py: 2,
                        pl: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                    id="draggable-dialog-title"
                >
                    <Box>
                        <Typography sx={{ fontSize: '1.2rem', fontWeight: 600 }}>
                            Parameters
                        </Typography>
                    </Box>
                    <Box>
                        <IconButton
                            tabIndex={-1}
                            edge='end'
                            onClick={onClose}
                            aria-label='clear input'
                        >
                            <ClearIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ width: 400, height: height, p: 3 }}>
                    {parameters &&
                        parameters.map((field) => {
                            console.log(field.controlType)
                            switch (field.controlType) {
                                case 0:

                                    break;
                                case 5:
                                    return (
                                        <CustomComboBox
                                            name={field.key}
                                            label={field.caption}
                                            valueField='key'
                                            displayField='value'
                                            store={functionStore}
                                            value={parametersValidation.values?.fromFunctionName}
                                            required={field.mandatory}
                                            onChange={(event, newValue) => {
                                                console.log({ newValue })
                                                parametersValidation.setFieldValue('fromFunctionId', newValue?.key)
                                                parametersValidation.setFieldValue('fromFunctionName', newValue?.value)
                                            }}
                                            sx={{ pt: 2 }}
                                            error={parametersValidation.touched.fromFunctionId && Boolean(parametersValidation.errors.fromFunctionId)}
                                            helperText={parametersValidation.touched.fromFunctionId && parametersValidation.errors.fromFunctionId}
                                        />
                                    )

                                default:
                                    break;
                            }
                        })
                    }
                </DialogContent>
                <WindowToolbar onSave={parametersValidation.handleSubmit} />
            </Dialog>
            <ErrorWindow
                open={errorMessage}
                onClose={() => setErrorMessage(null)}
                message={errorMessage}
            />
        </>
    )
}

export default ReportParameterBrowser