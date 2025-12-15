'use client';
import { FiPlus, FiLoader, FiFrown, FiEye, FiRefreshCw } from 'react-icons/fi';
import { useEffect, useState, useRef } from 'react';
import Link from "next/link";
import { getAllJob } from '@/services/rideManagementService ';
import { useUserStore } from '@/store/userStore';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { formatPhoneNumber } from "react-phone-input-2";
export default function UserManagementPage() {
  const { users, setUsers, currentPage, setCurrentPage } = useUserStore();
  const [isLoading, setIsLoading] = useState(users.length === 0);
  const [fetchError, setFetchError] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [activeFilter, setActiveFilter] = useState({});
  const [totalPages, setTotalPages] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [inputValue, setInputValue] = useState(""); // Store raw input without +
  const [selectedCountry, setSelectedCountry] = useState("us");
  const [selectedFilter, setSelectedFilter] = useState("");
  const filterMap = {
    complete: { status: "completed" },
    pending: { status: "pending" },
    inprogress: { status: "in_progress" },
    cancel: { status: "cancelled" },
  };

  const timeoutRef = useRef(null);
  const handleFilterChange = (e) => {
    const value = e.target.value;
    setSelectedFilter(value);

    if (value && filterMap[value]) {
      fetchUserList(1, filterMap[value]); // Apply filter
    } else {
      fetchUserList(1, {}); // Reset filter
    }
  };

  const fetchUserList = async (page = currentPage, filter = {}) => {
    try {
      setIsLoading(true);
      setActiveFilter(filter);
      setIsSearching(Object.keys(filter).length > 0);

      console.log("Fetching with:", { page, filter, rowsPerPage });

      const response = await getAllJob(page, rowsPerPage, filter);

      if (response?.data?.status === false) {
        // backend signals failure
        setFetchError(response?.data?.message || "Failed to load user data");
        setUsers([]);
        return;
      }

      console.log("data get from response", response?.data?.data);
      setUsers(response?.data?.data || []);
      setTotalPages(response?.data?.totalPages || 1);
      setFetchError(null); // ✅ clear error if success

      if (Object.keys(filter).length > 0 && page !== 1) {
        setCurrentPage(1);
      }
    } catch (err) {
      console.error("Failed to fetch user list:", err?.response || err);
      setFetchError("Failed to load user data");
      setUsers([]); // clear data to show proper UI
    } finally {
      setIsLoading(false);
    }
  };


  // Debounced search function
  const debouncedSearch = (searchValue) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (searchValue && searchValue.length >= 3) {
        fetchUserList(1, { phone: searchValue });
      } else if (searchValue === "") {
        // If search is cleared, fetch without filter
        fetchUserList(1, {});
        setIsSearching(false);
      }
    }, 800); // Increased debounce time to 800ms
  };

  // Handle phone input changes
  const handlePhoneChange = (value, country) => {
    setInputValue(value);
    setSelectedCountry(country.countryCode);

    // Only search if we have at least 3 digits
    if (value.length >= 3) {
      debouncedSearch(value);
    } else if (value.length === 0) {
      // Clear search if input is empty
      debouncedSearch("");
    }
  };

  // Handle country change separately
  const handleCountryChange = (country) => {
    setSelectedCountry(country.countryCode);

    // If we have input value, search with the new country context
    if (inputValue.length >= 3) {
      debouncedSearch(inputValue);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // 🔁 Call API when page or limit changes
  useEffect(() => {
    fetchUserList(currentPage, activeFilter);
  }, [currentPage, rowsPerPage]);

  // Handle refresh button - clear search and fetch all
  const handleRefresh = () => {
    setInputValue("");
    setIsSearching(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    fetchUserList(1, {});
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-4">
      {/* Add the style tag here */}
      <style jsx>{`
      .react-tel-input input::placeholder {
        color: #6b7280 !important;
        opacity: 1 !important;
      }
    `}</style>
      <div className="bg-white shadow-sm border border-gray-100 rounded-xl ">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Job Management</h2>
            <p className="text-sm text-gray-500 mt-1">
              {isLoading ? "Loading..." : `Showing ${users.length} users${isSearching ? ' (search results)' : ''}`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Phone input */}
            {/* <div className="flex items-center gap-2 border rounded-md px-2 py-1">
              <PhoneInput
                country={selectedCountry}
                value={inputValue}
                onChange={handlePhoneChange}
                onCountryChange={handleCountryChange}
                enableSearch={true}
                inputProps={{
                  autoComplete: 'off',
                  placeholder: "Search by Phone Number"
                }}
                inputStyle={{
                  border: "none",
                  width: "220px",
                  color: "#000",
                  // Add these styles for placeholder visibility
                  "::placeholder": {
                    color: "#0055ffff",
                    opacity: 1
                  }
                }}
                buttonStyle={{
                  border: "none",
                  background: "transparent",
                }}
                disableDropdown={false}
                specialLabel=""
              />
            </div> */}

            {/* Filter Dropdown */}
            <select
              value={selectedFilter}
              onChange={handleFilterChange}
              className="px-3 py-2 border rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
            >
              <option value="">Filter</option>
              <option value="complete">Completed</option>
              <option value="pending">Pending</option>
              <option value="inprogress">In Progress</option>
              <option value="cancel">Cancelled</option>
            </select>

            {/* Limit Dropdown */}
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1); // Reset to page 1 when limit changes
              }}
              className="px-3 py-2 border rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>

          </div>
        </div>

        {/* States */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <FiLoader className="animate-spin h-8 w-8 text-indigo-600" />
          </div>
        ) : fetchError ? (
          <div className="text-center py-12 bg-red-50 rounded-lg">
            <FiFrown className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Unable to load data</h3>
            <p className="text-gray-600 mb-4">{fetchError}</p>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <FiPlus className="mx-auto h-24 w-24 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {isSearching ? "No users found for this search" : "No users found"}
            </h3>
            {isSearching && (
              <button
                onClick={handleRefresh}
                className="text-indigo-600 hover:text-indigo-800 mt-2 text-sm"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm text-center">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-gray-600 font-medium">S.No</th>
                    <th className="px-4 py-3 text-gray-600 font-medium">Date</th>
                    <th className="px-4 py-3 text-gray-600 font-medium">Time</th>
                    <th className="px-4 py-3 text-gray-600 font-medium">Hirer Name</th>
                    <th className="px-4 py-3 text-gray-600 font-medium">Hirer Phone</th>
                    <th className="px-4 py-3 text-gray-600 font-medium">Hirer Email</th>
                    <th className="px-4 py-3 text-gray-600 font-medium">Title</th>
                    <th className="px-4 py-3 text-gray-600 font-medium">Description</th>
                    <th className="px-4 py-3 text-gray-600 font-medium">Address</th>
                    <th className="px-4 py-3 text-gray-600 font-medium">Money Offer</th>
                    <th className="px-4 py-3 text-gray-600 font-medium">Status</th>
                    <th className="px-4 py-3 text-gray-600 font-medium">Assistant Name</th>
                    <th className="px-4 py-3 text-gray-600 font-medium">Assistant Phone</th>
                    <th className="px-4 py-3 text-gray-600 font-medium">Assistant Email</th>
                    <th className="px-4 py-3 text-gray-600 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {users.map((data, index) => (
                    <tr key={data._id}>
                      <td className="px-4 py-3">
                        {(currentPage - 1) * rowsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {data?.createdAt
                          ? new Date(data.createdAt).toISOString().split("T")[0] // YYYY-MM-DD
                          : "N/A"}
                      </td>

                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {data?.createdAt
                          ? new Date(data.createdAt).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                          : "N/A"}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">{`${data?.hirer?.name || "N/A"}`}</td>
                      <td className="px-4 py-3">{`+${data?.hirer?.mobile || "N/A"}`}</td>
                      <td className="px-4 py-3">{`${data?.hirer?.email}`}</td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <div className="flex items-center">
                          <span
                            className={`truncate ${data.showFull ? "whitespace-normal" : "whitespace-nowrap"} overflow-hidden`}
                          >
                            {data?.title || "N/A"}
                          </span>
                          {data?.title && data?.title.length > 20 && ( // only show button if text is long
                            <button
                              onClick={() => {
                                // toggle showFull for this row
                                data.showFull = !data.showFull;
                                setPostJobs([...postJobs]); // re-render
                              }}
                              className="ml-2 text-xs text-indigo-600 hover:underline"
                            >
                              {data.showFull ? "Show Less" : "Show More"}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <div className="flex items-center">
                          <span
                            className={`truncate ${data.showFull ? "whitespace-normal" : "whitespace-nowrap"} overflow-hidden`}
                          >
                            {data?.description || "N/A"}
                          </span>
                          {data?.description && data?.description.length > 20 && ( // only show button if text is long 
                            <button
                              onClick={() => {
                                // toggle showFull for this row
                                data.showFull = !data.showFull;
                                setPostJobs([...postJobs]); // re-render
                              }}
                              className="ml-2 text-xs text-indigo-600 hover:underline"
                            >
                              {data.showFull ? "Show Less" : "Show More"}
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 max-w-[200px]">
                        <div className="flex items-center">
                          <span
                            className={`truncate ${data.showFull ? "whitespace-normal" : "whitespace-nowrap"} overflow-hidden`}
                          >
                            {data?.address || "N/A"}
                          </span>
                          {data?.address && data?.address.length > 20 && ( // only show button if text is long 
                            <button
                              onClick={() => {
                                // toggle showFull for this row
                                data.showFull = !data.showFull;
                                setPostJobs([...postJobs]); // re-render
                              }}
                              className="ml-2 text-xs text-indigo-600 hover:underline"
                            >
                              {data.showFull ? "Show Less" : "Show More"}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">{`${data?.moneyOffered || "N/A"}`}</td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium
                          ${data?.status === "pending" ? "bg-yellow-100 text-yellow-800" : ""}
                          ${data?.status === "in_progress" ? "bg-purple-100 text-purple-800" : ""}
                          ${data?.status === "completed" ? "bg-green-100 text-green-800" : ""}
                          ${data?.status === "cancelled" ? "bg-red-100 text-red-800" : ""}
                            `}
                        >
                          {data?.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">{`${data?.selectedAssistant?.name || "Pending"}`}</td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">{`${data?.selectedAssistant?.mobile || "Pending"}`}</td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">{`${data?.selectedAssistant?.email || "Pending"}`}</td>



                      <td className="px-4 py-3">
                        <Link
                          href={`/job-management/${data._id}`}
                          className="inline-flex justify-center items-center w-full max-w-[120px] mx-auto
                                     px-3 py-2 bg-indigo-100 text-indigo-700 rounded-md 
                                     hover:bg-indigo-200 transition"
                        >
                          <FiEye className="w-4 h-4 mr-1" /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center p-2 gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
                >
                  Prev
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
                >
                  Next
                </button>
              </div>
            )}

            {/* Search info message */}
            {isSearching && (
              <div className="text-center mt-4 text-sm text-gray-500">
                <p>Searching for phone numbers containing: {inputValue}</p>
                <button
                  onClick={handleRefresh}
                  className="text-indigo-600 hover:text-indigo-800 mt-2"
                >
                  Clear search and show all
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}