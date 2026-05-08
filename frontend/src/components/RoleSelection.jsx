export default function RoleSelection({ onSelectRole, onLogin }) {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Hospital Management System</h1>
      <p>Select your option</p>

      <div style={{ marginTop: "20px" }}>
        <h2 style={{ fontSize: "18px", marginBottom: "10px" }}>Register</h2>
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
            marginBottom: "20px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Register as Admin
        </button>

        <hr />

        <h2 style={{ fontSize: "18px", margin: "20px 0 10px 0" }}>Already have an account?</h2>
        <button
          onClick={onLogin}
          style={{
            display: "block",
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            fontSize: "16px",
            cursor: "pointer",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Login
        </button>
      </div>
    </div>
  );
}