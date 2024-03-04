import React, { useState, useEffect } from 'react';
import { Modal, Box, Grid, Card, CircularProgress, IconButton, useMediaQuery } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import MDBox from "components/MDBox"; // Adjust the import path as necessary
import MDTypography from "components/MDTypography"; // Adjust the import path as necessary
import MDButton from "components/MDButton"; // Adjust the import path as necessary
import FormField from "layouts/pages/users/new-user/components/FormField";
import AutocompleteFormField from 'components/AutocompleteFormField';

const baseURL = 'http://localhost:3800/api'; // Adjust this as necessary

// Validation schema for the form
const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  modelNumber: Yup.string().required('Model Number is required'),
  segment: Yup.string().required('Segment is required'),
  price: Yup.string(),
  description: Yup.string().required('Description is required'),
});

const VariantModal = ({ open, onClose, mode, variantId, refreshVariants }) => {
  const [initialValues, setInitialValues] = useState({
    name: '',
    modelNumber: '',
    segment: '',
    price: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [segments, setSegments] = useState([]);
  const isSmallScreen = useMediaQuery(theme => theme.breakpoints.down('sm'));

  useEffect(() => {
    setIsLoading(true);
    axios.get(`${baseURL}/segments`)
      .then(response => {
        setSegments(response.data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Failed to fetch segments:', error);
        setIsLoading(false);
      });

    if (mode === 'edit' && variantId) {
      axios.get(`${baseURL}/variants/${variantId}`)
        .then(response => {
          const { name, modelNumber, segment, price, description } = response.data;
          setInitialValues({ name, modelNumber, segment: segment._id, price, description });
        })
        .catch(error => console.error('Failed to fetch variant details:', error));
    } else {
      setInitialValues({
        name: '',
        modelNumber: '',
        segment: '',
        price: '',
        description: '',
      });
    }
  }, [mode, variantId]); // Update initialValues when mode or variantId changes

  const handleSubmit = (values, { setSubmitting }) => {
    const apiCall = mode === 'add' ?
      axios.post(`${baseURL}/variants`, values) :
      axios.put(`${baseURL}/variants/${variantId}`, values);

    apiCall.then(() => {
      refreshVariants();
      onClose();
    }).catch(error => {
      console.error('Failed to process variant data:', error);
    }).finally(() => {
      setSubmitting(false);
      setIsLoading(false);
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: isSmallScreen ? '90%' : 600, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
        {isLoading ? <CircularProgress /> : (
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize // Enable reinitialization of form values
          >
            {({ isSubmitting }) => (
              <Form autoComplete="off">
                <Card>
                  <MDBox p={3}>
                    <MDBox display="flex" justifyContent="space-between" alignItems="center">
                      <MDTypography variant="h5">{mode === 'add' ? 'Add Variant' : 'Edit Variant'}</MDTypography>
                      <IconButton onClick={onClose}><CloseIcon /></IconButton>
                    </MDBox>
                    <Grid container spacing={3}>
                      <Grid item xs={12}><FormField name="name" label="Name" /></Grid>
                      <Grid item xs={12}><FormField name="modelNumber" label="Model Number" /></Grid>
                      <Grid item xs={12}><AutocompleteFormField name="segment" options={segments} /></Grid>
                      <Grid item xs={12}><FormField name="price" label="Price" /></Grid>
                      <Grid item xs={12}><FormField name="description" label="Description" multiline rows={4} /></Grid>
                    </Grid>
                    <MDBox mt={3} display="flex" justifyContent="flex-end">
                      <MDButton type="submit" variant="gradient" color="info" disabled={isSubmitting}>
                        {mode === 'add' ? 'Add Variant' : 'Save Changes'}
                      </MDButton>
                    </MDBox>
                  </MDBox>
                </Card>
              </Form>
            )}
          </Formik>
        )}
      </Box>
    </Modal>
  );
};

export default VariantModal;
