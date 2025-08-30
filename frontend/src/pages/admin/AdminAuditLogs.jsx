// frontend\src\pages\admin\AdminLogs.jsx
import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/audit-logs?page=${page}`);
      setLogs(res.data.data); // only the actual logs
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (loading) return <p>Loading audit logs...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Audit Logs</h1>
      {logs.length === 0 ? (
        <p>No logs found.</p>
      ) : (
        <table className="min-w-full bg-white border rounded shadow">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="px-4 py-2">Log ID</th>
              <th className="px-4 py-2">User</th>
              <th className="px-4 py-2">Action</th>
              <th className="px-4 py-2">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.log_id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{log.log_id}</td>
                <td className="px-4 py-2">
                  {log.user?.name} ({log.user?.role})
                </td>
                <td className="px-4 py-2">{log.action}</td>
                <td className="px-4 py-2">{log.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
