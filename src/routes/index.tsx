import { createHashRouter, Navigate } from "react-router-dom";
import AuthenticationLayout from "../layouts/AuthenticationLayout";

import { authPages, errorPage, modulePages, formModule } from "../pages";
import ProtectedRoute from "./protectedRoute";

export const router = createHashRouter([
  // ================= DEFAULT / PUBLIC HOME =================
  {
    path: "/",
    children: [
      { index: true, element: <Navigate to="public" replace /> },
      { path: "public", element: modulePages.dashboardPublic },
      { path: "*", element: errorPage.notFound },
    ],
  },

  // ================= AUTHENTICATION =================
  {
    path: "/",
    element: <AuthenticationLayout />,
    children: [
      { path: "login", element: authPages.loginPage },
      { path: "forgot-password", element: authPages.forgotPassword },
      { path: "*", element: errorPage.notFound },
    ],
  },

  // ===================== DASHBOARD =====================
  {
    path: "/dashboard",
    children: [
      // --- Shared Routes (admin & koperasi)
      {
        path: "home",
        element: (
          <ProtectedRoute
            element={modulePages.dashboard}
            allowedRoles={["admin-upt", "koperasi"]}
          />
        ),
      },
      {
        path: "pengemudi",
        element: (
          <ProtectedRoute
            element={modulePages.pengemudi}
            allowedRoles={["admin-upt", "koperasi"]}
          />
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute
            element={modulePages.profile}
            allowedRoles={["admin-upt", "koperasi"]}
          />
        ),
      },
      {
        path: "profile/edit/:userId",
        element: (
          <ProtectedRoute
            element={formModule.updateProfileForm}
            allowedRoles={["admin-upt", "koperasi"]}
          />
        ),
      },
      {
        path: "profile/edit-password",
        element: (
          <ProtectedRoute
            element={formModule.updatePasswordForm}
            allowedRoles={["admin-upt", "koperasi"]}
          />
        ),
      },

      // --- Admin UPT Only
      {
        path: "management-user",
        element: (
          <ProtectedRoute
            element={modulePages.userManagement}
            allowedRoles={["admin-upt"]}
          />
        ),
      },
      {
        path: "management-user/tambah",
        element: (
          <ProtectedRoute
            element={formModule.createUser}
            allowedRoles={["admin-upt"]}
          />
        ),
      },
      {
        path: "management-user/edit/:userId",
        element: (
          <ProtectedRoute
            element={formModule.createUser}
            allowedRoles={["admin-upt"]}
          />
        ),
      },
      {
        path: "survey-lapangan",
        element: (
          <ProtectedRoute
            element={modulePages.surveyLapangan}
            allowedRoles={["admin-upt"]}
          />
        ),
      },
      {
        path: "survey-lapangan/tambah/survey-dinamis",
        element: (
          <ProtectedRoute
            element={formModule.createSurveyDinamis}
            allowedRoles={["admin-upt"]}
          />
        ),
      },
      {
        path: "survey-lapangan/tambah/survey-statis",
        element: (
          <ProtectedRoute
            element={formModule.createSurveyStatis}
            allowedRoles={["admin-upt"]}
          />
        ),
      },
      {
        path: "rute",
        element: (
          <ProtectedRoute
            element={modulePages.rute}
            allowedRoles={["admin-upt"]}
          />
        ),
      },
      {
        path: "rute/tambah",
        element: (
          <ProtectedRoute
            element={formModule.createRute}
            allowedRoles={["admin-upt"]}
          />
        ),
      },
      {
        path: "rute/edit/:routeId",
        element: (
          <ProtectedRoute
            element={formModule.createRute}
            allowedRoles={["admin-upt"]}
          />
        ),
      },
      {
        path: "halte",
        element: (
          <ProtectedRoute
            element={modulePages.halte}
            allowedRoles={["admin-upt"]}
          />
        ),
      },
      {
        path: "halte/tambah",
        element: (
          <ProtectedRoute
            element={formModule.createHalte}
            allowedRoles={["admin-upt"]}
          />
        ),
      },
      {
        path: "halte/edit/:halteId",
        element: (
          <ProtectedRoute
            element={formModule.createHalte}
            allowedRoles={["admin-upt"]}
          />
        ),
      },
      {
        path: "armada",
        element: (
          <ProtectedRoute
            element={modulePages.armada}
            allowedRoles={["admin-upt"]}
          />
        ),
      },
      {
        path: "armada/tambah",
        element: (
          <ProtectedRoute
            element={formModule.createArmada}
            allowedRoles={["admin-upt"]}
          />
        ),
      },
      {
        path: "armada/edit/:id",
        element: (
          <ProtectedRoute
            element={formModule.createArmada}
            allowedRoles={["admin-upt"]}
          />
        ),
      },
      {
        path: "pengemudi/tambah",
        element: (
          <ProtectedRoute
            element={formModule.createPengemudi}
            allowedRoles={["admin-upt", "koperasi"]}
          />
        ),
      },
      {
        path: "pengemudi/edit/:userId",
        element: (
          <ProtectedRoute
            element={formModule.createPengemudi}
            allowedRoles={["admin-upt", "koperasi"]}
          />
        ),
      },
      {
        path: "link",
        element: (
          <ProtectedRoute
            element={modulePages.linkInformasi}
            allowedRoles={["admin-upt"]}
          />
        ),
      },
      {
        path: "link/tambah",
        element: (
          <ProtectedRoute
            element={formModule.LinkInformasiForm}
            allowedRoles={["admin-upt"]}
          />
        ),
      },
      {
        path: "link/edit/:id",
        element: (
          <ProtectedRoute
            element={formModule.LinkInformasiForm}
            allowedRoles={["admin-upt"]}
          />
        ),
      },
      {
        path: "keluhan",
        element: (
          <ProtectedRoute
            element={modulePages.keluhanPengguna}
            allowedRoles={["admin-upt"]}
          />
        ),
      },

      // --- Fallback
      { path: "*", element: errorPage.notFound },
    ],
  },

  // ================= FALLBACK NOT FOUND =================
  { path: "*", element: errorPage.notFound },
]);
