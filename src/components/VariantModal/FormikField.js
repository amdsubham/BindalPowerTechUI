import React from 'react';
import { useField } from 'formik';
import { TextField } from '@mui/material';

const FormikField = ({ name, ...otherProps }) => {
  const [field, meta] = useField(name);

  const configTextField = {
    ...field,
    ...otherProps,
    fullWidth: true,
    variant: 'outlined',
    error: false,
    helperText: ''
  };

  if (meta && meta.touched && meta.error) {
    configTextField.error = true;
    configTextField.helperText = meta.error;
  }

  return (
    <TextField {...configTextField} />
  );
};

export default FormikField;
