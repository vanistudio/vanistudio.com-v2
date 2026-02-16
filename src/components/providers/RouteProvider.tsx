import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useProgress } from '@bprogress/react';

const RouterProgressHandler = () => {
  const location = useLocation();
  const { start, stop } = useProgress();

  useEffect(() => {
    start();

    const timer = setTimeout(() => {
      stop();
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname]);
  return null;
};
export default RouterProgressHandler;