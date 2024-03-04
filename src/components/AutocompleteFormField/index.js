import React, { useEffect } from 'react';
import { TextField, Autocomplete } from '@mui/material';
import { useFormikContext } from 'formik';

const AutocompleteFormField = ({ name, options }) => {
  const { setFieldValue, values } = useFormikContext();

  // Attempt to find the "Battery" category or fallback to the first option or an empty object
  const findDefaultOption = () => {
    const batteryOption = options.find(option => option.name === "Battery");
    const firstOption = options.length > 0 ? options[0] : null;
    return batteryOption || firstOption;
  };

  // Set default value logic
  const defaultValue = options.length > 0
    ? (values[name] ? options.find(option => option._id === values[name]) : findDefaultOption())
    : null;

  useEffect(() => {
    // Automatically set "Battery" as default if no value is already selected and it exists
    // If "Battery" doesn't exist and no value is selected, use the first available option
    if (!values[name] && defaultValue) {
      setFieldValue(name, defaultValue._id);
    }
  }, [options, name, values, setFieldValue, defaultValue]);

  return (
    <Autocomplete
      value={defaultValue}
      onChange={(_, newValue) => {
        setFieldValue(name, newValue ? newValue._id : '');
      }}
      options={options}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, value) => option && value && option._id === value._id}
      renderInput={(params) => (
        <TextField {...params} label="Category" variant="outlined" fullWidth />
      )}
    />
  );
};

export default AutocompleteFormField;
