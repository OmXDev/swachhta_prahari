import { useState } from "react";
import { Check, X, Edit3, Calendar, Users, DollarSign, Calculator } from "lucide-react";
import API_BASE_URL from "../../config";

// Mock data for payout records (AI generated, not stored in DB until approved)
const mockPayoutData = [
  { id: 1, date: "2024-01-15", workerCount: 12, dailyWage: 500, status: "pending" },
  { id: 2, date: "2024-01-14", workerCount: 15, dailyWage: 500, status: "approved" },
  { id: 3, date: "2024-01-13", workerCount: 10, dailyWage: 500, status: "pending" },
  { id: 4, date: "2024-01-12", workerCount: 18, dailyWage: 500, status: "approved" },
  { id: 5, date: "2024-01-11", workerCount: 14, dailyWage: 500, status: "pending" },
  { id: 6, date: "2024-01-10", workerCount: 16, dailyWage: 500, status: "approved" },
];

export default function Payout() {
  const [payoutData, setPayoutData] = useState(mockPayoutData);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  // Approve and save to backend
  const handleSaveEdit = async (id) => {
  const newWage = Number.parseFloat(editValue);

  if (!isNaN(newWage) && newWage > 0) {
    const record = payoutData.find((item) => item.id === id);
    const updated = { ...record, dailyWage: newWage, status: "approved" };

    try {
      const token = localStorage.getItem("accessToken"); //  get JWT

      const res = await fetch(`${API_BASE_URL}/payouts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 🔒 pass token
        },
        body: JSON.stringify(updated),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update payout");

      setPayoutData((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
    } catch (err) {
      console.error("Failed to update payout:", err);
      alert(err.message);
    }
  }

  setEditingId(null);
  setEditValue("");
};


  // Reject payout → update locally & remove from DB
  const handleReject = async (id) => {
    setPayoutData((prev) => prev.map((item) => (item.id === id ? { ...item, status: "rejected" } : item)));

    try {
      await fetch(`${API_BASE_URL}/payouts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });
    } catch (err) {
      console.error("Failed to reject payout:", err);
    }
  };

  const handleEditClick = (id, currentWage) => {
    setEditingId(id);
    setEditValue(currentWage.toString());
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getTotalWage = (workerCount, dailyWage) => workerCount * dailyWage;

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
    }
  };

  // Summary stats
  const totalWorkers = payoutData.reduce((sum, item) => sum + item.workerCount, 0);
  const totalAmount = payoutData.reduce((sum, item) => sum + getTotalWage(item.workerCount, item.dailyWage), 0);
  const approvedPayouts = payoutData.filter((item) => item.status === "approved").length;
  const pendingPayouts = payoutData.filter((item) => item.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payout Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage worker payouts and daily wages</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Workers */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Workers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalWorkers}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{totalAmount.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Approved */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{approvedPayouts}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
              <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingPayouts}</p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Payout Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payout Records</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {["Date", "Worker Count", "Daily Wage", "Total Wage", "Status", "Actions"].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {payoutData.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  {/* Date */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900 dark:text-white">{formatDate(record.date)}</span>
                    </div>
                  </td>

                  {/* Worker Count */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900 dark:text-white">{record.workerCount}</span>
                    </div>
                  </td>

                  {/* Daily Wage */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === record.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          min="0"
                          step="50"
                        />
                        <span className="text-sm text-gray-500 dark:text-gray-400">₹</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900 dark:text-white">₹{record.dailyWage}</span>
                      </div>
                    )}
                  </td>

                  {/* Total Wage */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calculator className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        ₹
                        {getTotalWage(
                          record.workerCount,
                          editingId === record.id ? Number.parseFloat(editValue) || record.dailyWage : record.dailyWage
                        ).toLocaleString()}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}
                    >
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {editingId === record.id ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(record.id)}
                            className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/20 rounded transition-colors"
                            title="Save changes"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            title="Cancel edit"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          {record.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleEditClick(record.id, record.dailyWage)}
                                className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded transition-colors"
                                title="Edit daily wage"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleReject(record.id)}
                                className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                                title="Reject payout"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {record.status === "approved" && (
                            <span className="text-xs text-green-600 dark:text-green-400 font-medium">Approved</span>
                          )}
                          {record.status === "rejected" && (
                            <span className="text-xs text-red-600 dark:text-red-400 font-medium">Rejected</span>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
