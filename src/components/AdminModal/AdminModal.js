import React, { useState, useEffect } from 'react';
import { Modal, } from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import FormField from "layouts/pages/users/new-user/components/FormField";

// Validation schema for the form
// Create a base schema without considering the mode
// let schemaFields = {
//   password: Yup.string().required('Password is required'),
//   repeatPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match'),
// };

// Conditionally extend the schema based on the mode
// if (mode === 'add' || mode === 'edit' || mode === 'resetPassword') {
//   schemaFields = {
//     ...schemaFields,
//     firstName: Yup.string().required('First name is required'),
//     lastName: Yup.string().required('Last name is required'),
//     email: Yup.string().email('Invalid email').required('Email is required'),
//   };
// }

//const validationSchema = Yup.object().shape(schemaFields);



const AdminModal = ({ open, onClose, mode, adminId, refreshAdmins }) => {
  console.log("maskaa", adminId)
  const [initialValues, setInitialValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    repeatPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (mode !== 'add' && adminId) {
      setIsLoading(true);
      // Fetch admin details for 'edit' or 'resetPassword' mode
      axios.get(`https://api.bindaladmin.com/api/admins/${adminId}`)
        .then((response) => {
          const { name, email } = response.data;
          const [firstName, lastName] = name.split(' '); // Assuming name is "firstName lastName"
          setInitialValues({
            firstName,
            lastName,
            email,
            password: '',
            repeatPassword: '',
          });
        })
        .catch((error) => console.error('Failed to fetch admin details:', error))
        .finally(() => setIsLoading(false));
    }
  }, [mode, adminId]);

  const handleSubmit = (values, { setSubmitting }) => {
    setIsLoading(true);
    const payload = {
      password: values.password,
      email: values.email,
      name: `${values.firstName} ${values.lastName}`,
    };

    let apiCall;
    if (mode === 'add') {
      apiCall = axios.post('https://api.bindaladmin.com/api/admins/register', payload);
    } else if (mode === 'edit' || mode === 'resetPassword') {
      apiCall = axios.put(`https://api.bindaladmin.com/api/admins/${adminId}`, payload);
    }

    apiCall.then(() => {
      refreshAdmins(); // Refresh the admin list
      onClose(); // Close the modal
    }).catch((error) => {
      console.error('Failed to process admin data:', error);
    }).finally(() => {
      setSubmitting(false);
      setIsLoading(false);
    });
  };


  if (isLoading) {
    return <CircularProgress />
  }
  return (
    <Modal open={open} onClose={onClose}>

      <MDBox py={3} mb={20}>
        <Grid container justifyContent="center">

          <Grid item xs={12} lg={8}>

            <Formik
              initialValues={initialValues}
              // validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ values, errors, touched, isSubmitting }) => (
                <Form autoComplete="off">
                  <Card>
                    <MDBox p={3}>
                      <MDBox display="flex" justifyContent="space-between">
                        <MDTypography variant="h5">Admin Details</MDTypography>
                        <IconButton onClick={onClose}>
                          <CloseIcon />
                        </IconButton>
                      </MDBox>
                      <MDBox pt={2}>
                        <Grid container spacing={3}>
                          {/* First Name and Last Name Fields */}
                          <Grid item xs={12} sm={6}>
                            <FormField
                              disabled={mode === 'resetPassword'}
                              type="text"
                              label="First Name"
                              name="firstName"
                              value={values.firstName}
                              error={errors.firstName && touched.firstName}
                              success={values.firstName.length > 0 && !errors.firstName}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <FormField
                              disabled={mode === 'resetPassword'}
                              type="text"
                              label="Last Name"
                              name="lastName"
                              value={values.lastName}
                              error={errors.lastName && touched.lastName}
                              success={values.lastName.length > 0 && !errors.lastName}
                            />
                          </Grid>

                          {/* Email Field */}
                          <Grid item xs={12} sm={6}>
                            <FormField
                              disabled={mode === 'resetPassword'}
                              type="email"
                              label="Email"
                              name="email"
                              value={values.email}
                              placeholder="example@mail.com"
                              error={errors.email && touched.email}
                              success={values.email.length > 0 && !errors.email}
                            />
                          </Grid>

                          {/* Company Field (if applicable) */}
                          <Grid item xs={12} sm={6}>
                            <FormField
                              disabled={true}
                              type="text"
                              label="Company"
                              name="company"
                              value={values.company || 'Bindal Powertech'} // Assuming 'company' is an optional field
                              placeholder="Your company name"
                            />
                          </Grid>

                          {/* Password and Repeat Password Fields - omitting these in the edit form for security reasons */}
                          <Grid item xs={12} sm={6}>
                            <FormField
                              disabled={mode === 'edit'}
                              type="password"
                              label="Password"
                              name="password"
                              value={values.password}
                              placeholder="Password"
                              error={errors.password && touched.password}
                              //success={values.password.length > 0 && !errors.password}
                              inputProps={{ autoComplete: "new-password" }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <FormField
                              disabled={mode === 'edit'}
                              type="password"
                              label="Repeat Password"
                              name="repeatPassword"
                              value={values.repeatPassword}
                              placeholder="Repeat Password"
                              error={errors.repeatPassword && touched.repeatPassword}
                              //success={values.repeatPassword.length > 0 && !errors.repeatPassword}
                              inputProps={{ autoComplete: "new-password" }}
                            />
                          </Grid>
                        </Grid>
                        <MDBox mt={3} display="flex" justifyContent="flex-end">
                          <MDButton type="submit" variant="gradient" color="info" disabled={isSubmitting}>
                            {adminId ? "Update Admin" : "Create Admin"}
                          </MDButton>
                        </MDBox>
                      </MDBox>
                    </MDBox>
                  </Card>
                </Form>
              )}
            </Formik>
          </Grid>
        </Grid>
      </MDBox>

    </Modal >
  );
};

export default AdminModal;
