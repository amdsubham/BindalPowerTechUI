import { useState, useEffect } from "react";
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
import DistributorModal from "components/DistributorModal"; // Make sure this modal is adapted for distributors
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Link } from "react-router-dom";

function DistributorList() {
  const [distributors, setDistributors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDistributor, setSelectedDistributor] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'resetPassword'
  const [currentDistributorId, setCurrentDistributorId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchDistributors = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:3800/api/distributors');
      setDistributors(response.data);
    } catch (error) {
      console.error("Failed to fetch distributors:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDistributors();
  }, []);

  const handleOpenDeleteDialog = (distributor) => {
    setSelectedDistributor(distributor);
    setDeleteDialogOpen(true);
    handleCloseMenu();
  };

  const handleDistributorClick = (distributorId) => {
    history.push(`/dealers/${distributorId}`);
  };

  const handleOpenMenu = (event, distributor) => {
    setAnchorEl(event.currentTarget);
    setSelectedDistributor(distributor);
  };

  const openModal = (mode, distributorId = null) => {
    setModalMode(mode);
    setCurrentDistributorId(distributorId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalMode(null);
    setSelectedDistributor(null);
    setCurrentDistributorId(null);

  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleDeleteDistributor = () => {
    if (selectedDistributor && selectedDistributor._id) {
      setIsLoading(true);
      axios.delete(`http://localhost:3800/api/distributors/${selectedDistributor._id}`)
        .then(() => {
          setDeleteDialogOpen(false);
          fetchDistributors();
        })
        .catch((error) => {
          console.error("Error deleting distributor:", error);
        })
        .finally(() => {
          setIsLoading(false);
          setSelectedDistributor(null);
        });
    }
  };

  const handleShowAllDealers = (distributorId) => {
    window.open(`/dealers/${distributorId}`, "_blank");
  };

  const dataTableData = {
    columns: [
      { Header: "Name", accessor: "name" },
      { Header: "Email", accessor: "email" },
      { Header: "Phone", accessor: "contactNumber" },
      {
        Header: "Address", accessor: "address",
        Cell: ({ value }) => <div style={{ maxWidth: '200px', maxHeight: '50px', overflow: 'hidden', overflowY: 'auto', textOverflow: 'ellipsis' }}>{value}</div>,

      },
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
          </div>
        ),
      },


      {
        Header: "Show All Dealers",
        accessor: "showAllDealers",
        Cell: ({ row }) => (
          <Link to={`/dashboards/dealerlist/${row.original._id}`} >
            <IconButton >
              <OpenInNewIcon />
            </IconButton>
          </Link >
        ),
      },
    ],
    rows: distributors.map((distributor) => ({
      ...distributor,
      actions: (
        <IconButton onClick={(event) => handleOpenMenu(event, distributor)}>
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
          <IconButton onClick={() => fetchDistributors()} color="info">
            <RefreshIcon />
          </IconButton>
          <MDButton variant="gradient" color="info" sx={{ height: "fit-content" }}
            onClick={() => openModal('add', null)}>
            Add Distributor
          </MDButton>
        </MDBox>

        <Card>
          {isLoading ? (
            <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress color="info" />
            </MDBox>
          ) : (
            <>
              <DataTable
                table={dataTableData} entriesPerPage={false} canSearch
                onRowClick={(row) => handleDistributorClick(row.original._id)}
              />
              <Menu
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
              >
                <MenuItem onClick={() => openModal('edit', selectedDistributor._id)}>Edit Distributor</MenuItem>
                <MenuItem onClick={() => handleOpenDeleteDialog(selectedDistributor)}>Delete Distributor</MenuItem>
              </Menu>
            </>
          )}
        </Card>
      </MDBox>
      <Footer />
      {modalOpen && (<DistributorModal
        open={modalOpen}
        onClose={closeModal}
        mode={modalMode}
        distributorId={currentDistributorId}
        refreshDistributors={fetchDistributors} />)}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete Distributor?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this distributor? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </MDButton>
          <MDButton onClick={handleDeleteDistributor} color="secondary" autoFocus>
            Delete
          </MDButton>
        </DialogActions>
      </Dialog>

    </DashboardLayout>
  );
}

export default DistributorList;
