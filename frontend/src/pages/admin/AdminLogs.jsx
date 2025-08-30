// src/pages/admin/AdminLogs.jsx
import { useEffect, useState } from "react";
import api from "../../utils/api";

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get("/audit-logs")
      .then((res) => setLogs(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Audit Logs</h2>
      <ul>
        {logs.map((log) => (
          <li key={log.id}>
            [{log.timestamp}] {log.action} - {log.user}
          </li>
        ))}
      </ul>
    </div>
  );
}
