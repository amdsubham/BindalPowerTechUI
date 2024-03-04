import React, { useState, useEffect, useRef } from 'react';
import { TextField, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { BrowserBarcodeReader } from '@zxing/library';
import ScannerIcon from '@mui/icons-material/Scanner'; // Import icon for scanner

const AddProduct = () => {
    const apiURL = 'http://localhost:3800/api/products';

    const [scannerActive, setScannerActive] = useState(false);
    const [matchingVariant, setMatchingVariant] = useState(null); // Initialize with null
    const [hasPermission, setHasPermission] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null); // State to hold API error
    const [cameraLoading, setCameraLoading] = useState(false); // State to indicate camera loading
    const [variants, setVariants] = useState([]);
    const [segments, setSegments] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const formikRef = useRef();

    useEffect(() => {
        const fetchVariantsAndSegments = async () => {
            try {
                const variantsResponse = await axios.get('http://localhost:3800/api/variants');
                setVariants(variantsResponse.data);
                const segmentsResponse = await axios.get('http://localhost:3800/api/segments');
                setSegments(segmentsResponse.data);
            } catch (error) {
                console.error('Error fetching variants and segments:', error);
            }
        };

        fetchVariantsAndSegments();
    }, []);

    const initialValues = {
        modelNumber: '',
        serialNumber: '',
        variantName: '',
        segmentName: '',
        description: '',
        price: '',
        createdTime: ''
    };

    const validationSchema = Yup.object().shape({
        modelNumber: Yup.string().required('Required'),
        serialNumber: Yup.string().required('Required'),
        variantName: Yup.string().required('Required'),
        segmentName: Yup.string().required('Required'),
        description: Yup.string(),
        price: Yup.number(),
        createdTime: Yup.date(),
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

    const openModal = (message) => {
        setModalMessage(message);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setModalMessage('');
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#fff' }}>
            <div style={{ maxWidth: '500px', width: '100%', padding: '20px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}>
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
                            const method = 'post';
                            const request = {
                                ...values,
                                name: values.variantName,
                                category: 'Battery',
                                warrantyPeriod: 12,
                                variantId: matchingVariant._id
                            }
                            await axios[method](apiURL, request);
                            openModal('Product added successfully');
                        } catch (error) {
                            console.error('Error saving product:', error);
                            setError(error.response?.data?.message || 'An error occurred while saving the product.');
                        } finally {
                            setIsSubmitting(false);
                            setSubmitting(false);
                        }
                    }}
                >
                    {({ handleSubmit, handleChange, values, errors, touched }) => (
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

                            <Button
                                type="submit" variant="contained" color="primary"
                                style={{ display: 'block', margin: '0 auto', color: '#fff' }} // Center the button and set text color to white
                                disabled={isSubmitting}>
                                {isSubmitting ? <CircularProgress color="white" size={24} /> : 'Save'}
                            </Button>
                        </form>
                    )}
                </Formik>
                {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
            </div>
            <Dialog open={modalOpen} onClose={closeModal}>
                <DialogTitle>Success</DialogTitle>
                <DialogContent>{modalMessage}</DialogContent>
                <DialogActions>
                    <Button onClick={closeModal} color="primary">Close</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default AddProduct;
