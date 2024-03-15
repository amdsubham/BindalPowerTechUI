import React, { useState, useEffect } from 'react';
import { Modal, Box, TextField, Card, CircularProgress, IconButton } from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import Grid from "@mui/material/Grid";
import CloseIcon from '@mui/icons-material/Close';
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import Autocomplete from '@mui/material/Autocomplete';

const ServiceRequestModal = ({ open, onClose, mode, serviceRequestId, refreshServiceRequests }) => {
  const [initialValues, setInitialValues] = useState({
    status: 'Pending',
    newProductSerialNumber: '',
    message: '', // Added message field
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedServiceRequest, setSelectedServiceRequest] = useState({});
  console.log("selectedServiceRequest", selectedServiceRequest)
  useEffect(() => {
    if (mode !== 'add' && serviceRequestId) {
      setIsLoading(true);
      axios.get(`https://api.bindaladmin.com/api/service-requests/${serviceRequestId}`)
        .then((response) => {
          const { status, serviceType, productSerialNumber } = response.data.data;
          setSelectedServiceRequest(response.data.data)
          setInitialValues({
            status,
            newProductSerialNumber: serviceType === 'Product Replacement' && status === 'Completed' ? productSerialNumber : '',
            message: '', // Set message field value here if needed
          });
        })
        .catch((error) => console.error('Failed to fetch service request details:', error))
        .finally(() => setIsLoading(false));
    }
  }, [mode, serviceRequestId]);

  const handleSubmit = async (values, { setSubmitting }) => {
    setIsLoading(true);
    const payload = {
      ...values,
    };

    try {
      let response;
      if (mode === 'add') {
        response = await axios.post('https://api.bindaladmin.com/api/service-requests', payload);
      } else if (mode === 'edit') {
        response = await axios.put(`https://api.bindaladmin.com/api/service-requests/${serviceRequestId}`, payload);
      }

      // Update status and allocate new product serial number if needed
      if (values.status === 'Completed' && selectedServiceRequest.productSerialNumber && values.newProductSerialNumber) {
        await axios.put(`https://api.bindaladmin.com/api/products/update/${selectedServiceRequest.productSerialNumber}`, { status: 'Discontinued' });
        await axios.put(`https://api.bindaladmin.com/api/products/update/${values.newProductSerialNumber}`, { status: 'Allocated' });
      }

      refreshServiceRequests(); // Refresh the service request list
      onClose(); // Close the modal
    } catch (error) {
      console.error('Failed to process service request data:', error);
    } finally {
      setSubmitting(false);
      setIsLoading(false);
    }
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
          {({ values, errors, touched, isSubmitting, handleSubmit, handleChange }) => (
            <Form autoComplete="off" onSubmit={handleSubmit}>
              <Card>
                <MDBox p={3}>
                  <MDBox display="flex" justifyContent="space-between">
                    <MDTypography variant="h5">{`${mode === 'add' ? 'Add' : 'Edit'} Service Request`}</MDTypography>
                    <IconButton onClick={onClose}>
                      <CloseIcon />
                    </IconButton>
                  </MDBox>
                  <MDBox pt={2}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Autocomplete
                          fullWidth
                          options={['Pending', 'In Progress', 'Completed']}
                          renderInput={(params) => (
                            <TextField {...params} label="Status" variant="outlined" />
                          )}
                          value={values.status}
                          onChange={(event, newValue) => {
                            handleChange('status')(newValue);
                          }}
                        />
                        {errors.status && touched.status && <div>{errors.status}</div>}
                      </Grid>
                      {values.status === 'Completed' && (
                        <>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="New Product Serial Number"
                              variant="outlined"
                              name="newProductSerialNumber"
                              value={values.newProductSerialNumber}
                              onChange={handleChange}
                              error={errors.newProductSerialNumber && touched.newProductSerialNumber}
                              helperText={errors.newProductSerialNumber && touched.newProductSerialNumber && errors.newProductSerialNumber}
                            />
                          </Grid>
                          {/* Add message field */}
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Message"
                              variant="outlined"
                              name="message"
                              value={values.message}
                              onChange={handleChange}
                              error={errors.message && touched.message}
                              helperText={errors.message && touched.message && errors.message}
                            />
                          </Grid>
                        </>
                      )}
                    </Grid>
                    <MDBox mt={3} display="flex" justifyContent="flex-end">
                      <MDButton type="submit" variant="gradient" color="info" disabled={isSubmitting}>
                        {mode === 'add' ? 'Add Service Request' : 'Update Service Request'}
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

export default ServiceRequestModal;
