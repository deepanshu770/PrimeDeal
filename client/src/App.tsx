import './App.css'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import Signup from './auth/Signup'
import ForgotPassword from './auth/ForgotPassword'
import ResetPassword from './auth/ResetPassword'
import VerifyEmail from './auth/VerifyEmail'
import HeroSection from './components/HeroSection'
import MainLayout from './Layout/MainLayout'
import Profile from './components/Profile'
import SearchPage from './components/SearchPage'
import ShopDetails from './components/ShopDetails'
import Cart from './components/Cart'
import Store from './admin/Store'
import AddProducts from './admin/AddProducts'
import StoreOrders from './admin/StoreOrders'
import OrderPage from './components/OrderPage'
import { useUserStore } from './zustand/useUserStore'
import { useEffect } from 'react'
import Loading from './components/Loading'
import Login from './auth/login'
import NotFound from './components/NotFound'
import { useThemeStore } from './zustand/useThemeStore'

const ProtectedRoutes = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useUserStore();
  console.log(isAuthenticated,user)
  if (!isAuthenticated) {
    return <Navigate to="/login" replace={true} />
  }
  
  if (user?.admin) {
    return <Navigate to="/admin/store" replace />;
  }
  return children;
};

const AuthenticatedUser = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useUserStore();
  console.log(isAuthenticated,user)
  if (isAuthenticated) {
    return <Navigate to="/profile" replace={true} />
  }
  return children;
};

const AdminRoutes = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useUserStore();
  console.log(isAuthenticated,user)
  if (!isAuthenticated) {
    return <Navigate to="/login" replace={true} />
  }
  if (!user?.admin) {
    return <Navigate to="/" replace={true} />
  }
  return children;
};




const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,  // ✅ Navbar always stays
    children: [
      {
        path: "/profile",
        element: <Profile />, // ✅ Profile inside MainLayout (Navbar stays)
      },
    ],
  },

  // ✅ Normal User Routes
  {
    path: "/",
    element: 
    <ProtectedRoutes>
      <MainLayout />
      </ProtectedRoutes>,
    children: [
      {
        index: true,
        element: <HeroSection />,
      },
      {
        path: "/search/:text",
        element: <SearchPage />,
      },
      {
        path: "/shop/:id",
        element: <ShopDetails />,
      },
      {
        path: "/cart",
        element: <Cart />,
      },
      {
        path: "/order/status",
        element: <OrderPage />,
      },
    ],
  },

  // ✅ Admin Routes
  {
    path: "/admin",
    element: <AdminRoutes><MainLayout /></AdminRoutes>,
    children: [
      {
        path: "/admin/store",
        element: <Store />,
      },
      {
        path: "/admin/products",
        element: <AddProducts />,
      },
      {
        path: "/admin/storeOrders",
        element: <StoreOrders />,
      },
    ],
  },

  // ✅ Authentication Routes
  {
    path: "/login",
    element: <AuthenticatedUser><Login /></AuthenticatedUser>,
  },
  {
    path: "/signup",
    element: <AuthenticatedUser><Signup /></AuthenticatedUser>,
  },
  {
    path: "/forgotpassword",
    element: <AuthenticatedUser><ForgotPassword /></AuthenticatedUser>,
  },
  {
    path: "/resetpassword",
    element: <ResetPassword />,
  },
  {
    path: "/verifyemail",
    element: <VerifyEmail />,
  },

  {
    path: "*",
    element: <NotFound />,
  },
]);
function App() {
  const initializeTheme = useThemeStore((state:any) => state.initializeTheme);
  const { checkAuthentication, isCheckingAuth } = useUserStore();
  useEffect(() => {
    try {
      initializeTheme(); // ✅ Call theme initialization safely
    } catch (error) {
      console.error("Error initializing theme:", error);
    }
    checkAuthentication();

  }, [initializeTheme, checkAuthentication])
  if (isCheckingAuth) return <Loading/>
  return (
    <main>
      <RouterProvider router={appRouter} />
    </main>
  )
}

export default App
