import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axiosInstance.get("/users");
        console.log(res.data); // optional, to see full API response
        setUsers(res.data.data); // <- pick the `data` array inside the paginated object
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user.user_id}>
            {user.name} ({user.role})
          </li>
        ))}
      </ul>
    </div>
  );
}
