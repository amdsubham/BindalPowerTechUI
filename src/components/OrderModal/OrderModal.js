import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, CircularProgress, IconButton } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
const OrderModal = ({ open, onClose, refreshOrders, products, mode, orderId, selectedOrderData }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [segments, setSegments] = useState([]);
  const [variants, setVariants] = useState([]);
  const [selectedDistributor, setSelectedDistributor] = useState();
  const [selectedCategory, setSelectedCategory] = useState();
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [quantityError, setQuantityError] = useState('');
  const [serialNumbers, setSerialNumbers] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [initialValues, setInitialValues] = useState({
    address: '',
    distributorName: '',
    category: '',
    segment: '',
    variant: '',
    categoryName: '',
    segmentName: '',
    variantName: '',
    quantity: '',
    totalPrice: '',
    name: '',
    description: '',
    serialNumbers: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesResponse = await axios.get('https://api.bindaladmin.com/api/categories');
        const fetchedCategories = categoriesResponse.data;
        setCategories(fetchedCategories);

        const distributorsResponse = await axios.get('https://api.bindaladmin.com/api/distributors');
        setDistributors(distributorsResponse.data);

        const segmentsResponse = await axios.get('https://api.bindaladmin.com/api/segments');
        setSegments(segmentsResponse.data);

        const variantsResponse = await axios.get('https://api.bindaladmin.com/api/variants');
        setVariants(variantsResponse.data);

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error fetching data. Please try again.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchAvailableProducts = async () => {
      if (selectedVariant) {
        try {
          // Fetch all products
          const productsResponse = await axios.get(`https://api.bindaladmin.com/api/products?variant=${selectedVariant._id}`);
          // Filter in-stock products
          const inStockProducts = productsResponse.data.filter(product => product.status === 'InStock' && product.modelNumber === selectedVariant.modelNumber);

          if (inStockProducts.length === 0) {
            setError('No products are available.');
          } else {
            setAvailableProducts(inStockProducts);
            setError(null); // Clear previous error if products are available
          }
        } catch (error) {
          console.error('Error fetching available products:', error);
          setAvailableProducts([]);
          setError('Error fetching available products. Please try again.');
        }
      }
    };



    fetchAvailableProducts();
  }, [selectedVariant]);

  // useEffect(() => {
  //   if (mode === 'edit' && selectedOrderData) {
  //     // Populate form fields with selected order data
  //     setSelectedDistributor(selectedOrderData.distributor);
  //     setSelectedCategory(selectedOrderData.category);
  //     setSelectedSegment(selectedOrderData.segment);
  //     setSelectedVariant(selectedOrderData.variant);
  //     // setInitialValues({ quantity: selectedOrderData.quantity });
  //     // Populate other form fields accordingly...
  //   }
  // }, [mode, selectedOrderData]);

  useEffect(() => {
    const updatedSerialNumbers = selectedProducts.map(product => product.serialNumber).join(', ');
    setSerialNumbers(updatedSerialNumbers);
  }, [selectedProducts]);

  useEffect(() => {
    // Populate initial values if mode is 'edit' and selectedOrderData exists
    if (mode === 'edit' && selectedOrderData) {
      setInitialValues({
        address: selectedOrderData.address,
        distributorName: selectedOrderData.distributorName,
        category: selectedOrderData.categoryId,
        segment: selectedOrderData.segmentId,
        variant: selectedOrderData.variantId,
        categoryName: selectedOrderData.categoryName,
        segmentName: selectedOrderData.segmentName,
        variantName: selectedOrderData.variantName,
        quantity: selectedOrderData.quantity,
        totalPrice: selectedOrderData.totalPrice,
        name: selectedOrderData.productName,
        description: selectedOrderData.description,
        serialNumbers: selectedOrderData.serialNumbers.join(', '), // Assuming serialNumbers is an array
      });
    }
  }, [mode, selectedOrderData]);

  const validationSchema = Yup.object().shape({
    address: Yup.string(),
    distributorName: Yup.string().required('Required'),
    category: Yup.string().required('Required'),
    segment: Yup.string().required('Required'),
    variant: Yup.string().required('Required'),
    categoryName: Yup.string().required('Required'),
    segmentName: Yup.string().required('Required'),
    variantName: Yup.string().required('Required'),
    quantity: Yup.number().required('Required').positive('Quantity must be positive').integer('Quantity must be an integer'),
    totalPrice: Yup.number().required('Required'),
    name: Yup.string().required('Required'),
    description: Yup.string().required('Required'),
    serialNumbers: Yup.string(),
  });

  useEffect(() => {
    const productPrice = selectedProducts.length > 0 ? selectedProducts[0].price : 0;
    const productNumber = serialNumbers.split(',')
    const totalPrice = productNumber.length * productPrice;
    setTotalPrice(totalPrice);
  }, [serialNumbers]);

  const handleQuantityChange = (event, setFieldValue) => {
    const quantity = event.target.value;
    setFieldValue('quantity', quantity);
    if (quantity && availableProducts.length > 0) {
      const selectedProducts = availableProducts.slice(0, parseInt(quantity));
      setSelectedProducts(selectedProducts);
      if (selectedProducts.length < parseInt(quantity)) {
        setQuantityError('Not enough products available.');
      } else {
        setQuantityError('');
      }
    } else {
      setSelectedProducts([]);
      setQuantityError('');
    }
  };

  const submitOrder = async (values) => {
    try {
      const orderData = {
        address: selectedDistributor.address,
        distributor: selectedDistributor._id,
        distributorName: selectedDistributor.name,
        categoryId: selectedCategory._id,
        segmentId: selectedSegment._id,
        variantId: selectedVariant._id,
        categoryName: selectedCategory.name,
        segmentName: selectedSegment.name,
        variantName: selectedVariant.name,
        quantity: parseInt(values.quantity),
        totalPrice: parseFloat(totalPrice),
        productName: selectedProducts.length > 0 ? selectedProducts[0].name : '',
        description: selectedProducts.length > 0 ? selectedProducts[0].description : '',
        serialNumbers: serialNumbers.split(',').map(serialNumber => serialNumber.trim()),
      };

      if (orderId) {
        // If orderId exists in values, it means we are updating an existing order
        const response = await axios.put(`https://api.bindaladmin.com/api/orders/${orderId}`, orderData);
        console.log('Order updated successfully:', response.data);
      } else {
        // If orderId doesn't exist, it means we are creating a new order
        const response = await axios.post('https://api.bindaladmin.com/api/orders', orderData);
        console.log('Order submitted successfully:', response.data);
      }
      const selectedSerialNumbers = serialNumbers.split(',').map(serialNumber => serialNumber.trim());
      await Promise.all(selectedSerialNumbers.map(async (serialNumber) => {
        await axios.put(`https://api.bindaladmin.com/api/products/update/${serialNumber}`, { status: 'Allocated' });
      }));

      refreshOrders();
      onClose();
      setInitialValues({
        address: '',
        distributorName: '',
        category: '',
        segment: '',
        variant: '',
        categoryName: '',
        segmentName: '',
        variantName: '',
        quantity: '',
        totalPrice: '',
        name: '',
        description: '',
        serialNumbers: '',
      });
    } catch (error) {
      console.error('Error submitting order:', error);
      setError('Error submitting order. Please try again.');
    }
  };

  const handleCloseModal = () => {
    onClose();
    setSelectedDistributor(null);
    setSelectedCategory(null);
    setSelectedSegment(null);
    setSelectedVariant(null);
    setAvailableProducts([]);
    setSelectedProducts([]);
    setQuantityError('');
    setSerialNumbers('');
    setTotalPrice('');
    setInitialValues({
      address: '',
      distributorName: '',
      category: '',
      segment: '',
      variant: '',
      categoryName: '',
      segmentName: '',
      variantName: '',
      quantity: '',
      totalPrice: '',
      name: '',
      description: '',
      serialNumbers: '',
    });
  };

  return (
    <Dialog open={open} onClose={handleCloseModal} maxWidth="md" fullWidth>
      <DialogTitle>{mode === 'edit' ? 'Edit Order' : 'Create Order'}</DialogTitle>
      <IconButton aria-label="close" onClick={handleCloseModal} sx={{ position: 'absolute', right: 8, top: 8, color: 'inherit' }}>
        <CloseIcon />
      </IconButton>
      <DialogContent dividers style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={submitOrder}
            enableReinitialize
          >
            {({ values, errors, touched, handleChange, handleSubmit, setFieldValue }) => (
              <Form autoComplete="off">
                {/* Autocomplete for Distributor */}
                <Autocomplete
                  id="distributorName"
                  options={distributors}
                  getOptionLabel={(option) => option.name}
                  renderInput={(params) => <TextField {...params} label="Distributor Name" />}
                  value={selectedDistributor}
                  onChange={(event, value) => setSelectedDistributor(value)}
                />
                <div style={{ marginBottom: '16px' }}></div>

                {/* Display Address */}
                <TextField
                  fullWidth
                  id="address"
                  name="address"
                  label="Address"
                  value={selectedDistributor ? selectedDistributor.address : ''}
                  onChange={handleChange}
                  error={touched.address && Boolean(errors.address)}
                  helperText={touched.address && errors.address}
                  margin="dense"
                />
                <div style={{ marginBottom: '16px' }}></div>

                {/* Autocomplete for Category */}
                <Autocomplete
                  id="category"
                  options={categories}
                  getOptionLabel={(option) => option.name}
                  renderInput={(params) => <TextField {...params} label="Category" />}
                  value={selectedCategory}
                  onChange={(event, value) => setSelectedCategory(value)}
                />
                <div style={{ marginBottom: '16px' }}></div>

                {/* Autocomplete for Segment */}
                <Autocomplete
                  id="segment"
                  options={segments.filter(segment => segment.categoryId === selectedCategory?.id)}
                  getOptionLabel={(option) => option.name}
                  renderInput={(params) => <TextField {...params} label="Segment" />}
                  value={selectedSegment}
                  onChange={(event, value) => {
                    handleChange(event);
                    const selectedSegment = segments.find(segment => segment._id === value?._id);
                    setFieldValue('variant', '');
                    setSelectedVariant(null);
                    setSelectedProducts([]);
                    setQuantityError('');
                    setSelectedSegment(selectedSegment);
                  }}
                  disabled={!selectedCategory}
                />
                <div style={{ marginBottom: '16px' }}></div>

                {/* Autocomplete for Variant */}
                <Autocomplete
                  id="variant"
                  options={variants.filter(variant => variant.segment === selectedSegment?._id)}
                  getOptionLabel={(option) => option.name}
                  renderInput={(params) => <TextField {...params} label="Variant" />}
                  value={selectedVariant}
                  onChange={(event, value) => {
                    handleChange(event);
                    setFieldValue('variant', value);
                    setSelectedVariant(value);
                  }}
                  disabled={!selectedSegment}
                />
                <div style={{ marginBottom: '16px' }}></div>

                {/* Quantity Input */}
                <TextField
                  fullWidth
                  id="quantity"
                  name="quantity"
                  label="Quantity"
                  type="number"
                  value={values.quantity}
                  onChange={(event) => handleQuantityChange(event, setFieldValue)}
                  error={touched.quantity && Boolean(errors.quantity)}
                  helperText={touched.quantity && errors.quantity}
                  margin="dense"
                />
                <div style={{ marginBottom: '16px', color: 'red' }}>{quantityError}</div>

                {/* Serial Numbers Input */}
                <TextField
                  fullWidth
                  id="serialNumbers"
                  name="serialNumbers"
                  label="Serial Numbers"
                  value={serialNumbers}
                  onChange={handleChange}
                  error={touched.serialNumbers && Boolean(errors.serialNumbers)}
                  helperText={touched.serialNumbers && errors.serialNumbers}
                  margin="dense"
                />
                <div style={{ marginBottom: '16px' }}></div>

                {/* Total Price Display */}
                <TextField
                  fullWidth
                  id="totalPrice"
                  name="totalPrice"
                  label="Price"
                  value={`₹${totalPrice} Including GST`}
                  disabled
                  margin="dense"
                />

                <DialogActions>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    {totalPrice > 0 && (
                      <Typography variant="body1" style={{ fontWeight: 'bold', color: 'rgba(0, 0, 0, 0.87)', marginRight: '16px' }}>
                        Total Price: ₹{totalPrice} (Including GST)
                      </Typography>
                    )}
                    <div>
                      <Button onClick={handleCloseModal} style={{ marginRight: '8px' }}>Cancel</Button>
                      <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        onClick={() => submitOrder(values)}
                        style={{ marginRight: '8px', color: 'white' }}
                        disabled={isLoading || selectedProducts.length === 0 || !!quantityError}
                      >
                        {isLoading ? <CircularProgress size={24} style={{ color: 'white' }} /> : 'Submit Order'}
                      </Button>
                    </div>
                  </div>
                </DialogActions>
              </Form>
            )}
          </Formik>
        )}
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </DialogContent>
    </Dialog>
  );
};

export default OrderModal;
