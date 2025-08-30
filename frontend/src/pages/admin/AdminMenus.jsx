import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

export default function AdminMenus() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetchMenus = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/menus?per_page=20&page=${page}`);
      setMenus(res.data.data); // <— use .data inside the paginated object
      setCurrentPage(res.data.current_page);
      setLastPage(res.data.last_page);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch menus");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handlePrev = () => {
    if (currentPage > 1) fetchMenus(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < lastPage) fetchMenus(currentPage + 1);
  };

  if (loading) return <div>Loading menus...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Menu List</h2>
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">Price</th>
            <th className="border px-2 py-1">Category</th>
            <th className="border px-2 py-1">Available</th>
          </tr>
        </thead>
        <tbody>
          {menus.map((menu) => (
            <tr key={menu.menu_id}>
              <td className="border px-2 py-1">{menu.menu_id}</td>
              <td className="border px-2 py-1">{menu.name}</td>
              <td className="border px-2 py-1">{menu.price}</td>
              <td className="border px-2 py-1">{menu.category}</td>
              <td className="border px-2 py-1">
                {menu.availability_status ? "Yes" : "No"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
