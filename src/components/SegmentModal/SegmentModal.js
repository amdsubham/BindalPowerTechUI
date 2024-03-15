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

const baseURL = 'https://api.bindaladmin.com/api'; // Adjust this as necessary

// Validation schema for the form
const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  description: Yup.string().required('Description is required'),
  category: Yup.string().required('Category is required'),
});

const SegmentModal = ({ open, onClose, mode, segmentId, refreshSegments }) => {
  const [initialValues, setInitialValues] = useState({
    name: '',
    description: '',
    category: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const isSmallScreen = useMediaQuery(theme => theme.breakpoints.down('sm'));

  useEffect(() => {
    setIsLoading(true);
    axios.get(`${baseURL}/categories`)
      .then((response) => {
        setCategories(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch categories:', error);
        setIsLoading(false);
      });

    if (mode === 'edit' && segmentId) {
      axios.get(`${baseURL}/segments/${segmentId}`)
        .then((response) => {
          const { name, description, category } = response.data;
          setInitialValues({ name, description, category: category._id });
        })
        .catch((error) => console.error('Failed to fetch segment details:', error));
    } else {
      setIsLoading(false);
    }
  }, [mode, segmentId]);

  const handleSubmit = (values, { setSubmitting }) => {
    const apiCall = mode === 'add' ?
      axios.post(`${baseURL}/segments`, values) :
      axios.put(`${baseURL}/segments/${segmentId}`, values);

    apiCall.then(() => {
      refreshSegments();
      onClose();
    }).catch((error) => {
      console.error('Failed to process segment data:', error);
    }).finally(() => {
      setSubmitting(false);
      setIsLoading(false);
      setInitialValues({
        name: '',
        description: '',
        category: '',
      })
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: isSmallScreen ? '90%' : 600, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting, resetForm }) => (
              <Form autoComplete="off">
                <Card>
                  <MDBox p={3}>
                    <MDBox display="flex" justifyContent="space-between" alignItems="center">
                      <MDTypography variant="h5">{mode === 'add' ? 'Add Segment' : 'Edit Segment'}</MDTypography>
                      <IconButton onClick={() => {
                        onClose()
                        setInitialValues({
                          name: '',
                          description: '',
                          category: '',
                        })
                      }}>
                        <CloseIcon />
                      </IconButton>
                    </MDBox>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                      <Grid item xs={12}>
                        <FormField name="name" label="Name" />
                      </Grid>
                      <Grid item xs={12}>
                        <FormField name="description" label="Description" multiline rows={4} />
                      </Grid>

                      <Grid item xs={12}>
                        <AutocompleteFormField
                          name="category"
                          options={categories}
                        />
                      </Grid>
                    </Grid>
                    <MDBox mt={3} display="flex" justifyContent="flex-end">
                      <MDButton type="submit" variant="gradient" color="info" disabled={isSubmitting}>
                        {mode === 'add' ? 'Add Segment' : 'Save Changes'}
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

export default SegmentModal;
