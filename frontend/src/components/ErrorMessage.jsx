import React from "react";

const ErrorMessage = ({ message }) => (
  <div className="d-flex justify-content-center">
  <p className="fw-bold text-danger">{message}</p>
  </div>
);
export default ErrorMessage;
