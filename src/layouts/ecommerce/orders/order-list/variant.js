import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
  Stack,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import MDBox from "components/MDBox"; // Ensure this path matches your project structure
import MDTypography from "components/MDTypography"; // Ensure this path matches your project structure
import MDButton from "components/MDButton"; // Ensure this path matches your project structure
import DataTable from "examples/Tables/DataTable"; // Ensure this path matches your project structure
import VariantModal from "components/VariantModal"; // Ensure this path matches your project structure and the modal is properly set up
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

const baseURL = 'https://devbindaladmin.fruitnasta.com/api'; // Adjust this as necessary

function VariantList() {
  const [variants, setVariants] = useState([]);
  const [segments, setSegments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("");
  const [currentVariantId, setCurrentVariantId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [descriptionDialogOpen, setDescriptionDialogOpen] = useState(false);
  const [description, setDescription] = useState("");

  const fetchVariants = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${baseURL}/variants`);
      setVariants(response.data);
    } catch (error) {
      console.error("Failed to fetch variants:", error);
    }
    setIsLoading(false);
  };


  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const segmentsResponse = await axios.get(`${baseURL}/segments`);
        setSegments(segmentsResponse.data);

        const variantsResponse = await axios.get(`${baseURL}/variants`);
        setVariants(variantsResponse.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
      setIsLoading(false);
    }

    fetchData();
  }, []);

  const handleOpenMenu = (event, variant) => {
    setAnchorEl(event.currentTarget);
    setSelectedVariant(variant);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenDeleteDialog = (variant) => {
    setSelectedVariant(variant);
    setDeleteDialogOpen(true);
    handleCloseMenu();
  };

  const handleDeleteVariant = async () => {
    if (selectedVariant && selectedVariant._id) {
      setIsLoading(true);
      try {
        await axios.delete(`${baseURL}/variants/${selectedVariant._id}`);
        setDeleteDialogOpen(false);
        const filteredVariants = variants.filter(variant => variant._id !== selectedVariant._id);
        setVariants(filteredVariants);
      } catch (error) {
        console.error("Error deleting variant:", error);
      }
      setIsLoading(false);
    }
  };

  const handleOpenDescriptionDialog = (variant) => {
    setSelectedVariant(variant);
    setDescription(variant.description);
    setDescriptionDialogOpen(true);
    handleCloseMenu();
  };

  const openModal = (mode, variantId = null) => {
    setModalMode(mode);
    setCurrentVariantId(variantId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setCurrentVariantId(null);
    setSelectedVariant(null);
    setModalMode("");
    setModalOpen(false);
    setDescriptionDialogOpen(false);
  };

  const filteredVariants = selectedSegment
    ? variants.filter(variant => variant.segment === selectedSegment)
    : variants;

  const dataTableData = {
    columns: [
      { Header: "Name", accessor: "name" },
      { Header: "Model Number", accessor: "modelNumber" },
      { Header: "Segment", accessor: "segment" },
      { Header: "Price", accessor: "price" },
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
      { Header: "Product List", accessor: "productList" },
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
    ],
    rows: filteredVariants.map(variant => ({
      ...variant,
      segment: segments.find(segment => segment._id === variant.segment)?.name || "Unknown",
      actions: (
        <div>
          <IconButton onClick={(event) => handleOpenMenu(event, variant)}>
            <MoreVertIcon />
          </IconButton>
        </div>
      ),
    })),
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox my={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" mb={2}>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {segments.map(segment => (
              <Chip
                key={segment._id}
                label={segment.name}
                onClick={() => setSelectedSegment(selectedSegment === segment._id ? null : segment._id)}
                color={selectedSegment === segment._id ? "info" : "default"}
                variant="outlined"
                sx={{ margin: "4px" }} // Ensure responsiveness
              />
            ))}
          </Stack>
          <MDBox mt={2}>
            <IconButton onClick={() => { fetchVariants(); setSelectedSegment(null); }} color="info">
              <RefreshIcon />
            </IconButton>
            <MDButton variant="gradient" color="info" sx={{ height: "fit-content" }} onClick={() => openModal('add')}>
              Add Variant
            </MDButton>
          </MDBox>
        </MDBox>
        <Card>
          {isLoading ? (
            <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </MDBox>
          ) : (
            <DataTable table={dataTableData} entriesPerPage={false} canSearch />
          )}
        </Card>
      </MDBox>
      <VariantModal
        open={modalOpen}
        onClose={closeModal}
        mode={modalMode}
        variantId={currentVariantId}
        refreshVariants={() => { fetchVariants(); setSelectedSegment(null); }}
      />
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Variant?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this variant? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setDeleteDialogOpen(false)}>Cancel</MDButton>
          <MDButton onClick={handleDeleteVariant} color="secondary" autoFocus>
            Delete
          </MDButton>
        </DialogActions>
      </Dialog>
      <Dialog
        open={descriptionDialogOpen}
        onClose={() => setDescriptionDialogOpen(false)}
      >
        <DialogTitle>{selectedVariant && selectedVariant.name}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {description}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setDescriptionDialogOpen(false)}>Close</MDButton>
        </DialogActions>
      </Dialog>
      <Footer />
    </DashboardLayout>
  );
}

export default VariantList;
