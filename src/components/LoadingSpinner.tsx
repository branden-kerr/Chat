import React from 'react';
import loadingSvg from '../svgs/loading.svg';

const loadingSpinnerContainer = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
  backgroundColor: "white",
}

const loadingSpinner = {
  width: "50px",
  height: "50px",
}

const LoadingSpinner: React.FC = () => {
  return (
    <div style={loadingSpinnerContainer}>
      <svg style={loadingSpinner} viewBox="0 0 50 50">
        <image href={loadingSvg} />
      </svg>
    </div>
  );
}

export default LoadingSpinner;
