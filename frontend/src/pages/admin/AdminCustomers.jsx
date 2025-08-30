// frontend\src\pages\admin\AdminCustomers.jsx
import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/customers");
      // access the actual array inside "data"
      setCustomers(res.data.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  if (loading) return <p>Loading customers...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Customers</h1>
      {customers.length === 0 ? (
        <p>No customers found.</p>
      ) : (
        <table className="min-w-full bg-white border rounded shadow">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Table</th>
              <th className="px-4 py-2 text-left">Order Ref</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr
                key={customer.customer_id}
                className="border-b hover:bg-gray-50"
              >
                <td className="px-4 py-2">{customer.customer_id}</td>
                <td className="px-4 py-2">{customer.customer_name}</td>
                <td className="px-4 py-2">{customer.table_number}</td>
                <td className="px-4 py-2">{customer.order_reference}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
