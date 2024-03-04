import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CircularProgress, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import MDBox from "components/MDBox"; // Adjust path as needed
import MDButton from "components/MDButton"; // Adjust path as needed
import DataTable from "examples/Tables/DataTable"; // Adjust path as needed
import ProductModal from "components/ProductModal"; // Adjust path as needed
import DashboardLayout from "examples/LayoutContainers/DashboardLayout"; // Adjust path as needed
import DashboardNavbar from "examples/Navbars/DashboardNavbar"; // Adjust path as needed
import Footer from "examples/Footer"; // Adjust path as needed
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const baseURL = "http://31.220.21.195:3800/api/products";
const variantsURL = "http://31.220.21.195:3800/api/variants"; // Assuming you have a similar endpoint for variants
const segmentsURL = "http://31.220.21.195:3800/api/segments";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [segments, setSegments] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchVariants();
    fetchSegments();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(baseURL);
      setProducts(response.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
    setIsLoading(false);
  };

  // New function to fetch variants
  const fetchVariants = async () => {
    try {
      const response = await axios.get(variantsURL);
      setVariants(response.data);
    } catch (error) {
      console.error("Failed to fetch variants:", error);
    }
  };

  const fetchSegments = async () => {
    try {
      const response = await axios.get(segmentsURL);
      setSegments(response.data);
    } catch (error) {
      console.error('Failed to fetch segments:', error);
    }
  };

  const openModal = (product = null) => {
    setCurrentProduct(product);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentProduct(null);
    fetchProducts(); // Refresh the products list
  };

  const editProduct = (product) => {
    setCurrentProduct(product);
    setModalOpen(true);
  };

  const handleDeleteConfirmation = (product) => {
    setProductToDelete(product);
    setDeleteConfirmationOpen(true);
  };

  const handleDeleteProduct = async () => {
    try {
      await axios.delete(`${baseURL}/${productToDelete._id}`);
      fetchProducts(); // Refresh the products list after deletion
    } catch (error) {
      console.error('Error deleting product:', error);
    }
    setDeleteConfirmationOpen(false);
  };

  const closeDeleteConfirmation = () => {
    setDeleteConfirmationOpen(false);
    setProductToDelete(null);
  };

  const dataTableData = {
    columns: [
      { Header: "Serial Number", accessor: "serialNumber" },
      { Header: "Model Number", accessor: "modelNumber" },
      {
        Header: "Description",
        accessor: "description",
        Cell: ({ value }) => <div style={{ maxWidth: '200px', maxHeight: '50px', overflow: 'hidden', overflowY: 'auto', textOverflow: 'ellipsis' }}>{value}</div>,
      },

      { Header: "Variant", accessor: "variantName" },
      { Header: "Segment", accessor: "segmentName" },
      { Header: "Price", accessor: "price" },
      { Header: "Status", accessor: "status" },
      {
        Header: "Created At",
        accessor: "createdAt",
        Cell: ({ value }) => new Date(value).toLocaleString(), // Convert timestamp to human-readable format
      },
      {
        Header: "Updated At",
        accessor: "updatedAt",
        Cell: ({ value }) => new Date(value).toLocaleString(), // Convert timestamp to human-readable format
      },
      {
        Header: "Actions",
        Cell: ({ row }) => (
          <div>
            <IconButton onClick={() => editProduct(row.original)}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => handleDeleteConfirmation(row.original)}>
              <DeleteIcon />
            </IconButton>
          </div>
        ),
        sticky: "true", // Fix the "Actions" column at the right
      },
    ],
    rows: products.map(product => ({
      ...product,
    })),
  };


  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox my={3}>
        <MDBox display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
          <IconButton onClick={fetchProducts}>
            <RefreshIcon />
          </IconButton>
          <MDButton variant="gradient" color="info" onClick={() => openModal()}>
            <AddIcon /> Add Product
          </MDButton>
        </MDBox>
        <Card>
          {isLoading ? (
            <CircularProgress />
          ) : (
            <DataTable table={dataTableData} entriesPerPage={5} canSearch />
          )}
        </Card>
      </MDBox>
      <Footer />
      {modalOpen && (
        <ProductModal
          open={modalOpen}
          onClose={closeModal}
          product={currentProduct}
          variants={variants} // Pass variants to the modal
          segments={segments}
          refreshProducts={fetchProducts}
        />
      )}
      <Dialog
        open={deleteConfirmationOpen}
        onClose={closeDeleteConfirmation}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete Product?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this product? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={closeDeleteConfirmation} >
            Cancel
          </MDButton>
          <MDButton onClick={handleDeleteProduct} color="secondary" autoFocus>
            Delete
          </MDButton>
        </DialogActions>
      </Dialog>
    </DashboardLayout >
  );
}

export default ProductList;
