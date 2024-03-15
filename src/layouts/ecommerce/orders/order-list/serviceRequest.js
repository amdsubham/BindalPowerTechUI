import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Box, CircularProgress, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MDBox from 'components/MDBox';
import MDButton from 'components/MDButton';
import DataTable from 'examples/Tables/DataTable';
import ServiceRequestModal from 'components/ServiceRequestModal';
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
import Footer from 'examples/Footer';

const baseURL = 'https://api.bindaladmin.com/api'; // Adjust this as necessary

function ServiceRequestList() {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false); // Added state for edit modal
  const [selectedRequest, setSelectedRequest] = useState(null); // Added state for selected request

  const fetchServiceRequests = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${baseURL}/service-requests`);
      setServiceRequests(response.data.data);
    } catch (error) {
      console.error('Failed to fetch service requests:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchServiceRequests();
  }, []);

  const handleOpenDescriptionDialog = (description, requestId) => {
    setSelectedDescription(description);
    setSelectedRequestId(requestId);
    setModalOpen(true);
  };

  const handleCloseDescriptionDialog = () => {
    setSelectedDescription('');
    setSelectedRequestId(null);
    setModalOpen(false);
  };

  const handleOpenEditModal = (request) => {
    setSelectedRequest(request);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setSelectedRequest(null);
    setEditModalOpen(false);
  };

  const dataTableData = {
    columns: [
      { Header: 'Requested By', accessor: 'requestedBy' },
      {
        Header: 'Description', accessor: 'description',
        Cell: ({ value, row }) => (
          <div
            onClick={() => handleOpenDescriptionDialog(value, row.original._id)}
            style={{ cursor: 'pointer' }}
          >
            {value}
          </div>
        ),
      },
      { Header: 'Service Type', accessor: 'serviceType' },
      { Header: 'Request Type', accessor: 'requestedType' },
      { Header: 'Product Serial Number', accessor: 'productSerialNumber' },
      { Header: 'Status', accessor: 'status' },
      {
        Header: 'Message', accessor: 'message',
        Cell: ({ value, row }) => (
          <div
            onClick={() => handleOpenDescriptionDialog(value, row.original._id)}
            style={{ cursor: 'pointer' }}
          >
            {value}
          </div>
        ),
      },
      {
        Header: 'Actions', accessor: 'actions',
        Cell: ({ row }) => (
          <IconButton onClick={() => handleOpenEditModal(row.original)}>
            <EditIcon />
          </IconButton>
        ),
      },
    ],
    rows: Array.isArray(serviceRequests) ? serviceRequests.map((serviceRequest) => ({
      ...serviceRequest,
    })) : [],
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox my={3}>
        <MDBox display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
          <IconButton onClick={fetchServiceRequests} color="info">
            <RefreshIcon />
          </IconButton>
        </MDBox>

        <DataTable table={dataTableData} entriesPerPage={false} canSearch />

        <Dialog open={modalOpen} onClose={handleCloseDescriptionDialog}>
          <DialogTitle>Description</DialogTitle>
          <DialogContent>
            <DialogContentText>{selectedDescription}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <MDButton onClick={handleCloseDescriptionDialog}>Close</MDButton>
          </DialogActions>
        </Dialog>

        {/* Edit Modal */}
        <ServiceRequestModal
          open={editModalOpen}
          onClose={handleCloseEditModal}
          mode="edit"
          serviceRequestId={selectedRequest ? selectedRequest._id : null}
          refreshServiceRequests={fetchServiceRequests}
        />
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default ServiceRequestList;
