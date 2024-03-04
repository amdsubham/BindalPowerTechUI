/**
=========================================================
* Material Dashboard 2 PRO React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-pro-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

/** 
  All of the routes for the Material Dashboard 2 PRO React are added here,
  You can add a new route, customize the routes and delete the routes here.

  Once you add a new route on this file it will be visible automatically on
  the Sidenav.

  For adding a new route you can follow the existing routes in the routes array.
  1. The `type` key with the `collapse` value is used for a route.
  2. The `type` key with the `title` value is used for a title inside the Sidenav. 
  3. The `type` key with the `divider` value is used for a divider between Sidenav items.
  4. The `name` key is used for the name of the route on the Sidenav.
  5. The `key` key is used for the key of the route (It will help you with the key prop inside a loop).
  6. The `icon` key is used for the icon of the route on the Sidenav, you have to add a node.
  7. The `collapse` key is used for making a collapsible item on the Sidenav that contains other routes
  inside (nested routes), you need to pass the nested routes inside an array as a value for the `collapse` key.
  8. The `route` key is used to store the route location which is used for the react router.
  9. The `href` key is used to store the external links location.
  10. The `title` key is only for the item with the type of `title` and its used for the title text on the Sidenav.
  10. The `component` key is used to store the component of its route.
*/

// Material Dashboard 2 PRO React layouts
import Analytics from "layouts/dashboards/analytics";
import Sales from "layouts/dashboards/sales";
import ProfileOverview from "layouts/pages/profile/profile-overview";
import AllProjects from "layouts/pages/profile/all-projects";
import NewUser from "layouts/pages/users/new-user";
import Settings from "layouts/pages/account/settings";
import Billing from "layouts/pages/account/billing";
import Invoice from "layouts/pages/account/invoice";
import Timeline from "layouts/pages/projects/timeline";
import PricingPage from "layouts/pages/pricing-page";
import Widgets from "layouts/pages/widgets";
import RTL from "layouts/pages/rtl";
import Charts from "layouts/pages/charts";
import Notifications from "layouts/pages/notifications";
import Kanban from "layouts/applications/kanban";
import Wizard from "layouts/applications/wizard";
import DataTables from "layouts/applications/data-tables";
import Calendar from "layouts/applications/calendar";
import NewProduct from "layouts/ecommerce/products/new-product";
import EditProduct from "layouts/ecommerce/products/edit-product";
import ProductPage from "layouts/ecommerce/products/product-page";
import UserList from "layouts/ecommerce/orders/order-list";
import DistributorList from "layouts/ecommerce/orders/order-list/distributor";
import SegmentList from "layouts/ecommerce/orders/order-list/segment";
import VariantList from "layouts/ecommerce/orders/order-list/variant";
import ProductList from "layouts/ecommerce/orders/order-list/product";
import DealerList from "layouts/ecommerce/orders/order-list/dealer";
import CustomerList from "layouts/ecommerce/orders/order-list/customer";
import ServiceRequestList from "layouts/ecommerce/orders/order-list/serviceRequest";
import OrderList from "layouts/ecommerce/orders/order-list/order";
import AddProduct from "components/ProductModal/AddProduct";
import OrderDetails from "layouts/ecommerce/orders/order-details";
import SignInBasic from "layouts/authentication/sign-in/basic";
import SignInCover from "layouts/authentication/sign-in/cover";
import SignInIllustration from "layouts/authentication/sign-in/illustration";
import SignUpCover from "layouts/authentication/sign-up/cover";
import ResetCover from "layouts/authentication/reset-password/cover";

// Material Dashboard 2 PRO React components
import MDAvatar from "components/MDAvatar";

// @mui icons
import Icon from "@mui/material/Icon";

const routes = [
  {
    type: "collapse",
    name: "Admin",
    key: "brooklyn-alice",
    icon: <MDAvatar alt="Admin" size="sm" />,
    collapse: [
      // {
      //   name: "My Profile",
      //   key: "my-profile",
      //   route: "/pages/profile/profile-overview",
      //   component: <ProfileOverview />,
      // },
      // {
      //   name: "Settings",
      //   key: "profile-settings",
      //   route: "/pages/account/settings",
      //   component: <Settings />,
      // },
      {
        name: "Logout",
        key: "logout",
        route: "/authentication/sign-in/basic",
        component: <SignInIllustration />,
      },
    ],
  },
  { type: "divider", key: "divider-0" },

  {
    type: "collapse",
    name: "Product Management",
    key: "productmanagement",
    icon: <Icon fontSize="medium">dashboard</Icon>,
    collapse: [
      {
        name: "Add Products",
        key: "addproducts",
        route: "/dashboards/addproducts",
        component: <AddProduct
        //open={true}
        // onClose, 
        //product, 
        // refreshProducts
        />,
      },
      {
        name: "Manage Products",
        key: "manageproducts",
        route: "/dashboards/manageproducts",
        component: <ProductList />,
      },
      {
        name: "Manage Variant",
        key: "managevariant",
        route: "/dashboards/managevariant",
        component: <VariantList />,
      },
      {
        name: "Manage Segment",
        key: "managesegment",
        route: "/dashboards/managesegment",
        component: <SegmentList />,
      },

    ],
  },

  {
    type: "collapse",
    name: "Distributor Management",
    key: "distributormanagement",
    icon: <Icon fontSize="medium">local_shipping</Icon>,
    collapse: [
      {
        name: "Manage Distributor",
        key: "managedistributor",
        route: "/dashboards/managedistributor",
        component: <DistributorList />,
      },
      {
        name: "Order List",
        key: "orderlist",
        route: "/dashboards/orderlist",
        component: <OrderList />,
      },
      {
        name: "Customer List",
        key: "customerlist",
        route: "/dashboards/customerlist/:dealerId",
        component: <CustomerList />, // Make sure to pass any necessary props
      },
      {
        name: "Dealer List",
        key: "dealerlist",
        route: "/dashboards/dealerlist/:distributorId",
        component: <DealerList />, // Make sure to pass any necessary props
      },
    ],
  },
  {
    type: "collapse",
    name: "User Management",
    key: "usermanagement",
    route: "/pages/users/user-management",
    component: <UserList />,

    icon: <Icon fontSize="medium">people</Icon>,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Service Management",
    key: "servicemanagement",
    route: "/pages/users/service-request-management",
    component: <ServiceRequestList />,
    icon: <Icon fontSize="medium">engineering</Icon>,
    noCollapse: true,
  },
  {
    //type: "collapse",
    name: "Dealer Management",
    key: "servicemanagement",
    route: "/pages/users/dealers/:distributorId",
    component: <DealerList />,
    // icon: <Icon fontSize="medium">engineering</Icon>,
    // noCollapse: true,
  },
];

export default routes;
