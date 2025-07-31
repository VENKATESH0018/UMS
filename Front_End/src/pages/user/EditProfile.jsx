import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

import Card from "../../components/ui/card";
import Input from "../../components/ui/input";
import Label from "../../components/ui/label";
import Button from "../../components/ui/button";

const EditProfile = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.email) {
      axios
        .get("http://localhost:8000/general_user/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((res) => setForm(res.data))
        .catch((err) => {
          console.error("Failed to fetch profile", err);
        });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await axios.put("http://localhost:8000/general_user/profile", form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      alert("Profile updated!");
      navigate("/profile");
    } catch (err) {
      alert("Update failed: " + (err.response?.data?.detail || err.message));
    }
  };

  if (!user) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <Card className="w-full max-w-lg p-6 rounded-xl shadow-lg bg-white">
        <h2 className="text-2xl font-semibold text-center text-blue-600 mb-6">
          Edit Profile
        </h2>
        <form className="space-y-4">
          <div>
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              name="first_name"
              value={form.first_name || ""}
              onChange={handleChange}
              placeholder="Enter your first name"
            />
          </div>
          <div>
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              name="last_name"
              value={form.last_name || ""}
              onChange={handleChange}
              placeholder="Enter your last name"
            />
          </div>
          <div>
            <Label htmlFor="contact">Contact</Label>
            <Input
              id="contact"
              name="contact"
              value={form.contact || ""}
              onChange={handleChange}
              placeholder="Enter contact number"
            />
          </div>
          <div>
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={form.password || ""}
              onChange={handleChange}
              placeholder="Enter new password"
            />
          </div>
          <Button className="w-full mt-4" onClick={handleSave}>
            Save Changes
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default EditProfile;
