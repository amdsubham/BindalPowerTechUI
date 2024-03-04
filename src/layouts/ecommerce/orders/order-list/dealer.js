import { useState, useEffect } from "react";
import axios from "axios";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import MDBox from "components/MDBox";
import DataTable from "examples/Tables/DataTable";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import IconButton from '@mui/material/IconButton';
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Link } from "react-router-dom";

function DealerList(val) {
  console.log("valval", val)
  const { match } = val
  const [dealers, setDealers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDealers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`https://bindaladmin.fruitnasta.com/api/dealers`);
      setDealers(response.data);
    } catch (error) {
      console.error("Failed to fetch dealers:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  const handleShowAllCustomers = (dealerId) => {
    window.open(`/customers/${dealerId}`, "_blank");
  };
  const dataTableData = {
    columns: [
      { Header: "Name", accessor: "name" },
      { Header: "Email", accessor: "email" },
      { Header: "Contact Number", accessor: "contactNumber" },
      { Header: "Address", accessor: "address" },
      {
        Header: "Show All Customers",
        accessor: "showAllCustomers",
        Cell: ({ row }) => (
          <Link to={`/dashboards/customerlist/${row.original._id}`} >
            <IconButton >
              <OpenInNewIcon />
            </IconButton>
          </Link >
        ),
      },
    ],

    rows: dealers.map((dealer) => ({
      ...dealer,
    })),
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox my={3}>
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
    </DashboardLayout>
  );
}

export default DealerList;
