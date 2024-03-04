import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import PropTypes from "prop-types";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Layout containers and components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import FormField from "layouts/pages/users/new-user/components/FormField";

// Define validation schema
const validationSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
});

function NewUser() {
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { adminId } = useParams(); // Use adminId from route params to determine edit mode

  const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
    company: "",
  };

  useEffect(() => {
    if (adminId) {
      setIsLoading(true);
      axios.get(`http://31.220.21.195:3800/api/admins/${adminId}`)
        .then(response => {
          const { name, email, company } = response.data; // Assuming these fields are returned by your API
          // Splitting name into first and last names might require adjustment based on your data structure
          const [firstName, lastName] = name.split(' ');
          setInitialValues(prevValues => ({
            ...prevValues,
            firstName,
            lastName,
            email,
            company,
          }));
        })
        .catch(error => console.error("Failed to fetch admin details:", error))
        .finally(() => setIsLoading(false));
    }
  }, [adminId]);

  const handleSubmit = (values, { setSubmitting }) => {
    const url = adminId ? `http://31.220.21.195:3800/api/admins/${adminId}` : 'http://31.220.21.195:3800/api/admins';
    const method = adminId ? axios.put : axios.post;

    setIsLoading(true);
    method(url, {
      // Adjust payload according to your API requirements
      name: `${values.firstName} ${values.lastName}`,
      email: values.email,
      company: values.company,
      // Include password only if it's a new admin creation
    })
      .then(() => navigate('/admin-list')) // Redirect after successful operation
      .catch(error => console.error("Failed to save admin data:", error))
      .finally(() => {
        setSubmitting(false);
        setIsLoading(false);
      });
  };

  if (isLoading) return <CircularProgress />;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3} mb={20}>
        <Grid container justifyContent="center">
          <Grid item xs={12} lg={8}>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ values, errors, touched, isSubmitting }) => (
                <Form autoComplete="off">
                  <Card>
                    <MDBox p={3}>
                      <MDTypography variant="h5">Admin Details</MDTypography>
                      <MDBox pt={2}>
                        <Grid container spacing={3}>
                          {/* First Name and Last Name Fields */}
                          <Grid item xs={12} sm={6}>
                            <FormField
                              type="text"
                              label="First Name"
                              name="firstName"
                              value={values.firstName}
                              error={errors.firstName && touched.firstName}
                              success={values.firstName.length > 0 && !errors.firstName}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <FormField
                              type="text"
                              label="Last Name"
                              name="lastName"
                              value={values.lastName}
                              error={errors.lastName && touched.lastName}
                              success={values.lastName.length > 0 && !errors.lastName}
                            />
                          </Grid>

                          {/* Email Field */}
                          <Grid item xs={12} sm={6}>
                            <FormField
                              type="email"
                              label="Email"
                              name="email"
                              value={values.email}
                              placeholder="example@mail.com"
                              error={errors.email && touched.email}
                              success={values.email.length > 0 && !errors.email}
                            />
                          </Grid>

                          {/* Company Field (if applicable) */}
                          <Grid item xs={12} sm={6}>
                            <FormField
                              type="text"
                              label="Company"
                              name="company"
                              value={values.company || ''} // Assuming 'company' is an optional field
                              placeholder="Your company name"
                            />
                          </Grid>

                          {/* Password and Repeat Password Fields - omitting these in the edit form for security reasons */}
                          {!adminId && (
                            <>
                              <Grid item xs={12} sm={6}>
                                <FormField
                                  type="password"
                                  label="Password"
                                  name="password"
                                  value={values.password}
                                  placeholder="Password"
                                  error={errors.password && touched.password}
                                  //success={values.password.length > 0 && !errors.password}
                                  inputProps={{ autoComplete: "new-password" }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <FormField
                                  type="password"
                                  label="Repeat Password"
                                  name="repeatPassword"
                                  value={values.repeatPassword}
                                  placeholder="Repeat Password"
                                  error={errors.repeatPassword && touched.repeatPassword}
                                  //success={values.repeatPassword.length > 0 && !errors.repeatPassword}
                                  inputProps={{ autoComplete: "new-password" }}
                                />
                              </Grid>
                            </>
                          )}
                        </Grid>
                        <MDBox mt={3} display="flex" justifyContent="flex-end">
                          <MDButton type="submit" variant="gradient" color="info" disabled={isSubmitting}>
                            {adminId ? "Update Admin" : "Create Admin"}
                          </MDButton>
                        </MDBox>
                      </MDBox>
                    </MDBox>
                  </Card>
                </Form>
              )}
            </Formik>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

NewUser.propTypes = {
  formField: PropTypes.object.isRequired,
};

export default NewUser;
