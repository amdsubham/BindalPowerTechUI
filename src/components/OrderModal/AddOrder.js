import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CircularProgress,
  Grid,
  TextField,
  Autocomplete,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  List,
  ListItem,
  ListItemText
} from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import ScannerIcon from "@mui/icons-material/Scanner";
import AddProductForOrderModal from "./AddProductForOrderModal";

const AddOrder = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [distributors, setDistributors] = useState([]);
  const [selectedDistributor, setSelectedDistributor] = useState(null);
  const [distributorAddress, setDistributorAddress] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [existingProducts, setExistingProducts] = useState([]);
  const [addedProducts, setAddedProducts] = useState([]);
  const [totalPrice, setTotalPrice] = useState('');
  const [isCreatingOrder, setIsCreatingOrder] = useState(false); // state for "Create Order" button loader

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      try {
        const [distributorsRes, productsRes] = await Promise.all([
          axios.get("https://api.bindaladmin.com/api/distributors"),
          axios.get("https://api.bindaladmin.com/api/products"),
        ]);
        setDistributors(distributorsRes.data);
        setExistingProducts(productsRes.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const totalPrice = addedProducts.reduce((total, product) => total + product.price, 0);
    setTotalPrice(totalPrice);
  }, [addedProducts]);


  useEffect(() => {
    if (selectedDistributor) {
      setDistributorAddress(selectedDistributor.address);
    } else {
      setDistributorAddress("");
    }
  }, [selectedDistributor]);

  const handleAddProduct = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleClearAll = () => {
    const isConfirmed = window.confirm("Are you sure you want to clear all?");
    if (isConfirmed) {
      setSelectedDistributor(null);
      setDistributorAddress("");
      setExistingProducts([]);
      setAddedProducts([]);
    }
  };

  const handleSubmitOrder = async () => {
    try {
      setIsCreatingOrder(true); // Start loader for "Create Order" button

      const selectedSerialNumbers = addedProducts.map(product => product.serialNumber) || [];
      const orderData = {
        address: selectedDistributor.address,
        distributor: selectedDistributor._id,
        distributorName: selectedDistributor.name,
        categoryId: '65e7ed9777953c02b586c763',
        categoryName: 'Battery',
        quantity: addedProducts.length,
        totalPrice: parseFloat(totalPrice),
        productName: '',
        description: '',
        serialNumbers: selectedSerialNumbers
      };

      console.log("Submitting order with products: ", addedProducts);

      const response = await axios.post('https://api.bindaladmin.com/api/orders', orderData);

      console.log('Order submitted successfully:', response.data);

      await Promise.all(selectedSerialNumbers.map(async (serialNumber) => {
        await axios.put(`https://api.bindaladmin.com/api/products/update/${serialNumber}`, { status: 'Allocated' });
      }));

      setSelectedDistributor(null);
      setDistributorAddress("");
      setExistingProducts([]);
      setAddedProducts([]);
      setTotalPrice('');

      alert('Order submitted successfully!');
    } catch (error) {
      console.error('Failed to submit order:', error);
      alert('Failed to submit order. Please try again later.');
    } finally {
      setIsCreatingOrder(false); // Stop loader for "Create Order" button
    }
  };

  const handleAddProductToOrder = (product, values) => {
    setAddedProducts([...addedProducts, { ...product, ...values }]);
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#fff" }}>
        <CircularProgress color="primary" />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#fff" }}>
      <MDBox my={3}>
        <Card>
          <MDBox p={3}>
            <MDTypography variant="h5">Add New Order</MDTypography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Autocomplete
                  options={distributors}
                  getOptionLabel={(option) => option.name}
                  onChange={(event, newValue) => {
                    setSelectedDistributor(newValue);
                    setDistributorAddress(newValue ? newValue.address : "");
                  }}
                  renderInput={(params) => <TextField {...params} label="Distributor" />}
                  value={selectedDistributor}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Address"
                  value={distributorAddress}
                  fullWidth
                  readOnly
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddProduct}
                  startIcon={<ScannerIcon />}
                  style={{ display: "block", margin: "0 auto", color: "#fff" }}
                >
                  Add Product
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6">Added Products:</Typography>
                <List>
                  {addedProducts.map((product, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={product.serialNumber} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
            <MDBox mt={3} display="flex" justifyContent="flex-end">
              <MDButton variant="contained" color="info" disabled={isLoading || isCreatingOrder} onClick={handleSubmitOrder} >
                {isCreatingOrder ? <CircularProgress size={24} color="inherit" /> : "Create Order"}
              </MDButton>
              <Button onClick={handleClearAll}>
                Clear All
              </Button>
            </MDBox>

          </MDBox>
        </Card>
      </MDBox>
      <Dialog open={modalOpen} onClose={closeModal}>
        <DialogTitle>Add Product</DialogTitle>
        <DialogContent>
          <AddProductForOrderModal closeModal={closeModal} existingProducts={existingProducts} addProductToOrder={handleAddProductToOrder} addedProducts={addedProducts} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddOrder;
