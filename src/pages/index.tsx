import LoginPage from "./auth/LoginPage";
import ForgotPasswordPage from "./auth/ForgotPassword";
import Dashboard404 from "./error";

import DashboardWrapper from "./wrapper/DashboardWrapper";
import SurveyLapanganWrapper from "./wrapper/SurverLapanganWrapper";
import RuteWrapper from "./wrapper/RuteWrapper";
import ArmadaWrapper from "./wrapper/ArmadaWrapper";
import PengemudiWrapper from "./wrapper/PengemudiWrapper";

import RuteForm from "./module/rute/Form";
import ArmadaForm from "./module/armada/Form";
import PengemudiForm from "./module/pengemudi/Form";
import ProfileWrapper from "./wrapper/ProfileWrapper";
import DashboardPublicWrapper from "./wrapper/DashboardPublicWrapper";
// import SurveyDinamisForm from "./module/surrveyLapangan/Form/SurveyStatisForm";
// import SurveyStatisForm from "./module/surrveyLapangan/Form/SurveyDinamisForm";
import LinkInformasiWrapper from "./wrapper/LinkInformasiWrapper";
import LinkInformasiForm from "./module/linkInformasi/Form";
import KeluhanPenggunaWrapper from "./wrapper/KeluhanPenggunaWrapper";
import UpdateProfileForm from "./module/profile/Form/UpdateUserForm";
import UpdatePasswordForm from "./module/profile/Form/UpdatePasswordForm";
import SurveyDinamisForm from "./module/surrveyLapangan/Form/SurveyDinamisForm";
import SurveyStatisForm from "./module/surrveyLapangan/Form/SurveyStatisForm";
import HalteWrapper from "./wrapper/HalteWrapper";
import HalteForm from "./module/halte/Form";
import UserManagementWrapper from "./wrapper/ManagementUserWrapper";
import CreateUserForm from "./module/managementUser/form";

export const errorPage = {
  notFound: <Dashboard404 />,
};

export const authPages = {
  loginPage: <LoginPage />,
  forgotPassword: <ForgotPasswordPage />,
};

export const modulePages = {
  dashboardPublic: <DashboardPublicWrapper />,
  dashboard: <DashboardWrapper />,
  userManagement: <UserManagementWrapper />,
  surveyLapangan: <SurveyLapanganWrapper />,
  rute: <RuteWrapper />,
  halte: <HalteWrapper />,
  armada: <ArmadaWrapper />,
  pengemudi: <PengemudiWrapper />,
  linkInformasi: <LinkInformasiWrapper />,
  keluhanPengguna: <KeluhanPenggunaWrapper />,
  profile: <ProfileWrapper />,
};

export const formModule = {
  createSurveyDinamis: <SurveyDinamisForm />,
  createSurveyStatis: <SurveyStatisForm />,
  createUser: <CreateUserForm />,
  createRute: <RuteForm />,
  createHalte: <HalteForm />,
  createArmada: <ArmadaForm />,
  createPengemudi: <PengemudiForm />,
  LinkInformasiForm: <LinkInformasiForm />,
  updateProfileForm: <UpdateProfileForm />,
  updatePasswordForm: <UpdatePasswordForm />,
};
