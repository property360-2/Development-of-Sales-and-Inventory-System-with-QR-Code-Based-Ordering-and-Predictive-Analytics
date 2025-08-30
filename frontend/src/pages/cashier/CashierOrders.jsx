import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

export default function CashierOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/orders?per_page=20&page=${page}`);
      setOrders(res.data.data); // use .data from paginated object
      setCurrentPage(res.data.current_page);
      setLastPage(res.data.last_page);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch orders");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handlePrev = () => {
    if (currentPage > 1) fetchOrders(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < lastPage) fetchOrders(currentPage + 1);
  };

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Orders</h2>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-2 py-1">Order ID</th>
              <th className="border px-2 py-1">Customer ID</th>
              <th className="border px-2 py-1">Handled By</th>
              <th className="border px-2 py-1">Status</th>
              <th className="border px-2 py-1">Total Amount</th>
              <th className="border px-2 py-1">Order Type</th>
              <th className="border px-2 py-1">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.order_id}>
                <td className="border px-2 py-1">{order.order_id}</td>
                <td className="border px-2 py-1">{order.customer_id}</td>
                <td className="border px-2 py-1">{order.handled_by}</td>
                <td className="border px-2 py-1">{order.status}</td>
                <td className="border px-2 py-1">{order.total_amount}</td>
                <td className="border px-2 py-1">{order.order_type}</td>
                <td className="border px-2 py-1">{order.order_timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="px-4 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Page {currentPage} of {lastPage}
        </span>
        <button
          onClick={handleNext}
          disabled={currentPage === lastPage}
          className="px-4 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
