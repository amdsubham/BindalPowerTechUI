import { useState, useEffect } from "react";
import axios from "axios";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import RefreshIcon from "@mui/icons-material/Refresh";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import MDBox from "components/MDBox"; // Adjust the import path as necessary
import MDButton from "components/MDButton"; // Adjust the import path as necessary
import DashboardLayout from "examples/LayoutContainers/DashboardLayout"; // Adjust the import path as necessary
import DashboardNavbar from "examples/Navbars/DashboardNavbar"; // Adjust the import path as necessary
import Footer from "examples/Footer"; // Adjust the import path as necessary
import DataTable from "examples/Tables/DataTable"; // Adjust the import path as necessary
import SegmentModal from "components/SegmentModal"; // Ensure this modal is adapted for segments, adjust the import path as necessary
import Typography from "@mui/material/Typography";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function SegmentList() {
  const [segments, setSegments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(""); // Modes: 'add', 'edit'
  const [currentSegmentId, setCurrentSegmentId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [descriptionDialogOpen, setDescriptionDialogOpen] = useState(false); // New state for description dialog
  const [description, setDescription] = useState(""); // State to hold segment description

  const fetchSegments = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("https://devbindaladmin.fruitnasta.com/api/segments"); // Adjust API endpoint as necessary
      setSegments(response.data);
    } catch (error) {
      console.error("Failed to fetch segments:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSegments();
  }, []);

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenDeleteDialog = (segment) => {
    setSelectedSegment(segment); // Set selectedSegment here
    setDeleteDialogOpen(true);
    handleCloseMenu();
  };

  const handleOpenDescriptionDialog = (segment) => {
    // setDescription(description); // Set description here
    setSelectedSegment(segment)
    setDescriptionDialogOpen(true);
    handleCloseMenu();
  };

  const handleDeleteSegment = async () => {
    if (selectedSegment && selectedSegment._id) {
      try {
        await axios.delete(`https://devbindaladmin.fruitnasta.com/api/segments/${selectedSegment._id}`);
        fetchSegments(); // Refresh the list after deletion
        setDeleteDialogOpen(false);
      } catch (error) {
        console.error("Error deleting segment:", error);
      }
    } else {
      console.error("Selected segment or its _id property is undefined.");
    }
  };

  const openModal = (mode, segmentId = null) => {
    setModalMode(mode);
    setCurrentSegmentId(segmentId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setCurrentSegmentId(null);
    setSelectedSegment(null);
    setDescription("");
    setModalMode("");
    setModalOpen(false);
    setDescriptionDialogOpen(false);
    fetchSegments(); // Refresh the list after any modal operation
  };

  const dataTableData = {
    columns: [
      { Header: "Name", accessor: "name" },
      {
        Header: "Description", accessor: "description",
        Cell: ({ value, row }) => (
          <div
            onMouseEnter={() => setDescription(value)}
            onMouseLeave={() => setDescription("")}
            style={{ cursor: "pointer", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            onClick={() => handleOpenDescriptionDialog(row.original)}
          >
            {value}
          </div>
        ),
      },
      {
        Header: "Actions",
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
        sticky: "true", // Fix the "Actions" column at the right
      },
    ],
    rows: segments.map((segment) => ({
      ...segment,
    })),
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox my={3}>
        <MDBox display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
          <IconButton onClick={() => fetchSegments()} color="info">
            <RefreshIcon />
          </IconButton>
          <MDButton variant="gradient" color="info" sx={{ height: "fit-content" }} onClick={() => openModal('add')}>
            Add Segment
          </MDButton>
        </MDBox>
        <Card>
          {isLoading ? (
            <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress color="info" />
            </MDBox>
          ) : (
            <DataTable table={dataTableData} entriesPerPage={false} canSearch />
          )}
        </Card>
      </MDBox>
      <Footer />
      <SegmentModal
        open={modalOpen}
        onClose={closeModal}
        mode={modalMode}
        segmentId={currentSegmentId}
        refreshSegments={fetchSegments}
        selectedSegment={selectedSegment}
      />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{selectedSegment && selectedSegment.name}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this segment? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setDeleteDialogOpen(false)}>Cancel</MDButton>
          <MDButton onClick={handleDeleteSegment} color="secondary" autoFocus>
            Delete
          </MDButton>
        </DialogActions>
      </Dialog>

      <Dialog open={descriptionDialogOpen} onClose={() => setDescriptionDialogOpen(false)}>
        <DialogTitle>{selectedSegment && selectedSegment.name}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {description}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setDescriptionDialogOpen(false)}>Close</MDButton>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default SegmentList;
