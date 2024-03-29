import { useState, useEffect } from "react";
import axios from "axios";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import MDBox from "components/MDBox";
import DataTable from "examples/Tables/DataTable";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { useParams } from "react-router-dom";

function CustomerList({ match }) {
  const { dealerId } = useParams();
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`https://api.bindaladmin.com/api/customers/${dealerId}/dealer`);
      setCustomers(response.data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const dataTableData = {
    columns: [
      { Header: "Name", accessor: "name" },
      { Header: "Email", accessor: "email" },
      { Header: "Contact Number", accessor: "contactNumber" },
      { Header: "Address", accessor: "address" },
      // { Header: "Purchase Date", accessor: "purchaseDate" },
      // { Header: "Warranty End", accessor: "warrantyEnd" },
    ],
    rows: customers.map((customer) => ({
      ...customer,
      purchaseDate: customer.creat ? new Date(customer.purchaseDate).toLocaleDateString() : "N/A",
      warrantyEnd: customer.warrantyEnd ? new Date(customer.warrantyEnd).toLocaleDateString() : "N/A",
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

export default CustomerList;
