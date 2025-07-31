import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function PermissionGroupManagement() {
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [editingGroup, setEditingGroup] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const axiosInstance = axios.create({
    baseURL: "http://localhost:8000",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/groups");
      setGroups(res.data);
    } catch (err) {
      alert("Failed to fetch groups: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async () => {
    try {
      if (!newGroupName.trim()) {
        alert("Group name cannot be empty.");
        return;
      }

      if (editingGroup) {
        await axiosInstance.put(`/admin/groups/${editingGroup.group_id}`, {
          group_name: newGroupName,
        });
      } else {
        await axiosInstance.post("/admin/groups", {
          group_name: newGroupName,
        });
      }

      resetForm();
      fetchGroups();
    } catch (err) {
      alert("Failed to save group: " + err.message);
    }
  };

  const handleEdit = (group) => {
    setNewGroupName(group.group_name);
    setEditingGroup(group);
  };

  const handleDelete = async (group_id) => {
    if (window.confirm("Are you sure you want to delete this group?")) {
      try {
        await axiosInstance.delete(`/admin/groups/${group_id}`);
        fetchGroups();
      } catch (err) {
        alert("Failed to delete group: " + err.message);
      }
    }
  };

  const resetForm = () => {
    setNewGroupName("");
    setEditingGroup(null);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Permission Group Management</h2>

      {/* Form */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <input
          type="text"
          placeholder="Group Name"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />
        <button
          onClick={handleCreateOrUpdate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {editingGroup ? "Update Group" : "Create Group"}
        </button>
        {editingGroup && (
          <button
            onClick={resetForm}
            className="ml-3 text-sm text-gray-600 underline"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Group List */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-3">Existing Groups</h3>

        {loading ? (
          <p className="text-gray-500">Loading groups...</p>
        ) : (
          <ul className="space-y-2">
            {groups.map((group) => (
              <li
                key={group?.group_id}
                className="flex justify-between items-center border-b pb-2"
              >
                <span>{group?.group_name}</span>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(group)}
                    className="text-blue-600 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(group?.group_id)}
                    className="text-red-600 text-sm"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => navigate(`/user-management/groups/${group?.group_id}`)}
                    className="text-green-600 text-sm"
                  >
                    View
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
