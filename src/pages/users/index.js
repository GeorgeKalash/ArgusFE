// ** MUI Imports
import {
    Button,
    Grid,
} from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'

// ** Custom Imports
import CustomTextField from 'src/components/CustomTextField'

const Users = () => {

    const handleChange = async (event, name) => {
        formik.handleChange(event)

        if (timeoutId) clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
            let newData = { ...formik.values }

            if (name === 'name.first') newData.name.first = event.target.value
            if (name === 'name.last') newData.name.last = event.target.value
            if (name === 'name.father') newData.name.father = event.target.value
            if (name === 'name.mother') newData.name.mother = event.target.value
            else newData[name] = event.target.value

        }, 1000)
    }

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: 'initial',
        },
        validationSchema: yup.object({
            name: yup.string('Enter your name').required('name is required'),
        }),
        onSubmit: values => {
            console.log({ values })
        }
    })

    return (
        <Grid container>
            <CustomTextField
                name='name'
                label='Name'
                required
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
            />
            <Button onClick={formik.handleSubmit}>Submit</Button>
        </Grid>
    )
}

export default Users
