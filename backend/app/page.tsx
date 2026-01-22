export default function Home() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>CareBow API</h1>
      <p>Welcome to the CareBow Healthcare API.</p>
      <h2>Available Endpoints:</h2>
      <ul>
        <li><strong>POST /api/auth/register</strong> - Register new user</li>
        <li><strong>POST /api/auth/signin</strong> - Login</li>
        <li><strong>GET /api/auth/session</strong> - Get session</li>
        <li><strong>POST /api/auth/signout</strong> - Logout</li>
        <li><strong>POST /api/family/profile</strong> - Create/update family profile</li>
        <li><strong>POST /api/caregiver/profile</strong> - Create/update caregiver profile</li>
        <li><strong>PUT /api/user/update</strong> - Update user info</li>
        <li><strong>GET/POST /api/bookings</strong> - List/create bookings</li>
        <li><strong>PATCH/DELETE /api/bookings/[id]</strong> - Update/delete booking</li>
        <li><strong>GET/POST /api/health-records</strong> - List/upload health records</li>
        <li><strong>GET/POST /api/care-logs</strong> - List/create care logs</li>
        <li><strong>GET /api/caregivers/search</strong> - Search caregivers</li>
        <li><strong>POST /api/transport/request</strong> - Request transport</li>
        <li><strong>GET /api/admin/users</strong> - Get all users (admin)</li>
        <li><strong>GET /api/admin/caregivers</strong> - Get all caregivers (admin)</li>
        <li><strong>POST /api/admin/caregivers/[id]/verify</strong> - Verify caregiver (admin)</li>
      </ul>
    </main>
  );
}
