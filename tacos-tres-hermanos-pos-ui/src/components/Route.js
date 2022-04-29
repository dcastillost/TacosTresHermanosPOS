import { useEffect, useState } from "react";

const Route = ({ path, request, children }) => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  useEffect(() => {
    const onLocationChange = () => {
      setCurrentPath(window.location.pathname);
      request(path);
    };
    window.addEventListener('popstate', onLocationChange);
    return () => {
      window.removeEventListener('popstate', onLocationChange);
    }
  }, []);

  return currentPath === path
    ? children
    : null;
};

export default Route;