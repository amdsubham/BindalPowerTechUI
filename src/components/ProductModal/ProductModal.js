import React, { useState, useEffect, useRef } from 'react';
import { Dialog, Autocomplete, DialogTitle, DialogContent, DialogActions, Button, TextField, CircularProgress, IconButton, MenuItem } from '@mui/material';
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { BrowserBarcodeReader } from '@zxing/library';
import ScannerIcon from '@mui/icons-material/Scanner'; // Import icon for scanner

const ProductModal = ({ open, onClose, product, refreshProducts, variants, segments }) => {
    const [scannerActive, setScannerActive] = useState(false);
    const [matchingVariant, setMatchingVariant] = useState([]);
    const [hasPermission, setHasPermission] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null); // State to hold API error
    const [cameraLoading, setCameraLoading] = useState(false); // State to indicate camera loading

    const formikRef = useRef();

    // API endpoint URL
    const apiURL = product ? `http://localhost:3800/api/products/${product._id}` : 'http://localhost:3800/api/products';

    const initialValues = {
        modelNumber: '',
        serialNumber: '',
        variantName: '',
        segmentName: '',
        description: '',
        price: '',
        createdTime: '',
        status: '', // New field for status
        ...product // Populate with product if editing
    };

    const validationSchema = Yup.object().shape({
        modelNumber: Yup.string().required('Required'),
        serialNumber: Yup.string().required('Required'),
        variantName: Yup.string().required('Required'),
        segmentName: Yup.string().required('Required'),
        description: Yup.string(),
        price: Yup.number(),
        createdTime: Yup.date(),
        // status: Yup.string().required('Required'), // Validation for status
    });

    const requestCameraPermission = async () => {
        try {
            setCameraLoading(true); // Set camera loading to true while requesting permission
            await navigator.mediaDevices.getUserMedia({ video: true });
            setHasPermission(true);
            setScannerActive(true);
        } catch (error) {
            console.error('Camera permission denied:', error);
            setHasPermission(false);
        } finally {
            setCameraLoading(false); // Set camera loading to false once permission request is complete
        }
    };

    useEffect(() => {
        if (!scannerActive || !hasPermission) return;

        const codeReader = new BrowserBarcodeReader();
        codeReader.decodeOnceFromVideoDevice(undefined, 'video')
            .then(result => {
                const [serialNumber, modelNumber] = result.text.split(",");
                const matchingVariant = variants.find(variant => variant.modelNumber === modelNumber);
                if (matchingVariant) {
                    setMatchingVariant(matchingVariant)
                    const matchingSegment = segments.find(segment => segment.id === matchingVariant.segmentId)?.name || '';
                    formikRef.current.setValues({
                        modelNumber,
                        serialNumber,
                        variantName: matchingVariant.name,
                        segmentName: matchingSegment,
                        description: matchingVariant.description,
                        price: matchingVariant.price,
                        createdTime: new Date().toISOString(),
                        status: product ? product.status : '', // Set initial status value if editing
                    });
                }
                setScannerActive(false);
            })
            .catch(err => {
                console.error(err);
                setScannerActive(false);
            })
            .finally(() => codeReader.reset());

        return () => codeReader && codeReader.reset();
    }, [scannerActive, hasPermission, variants, segments]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{product ? 'Edit Product' : 'Add Product'}</DialogTitle>
            <DialogContent>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={requestCameraPermission}
                    startIcon={<ScannerIcon />} // Icon for starting scanner
                    style={{ display: 'block', margin: '0 auto', color: '#fff' }} // Center the button and set text color to white
                >
                    {scannerActive ? 'Scanning...' : 'Start Scanner'}
                </Button>
                {cameraLoading && <CircularProgress style={{ color: '#1976d2', marginTop: '16px' }} />} {/* Display blue loading indicator */}
                {scannerActive && hasPermission && <div><video id="video" style={{ width: '100%', height: '200px' }}></video></div>}
                <Formik
                    innerRef={formikRef}
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={async (values, { setSubmitting }) => {
                        setIsSubmitting(true);
                        try {
                            const method = product ? 'put' : 'post';
                            const request = {
                                ...values,
                                name: values.variantName,
                                category: 'Battery',
                                warrantyPeriod: 12,
                                variantId: matchingVariant._id,
                                status: method === 'put' ? values.status : 'InStock'
                            }
                            console.log("values", request)
                            await axios[method](apiURL, request);
                            refreshProducts(); // Call to refresh the list of products
                            onClose();
                        } catch (error) {
                            console.error('Error saving product:', error);
                            setError(error.response?.data?.message || 'An error occurred while saving the product.');
                        } finally {
                            setIsSubmitting(false);
                            setSubmitting(false);
                        }
                    }}
                >
                    {({ handleSubmit, handleChange, values, errors, touched, setFieldValue }) => (
                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                id="serialNumber"
                                name="serialNumber"
                                label="Serial Number"
                                value={values.serialNumber}
                                onChange={handleChange}
                                error={touched.serialNumber && Boolean(errors.serialNumber)}
                                helperText={touched.serialNumber && errors.serialNumber}
                                margin="dense"
                            />
                            <TextField
                                fullWidth
                                id="modelNumber"
                                name="modelNumber"
                                label="Model Number"
                                value={values.modelNumber}
                                onChange={handleChange}
                                error={touched.modelNumber && Boolean(errors.modelNumber)}
                                helperText={touched.modelNumber && errors.modelNumber}
                                margin="dense"
                            />

                            <TextField
                                fullWidth
                                id="variantName"
                                name="variantName"
                                label="Variant Name"
                                value={values.variantName}
                                onChange={handleChange}
                                error={touched.variantName && Boolean(errors.variantName)}
                                helperText={touched.variantName && errors.variantName}
                                margin="dense"
                            />
                            <TextField
                                fullWidth
                                id="segmentName"
                                name="segmentName"
                                label="Segment Name"
                                value={values.segmentName}
                                onChange={handleChange}
                                error={touched.segmentName && Boolean(errors.segmentName)}
                                helperText={touched.segmentName && errors.segmentName}
                                margin="dense"
                            />

                            {/* Dropdown for selecting status */}
                            {product && (
                                <Autocomplete
                                    fullWidth
                                    id="status"
                                    name="status"
                                    label="Status"
                                    options={['InStock', 'OutOfStock', 'Discontinued']}
                                    value={values.status}
                                    onChange={(event, value) => setFieldValue('status', value)}
                                    renderInput={(params) => <TextField {...params} label="Status" />}
                                    error={touched.status && Boolean(errors.status)}
                                    helperText={touched.status && errors.status}
                                    margin="dense"
                                />
                            )}


                            <DialogActions>
                                <Button onClick={onClose}>Cancel</Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    style={{ color: '#fff' }}
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <CircularProgress size={24} /> : 'Save'}
                                </Button>
                            </DialogActions>
                        </form>
                    )}
                </Formik>
                {error && <div style={{ color: 'red' }}>{error}</div>}
            </DialogContent>
        </Dialog>
    );
};

export default ProductModal;
