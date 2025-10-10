import CenteredLayout from "./layouts/CenteredLayout";
import { AppRoutes } from "./routes";
import AuthProvider from "./store/AuthProvider";
import ErrorOverlayProvider from "./store/ErrorOverlayProvider";

const App = () => {
  return (
    <ErrorOverlayProvider>
      <AuthProvider>
        <CenteredLayout>
          <AppRoutes />
        </CenteredLayout>
      </AuthProvider>
    </ErrorOverlayProvider>
  );
};

export default App;
