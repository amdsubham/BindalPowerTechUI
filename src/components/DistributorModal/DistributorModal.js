import React, { useState, useEffect } from 'react';
import { Modal, Box } from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import FormField from "layouts/pages/users/new-user/components/FormField";

const DistributorModal = ({ open, onClose, mode, distributorId, refreshDistributors }) => {
  const [initialValues, setInitialValues] = useState({
    name: '',
    email: '',
    contactNumber: '',
    address: '',
    username: '',
    password: '',
    repeatPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (mode !== 'add' && distributorId) {
      setIsLoading(true);
      axios.get(`http://localhost:3800/api/distributors/${distributorId}`)
        .then((response) => {
          const { name, email, contactNumber, address, loginCredentials } = response.data;
          setInitialValues({
            name,
            email,
            contactNumber,
            address,
            username: loginCredentials.username,
            password: '',
            repeatPassword: '',
          });
        })
        .catch((error) => console.error('Failed to fetch distributor details:', error))
        .finally(() => setIsLoading(false));
    }
  }, [mode, distributorId]);

  const handleSubmit = (values, { setSubmitting }) => {
    setIsLoading(true);
    const payload = {
      ...values,
      loginCredentials: {
        username: values.username,
        password: values.password,
      },
    };

    let apiCall;
    if (mode === 'add') {
      apiCall = axios.post('http://localhost:3800/api/distributors', payload);
    } else if (mode === 'edit') {
      apiCall = axios.put(`http://localhost:3800/api/distributors/${distributorId}`, payload);
    }

    apiCall.then(() => {
      refreshDistributors(); // Refresh the distributor list
      onClose(); // Close the modal
    }).catch((error) => {
      console.error('Failed to process distributor data:', error);
    }).finally(() => {
      setSubmitting(false);
      setIsLoading(false);
    });
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', maxWidth: 600, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, isSubmitting }) => (
            <Form autoComplete="off">
              <Card>
                <MDBox p={3}>
                  <MDBox display="flex" justifyContent="space-between">
                    <MDTypography variant="h5">{`${mode === 'add' ? 'Add' : 'Edit'} Distributor`}</MDTypography>
                    <IconButton onClick={onClose}>
                      <CloseIcon />
                    </IconButton>
                  </MDBox>
                  <MDBox pt={2}>
                    <Grid container spacing={3}>
                      {/* Form fields */}
                      <Grid item xs={12}>
                        <FormField
                          type="text"
                          label="Name"
                          name="name"
                          value={values.name}
                          error={errors.name && touched.name}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormField
                          type="email"
                          label="Email"
                          name="email"
                          value={values.email}
                          error={errors.email && touched.email}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormField
                          type="text"
                          label="Contact Number"
                          name="contactNumber"
                          value={values.contactNumber}
                          error={errors.contactNumber && touched.contactNumber}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormField
                          type="text"
                          label="Address"
                          name="address"
                          value={values.address}
                          error={errors.address && touched.address}
                        />
                      </Grid>
                      {/* Conditional fields based on mode */}
                      {mode !== 'resetPassword' && (
                        <>
                          <Grid item xs={12} sm={6}>
                            <FormField
                              type="text"
                              label="Username"
                              name="username"
                              value={values.username}
                              error={errors.username && touched.username}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <FormField
                              type="password"
                              label="Password"
                              name="password"
                              value={values.password}
                              error={errors.password && touched.password}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <FormField
                              type="password"
                              label="Repeat Password"
                              name="repeatPassword"
                              value={values.repeatPassword}
                              error={errors.repeatPassword && touched.repeatPassword}
                            />
                          </Grid>
                        </>
                      )}
                    </Grid>
                    <MDBox mt={3} display="flex" justifyContent="flex-end">
                      <MDButton type="submit" variant="gradient" color="info" disabled={isSubmitting}>
                        {mode === 'add' ? 'Add Distributor' : 'Update Distributor'}
                      </MDButton>
                    </MDBox>
                  </MDBox>
                </MDBox>
              </Card>
            </Form>
          )}
        </Formik>
      </Box>
    </Modal>
  );
};

export default DistributorModal;
