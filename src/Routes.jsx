import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";

// Page imports
import LoginRegister from "pages/login-register";
import DashboardHome from "pages/dashboard-home";
import CreateLot from "pages/create-lot";
import BrowseLots from "pages/browse-lots";
import LotDetailsOffers from "pages/lot-details-offers";
import UserProfile from "pages/user-profile";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/login-register" element={<LoginRegister />} />
          <Route path="/dashboard-home" element={<DashboardHome />} />
          <Route path="/create-lot" element={<CreateLot />} />
          <Route path="/browse-lots" element={<BrowseLots />} />
          <Route path="/lot-details-offers" element={<LotDetailsOffers />} />
          <Route path="/user-profile" element={<UserProfile />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;