import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get("http://localhost:8000/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setUsers(res.data))
      .catch((err) => {
        console.error("Failed to fetch users:", err);
        if (err.response?.status === 403 || err.response?.status === 401) {
          alert("Access denied. Admins only.");
          navigate("/home");
        }
      });
  }, []);

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to deactivate this user?")) return;
    try {
      await axios.delete(`http://localhost:8000/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === userId ? { ...u, is_active: false } : u
        )
      );
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to deactivate user.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Users</h2>
        <div className="space-x-3">
          <button
            onClick={() => navigate("/user-management/users/create")}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
          >
            + Add User
          </button>
          <button
            onClick={() => navigate("/user-management/users/roles")}
            className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
          >
            User Roles
          </button>
        </div>
      </div>
      <p className="text-gray-600 mb-4">View and manage all registered users in the system.</p>
      <div className="overflow-x-auto rounded shadow border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">ID</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Email</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Contact</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.user_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{user.user_id}</td>
                  <td className="px-6 py-4 text-sm">
                    {user.first_name} {user.last_name}
                  </td>
                  <td className="px-6 py-4 text-sm">{user.mail}</td>
                  <td className="px-6 py-4 text-sm">{user.contact}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={user.is_active ? "text-green-600" : "text-red-500"}>
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-3">
                    <button
                      onClick={() => navigate(`/user-management/users/edit/${user.user_id}`)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.user_id)}
                      className="text-red-500 hover:underline"
                      disabled={!user.is_active}
                    >
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 