import { useState, useEffect } from "react";
import axios from "axios";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import RefreshIcon from "@mui/icons-material/Refresh";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import AdminModal from "components/AdminModal";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

function OrderList() {
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentAdminId, setCurrentAdminId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const filteredAdmins = admins.filter(admin => {
    return Object.values(admin).join(" ").toLowerCase().includes(searchQuery.toLowerCase());
  });

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://31.220.21.195:3800/api/admins');
      setAdmins(response.data);
    } catch (error) {
      console.error("Failed to fetch admins:", error);
    }
    setIsLoading(false);
  };

  const handleOpenDeleteDialog = (admin) => {
    setSelectedAdmin(admin);
    setDeleteDialogOpen(true);
    handleCloseMenu();
  };

  const closeModal = () => {
    setModalOpen(false);
    fetchAdmins();
    setSelectedAdmin(null);
    setCurrentAdminId(null);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleOpenMenu = (event, admin) => {
    setAnchorEl(event.currentTarget);
    setSelectedAdmin(admin);
  };

  const handleResetPassword = (admin) => {
    if (admin && admin._id) {
      openModal('resetPassword', admin._id);
      setCurrentAdminId(admin._id);
    }
    handleCloseMenu();
  };


  const openModal = (mode, adminId = null) => {
    setModalMode(mode);
    setCurrentAdminId(adminId);
    setModalOpen(true);
  };

  const handleEditAdmin = () => {
    openModal('edit', selectedAdmin._id)
    setCurrentAdminId(selectedAdmin._id);
    handleCloseMenu();
  };

  const handleDeleteAdmin = () => {
    if (selectedAdmin && selectedAdmin._id) {
      setIsLoading(true);
      axios.delete(`http://31.220.21.195:3800/api/admins/${selectedAdmin._id}`)
        .then(() => {
          setDeleteDialogOpen(false);
          fetchAdmins();
        })
        .catch((error) => {
          console.error("Error deleting admin:", error);
        })
        .finally(() => {
          setIsLoading(false);
          setSelectedAdmin(null);
        });
    }
  };

  const dataTableData = {
    columns: [
      { Header: "Name", accessor: "name" },
      { Header: "Email", accessor: "email" },
      {
        Header: "Actions",
        accessor: "actions",
        Cell: ({ row }) => (
          <div>
            <IconButton onClick={() => openModal('edit', row.original._id)}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => handleOpenDeleteDialog(row.original)}>
              <DeleteIcon />
            </IconButton>
            <IconButton onClick={() => handleResetPassword(row.original)}>
              <VpnKeyIcon />
            </IconButton>
          </div>
        ),
      }
    ],
    rows: filteredAdmins.map((admin) => ({
      ...admin,
      actions: (
        <IconButton onClick={(event) => handleOpenMenu(event, admin)}>
          <MoreVertIcon />
        </IconButton>
      ),
    }))
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox my={3}>
        <MDBox display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
          <IconButton onClick={() => fetchAdmins()} color="info">
            <RefreshIcon />
          </IconButton>
          <MDButton variant="gradient" color="info" sx={{ height: "fit-content" }}
            onClick={() => {
              openModal('add', null)
              setCurrentAdminId(null);
            }}
          >
            Add Admin
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
                <MenuItem onClick={handleResetPassword}>Reset Password</MenuItem>
                <MenuItem onClick={handleEditAdmin}>Edit Admin</MenuItem>
                <MenuItem onClick={() => handleOpenDeleteDialog(selectedAdmin)}>Delete Admin</MenuItem>
              </Menu>
            </>
          )}
        </Card>
      </MDBox>
      <Footer />
      <AdminModal open={modalOpen} onClose={closeModal} mode={modalMode} adminId={currentAdminId} refreshAdmins={fetchAdmins} />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete Admin?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this admin? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setDeleteDialogOpen(false)} >
            Cancel
          </MDButton>
          <MDButton onClick={handleDeleteAdmin} color="secondary" autoFocus>
            Delete
          </MDButton>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default OrderList;
