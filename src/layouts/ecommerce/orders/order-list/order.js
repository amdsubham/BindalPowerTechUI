import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import RefreshIcon from "@mui/icons-material/Refresh";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import OrderModal from "components/OrderModal"; // Make sure this modal is adapted for orders
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

function OrderList() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit'
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOrderData, setSelectedOrderData] = useState(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:3800/api/orders');
      setOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
    setIsLoading(false);
  };

  const handleEditOrder = (order) => {
    setSelectedOrderData(order);
    openModal('edit', order._id);
  };


  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOpenDeleteDialog = (order) => {
    setSelectedOrder(order);
    setDeleteDialogOpen(true);
    handleCloseMenu();
  };

  const handleOpenMenu = (event, order) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };

  const openModal = (mode, orderId = null) => {
    setModalMode(mode);
    setCurrentOrderId(orderId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalMode(null);
    setSelectedOrder(null);
    setCurrentOrderId(null);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleDeleteOrder = () => {
    if (selectedOrder && selectedOrder._id) {
      setIsLoading(true);
      axios.delete(`http://localhost:3800/api/orders/${selectedOrder._id}`)
        .then(() => {
          setDeleteDialogOpen(false);
          fetchOrders();
        })
        .catch((error) => {
          console.error("Error deleting order:", error);
        })
        .finally(() => {
          setIsLoading(false);
          setSelectedOrder(null);
        });
    }
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const options = {
      day: 'numeric',
      month: 'long', // Specify 'short' for abbreviated month name
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    };
    return date.toLocaleString('en-US', options);
  };

  const dataTableData = {
    columns: [
      { Header: "Order ID", accessor: "_id" },
      { Header: "Distributor", accessor: "distributorName" },
      { Header: "Category", accessor: "categoryName" },
      { Header: "Segment", accessor: "segmentName" },
      { Header: "Variant", accessor: "variantName" },
      { Header: "Quantity", accessor: "quantity" },
      { Header: "Total Price", accessor: "totalPrice" },
      { Header: "Created Time", accessor: "createdAt" },
      { Header: "Updated Time", accessor: "updatedAt" },
      {
        Header: "Actions",
        accessor: "actions",
        Cell: ({ row }) => (
          <div>
            {/* <IconButton onClick={() => handleEditOrder(row.original)}>
              <EditIcon />
            </IconButton> */}
            <IconButton onClick={() => handleOpenDeleteDialog(row.original)}>
              <DeleteIcon />
            </IconButton>
          </div>
        ),
      },
    ],
    rows: orders.map((order) => ({
      ...order,
      actions: (
        <IconButton onClick={(event) => handleOpenMenu(event, order)}>
          <MoreVertIcon />
        </IconButton>
      ),
      createdAt: formatDateTime(order.createdAt),
      updatedAt: formatDateTime(order.updatedAt),
    }))
  };





  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox my={3}>
        <MDBox display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
          {/* <IconButton onClick={() => fetchOrders()} color="info">
            <RefreshIcon />
          </IconButton> */}
          <MDButton variant="gradient" color="info" sx={{ height: "fit-content" }}
            onClick={() => openModal('add', null)}>
            Add Order
          </MDButton>
        </MDBox>

        <Card>
          {isLoading ? (
            <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress color="info" />
            </MDBox>
          ) : (
            <>
              <DataTable table={dataTableData} entriesPerPage={false} canSearch />
              <Menu
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
              >
                {/* <MenuItem onClick={() => handleEditOrder(selectedOrder._id)}>Edit Order</MenuItem> */}
                <MenuItem onClick={() => handleOpenDeleteDialog(selectedOrder)}>Delete Order</MenuItem>
              </Menu>
            </>
          )}
        </Card>
      </MDBox>
      <Footer />
      <OrderModal
        open={modalOpen}
        onClose={closeModal}
        mode={modalMode}
        orderId={currentOrderId}
        refreshOrders={fetchOrders}
        selectedOrderData={selectedOrderData}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete Order?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this order? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </MDButton>
          <MDButton onClick={handleDeleteOrder} color="secondary" autoFocus>
            Delete
          </MDButton>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default OrderList;
