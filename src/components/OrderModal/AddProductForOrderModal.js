import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { TextField, Button, CircularProgress, IconButton } from "@mui/material";
import { Formik } from "formik";
import * as Yup from "yup";
import { BrowserBarcodeReader } from "@zxing/library";
import CloseIcon from "@mui/icons-material/Close";

const AddProductForOrderModal = ({ closeModal, addProductToOrder, addedProducts }) => {
    const [scannerActive, setScannerActive] = useState(false);
    const [matchingVariant, setMatchingVariant] = useState(null);
    const [hasPermission, setHasPermission] = useState(false);
    const [cameraLoading, setCameraLoading] = useState(false);
    const formikRef = useRef();
    const [error, setError] = useState("");
    const [allFieldsDisabled, setAllFieldsDisabled] = useState(false);
    const [existingProducts, setExistingProducts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes] = await Promise.all([
                    axios.get("https://api.bindaladmin.com/api/products"),
                ]);
                setExistingProducts(productsRes.data);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        setError("");
        requestCameraPermission(); // Automatically start the scanner when the modal opens
    }, []); // Empty dependency array to ensure it runs only once

    const initialValues = {
        modelNumber: "",
        serialNumber: "",
        variantName: "",
        segmentName: "",
        description: "",
        price: "",
        createdTime: "",
    };

    const validationSchema = Yup.object().shape({
        modelNumber: Yup.string().required("Required"),
        serialNumber: Yup.string().required("Required"),
        variantName: Yup.string().required("Required"),
        segmentName: Yup.string().required("Required"),
        description: Yup.string(),
        price: Yup.number(),
        createdTime: Yup.date(),
    });

    const requestCameraPermission = async () => {
        try {
            setCameraLoading(true);
            await navigator.mediaDevices.getUserMedia({ video: true });
            setHasPermission(true);
            setScannerActive(true);
        } catch (error) {
            console.error("Camera permission denied:", error);
            setHasPermission(false);
        } finally {
            setCameraLoading(false);
        }
    };

    useEffect(() => {
        if (!scannerActive || !hasPermission) return;

        const codeReader = new BrowserBarcodeReader();
        codeReader
            .decodeOnceFromVideoDevice(undefined, "video")
            .then((result) => {
                const [serialNumber, modelNumber] = result.text.split(",");
                const matchingProduct = existingProducts.find(
                    (product) => product.serialNumber === serialNumber
                );
                if (!matchingProduct) {
                    setError("Product not found.");
                } else if (matchingProduct.status !== "InStock") {
                    setError("Product already allocated.");
                } else {
                    setMatchingVariant(matchingProduct);
                    formikRef.current.setValues({
                        modelNumber: matchingProduct.modelNumber,
                        serialNumber: matchingProduct.serialNumber,
                        variantName: matchingProduct.variantName,
                        segmentName: matchingProduct.segmentName,
                        description: matchingProduct.description,
                        price: matchingProduct.price,
                        createdTime: new Date().toISOString(),
                    });
                }
                setScannerActive(false);
            })
            .catch((err) => {
                console.error(err);
                setScannerActive(false);
            })
            .finally(() => codeReader.reset());

        return () => codeReader && codeReader.reset();
    }, [scannerActive, hasPermission, existingProducts]);

    const handleAddMoreProducts = () => {
        setAllFieldsDisabled(false);
        setMatchingVariant(null);
        setError("");
        formikRef.current.resetForm();
        setScannerActive(true); // Reopen the scanner
    };

    return (
        <div>
            <IconButton
                style={{ position: "absolute", top: 5, right: 5 }}
                onClick={closeModal}
            >
                <CloseIcon />
            </IconButton>
            {cameraLoading && <CircularProgress style={{ color: "#1976d2", marginTop: "16px" }} />}
            {scannerActive && hasPermission && <div><video id="video" style={{ width: "100%", height: "200px" }}></video></div>}
            <Formik
                innerRef={formikRef}
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={async (values, { setSubmitting }) => {
                    try {
                        if (!matchingVariant) {
                            return;
                        }

                        const existingProduct = addedProducts.find(product => product.serialNumber === matchingVariant.serialNumber);

                        if (existingProduct) {
                            setError("Product already added.");
                        } else {
                            addProductToOrder(matchingVariant, values);
                            setAllFieldsDisabled(true);
                        }
                    } finally {
                        setSubmitting(false);
                    }
                }}
            >
                {({ handleSubmit, handleChange, values, errors, touched }) => (
                    <form onSubmit={handleSubmit}>
                        {error && <div style={{ color: "red" }}>{error}</div>}
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
                            disabled={allFieldsDisabled}
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
                            disabled={allFieldsDisabled}
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
                            disabled={allFieldsDisabled}
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
                            disabled={allFieldsDisabled}
                        />

                        {allFieldsDisabled && <div style={{ color: "green" }}>Product added successfully.</div>}

                        {!allFieldsDisabled && (
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                style={{ display: "block", margin: "0 auto", color: "#fff" }}
                                disabled={allFieldsDisabled}
                            >
                                Save
                            </Button>
                        )}

                        <Button
                            type="button"
                            variant="contained"
                            color="secondary"
                            style={{ display: "block", margin: "0 auto", color: "#fff", marginTop: "10px" }}
                            onClick={handleAddMoreProducts}
                        >
                            Add More Products
                        </Button>
                    </form>
                )}
            </Formik>
        </div>
    );
};

export default AddProductForOrderModal;
