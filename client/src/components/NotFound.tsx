import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background dark:bg-gray-800 text-textPrimary text-center p-6">
      <h1 className="text-6xl font-bold text-brandOrange">404</h1>
      <p className="text-xl mt-4">Oops! The page you're looking for doesn't exist.</p>
      <Link 
        to="/" 
        className="mt-6 px-6 py-3 bg-brandGreen text-white text-lg font-semibold rounded-md shadow-md hover:bg-opacity-90 transition  focus:outline-none focus:ring-0 active:text-white hover:text-white"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
