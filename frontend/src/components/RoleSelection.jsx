import React from 'react'

function RoleSelection() {
  return (
<div style={{ padding: "20px" }}>
      <h1>Hospital Management System</h1>
      <p>Select your role to register</p>

      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => onSelectRole("DOCTOR")}
          style={{
            display: "block",
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Register as Doctor
        </button>

        <button
          onClick={() => onSelectRole("PATIENT")}
          style={{
            display: "block",
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Register as Patient
        </button>

        <button
          onClick={() => onSelectRole("ADMIN")}
          style={{
            display: "block",
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Register as Admin
        </button>
      </div>
    </div>
  )
}

export default RoleSelection