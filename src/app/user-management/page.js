'use client';
/* eslint-disable react-hooks/exhaustive-deps */

import { FiPlus, FiLoader, FiFrown, FiEye, FiRefreshCw } from 'react-icons/fi';
import { useEffect, useState, useRef } from 'react';
import Link from "next/link";
import { getAlluser } from '@/services/UserManagement';
import { useUserStore } from '@/store/userStore';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { formatPhoneNumber } from "react-phone-input-2";
export default function UserManagementPage() {
  const { users, setUsers, currentPage, setCurrentPage } = useUserStore();
  const [isLoading, setIsLoading] = useState(users.length === 0);
  const [fetchError, setFetchError] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [emailValue, setEmailValue] = useState("");
  const [activeFilter, setActiveFilter] = useState({});
  const [totalPages, setTotalPages] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [inputValue, setInputValue] = useState(""); // Store raw input without +
  const [selectedCountry, setSelectedCountry] = useState("ae");
  const [selectedFilter, setSelectedFilter] = useState("");
  const filterMap = {
    active: { isBlocked: false },
    inactive: { isBlocked: true },
    verified: { isadminVerified: true },
    unverified: { isadminVerified: false },
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

      const response = await getAlluser(page, rowsPerPage, filter);
      console.log("all user Data ", response?.data?.data)
      setUsers(response?.data?.data || []);
      setTotalPages(response?.data?.totalPages || 1);

      // If we're searching and got results, stay on page 1
      if (Object.keys(filter).length > 0 && page !== 1) {
        setCurrentPage(1);
      }
    } catch (err) {
      console.error("Failed to fetch user list:", err);
      setFetchError("Failed to load user data");
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
        fetchUserList(1, { mobile: searchValue });
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
    console.log("value", value,)
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
    console.log("country.countryCode", country.countryCode)
    // If we have input value, search with the new country context
    if (inputValue.length >= 3) {
      debouncedSearch(inputValue);
    }
  };

  // Debounced email search
  const debouncedEmailSearch = (searchValue) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (searchValue && searchValue.length >= 3) {
        fetchUserList(1, { email: searchValue });
      } else if (searchValue === "") {
        fetchUserList(1, {});
        setIsSearching(false);
      }
    }, 800);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmailValue(value);
    if (value.length >= 3) {
      debouncedEmailSearch(value);
    } else if (value.length === 0) {
      debouncedEmailSearch("");
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
    setEmailValue("");
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
            <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
            <p className="text-sm text-gray-500 mt-1">
              {isLoading ? "Loading..." : `Showing ${users.length} users${isSearching ? ' (search results)' : ''}`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Phone input */}
            <div className="flex items-center gap-2 border rounded-md px-2 py-1">
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
            </div>

            {/* Email Input */}
            <input
              type="text"
              value={emailValue}
              onChange={handleEmailChange}
              placeholder="Search by Email"
              className="px-3 py-2 border rounded-md text-sm outline-none focus:ring-1 focus:ring-indigo-500 w-[200px]"
            />

            {/* Filter Dropdown */}
            <select
              value={selectedFilter}
              onChange={handleFilterChange}
              className="px-3 py-2 border rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
            >
              <option value="">Filter</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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
                    <th className="px-4 py-3 text-gray-600 font-medium">Name</th>
                    <th className="px-4 py-3 text-gray-600 font-medium">Email</th>
                    <th className="px-4 py-3 text-gray-600 font-medium">Phone</th>
                    <th className="px-4 py-3 text-gray-600 font-medium">Date Of Birth</th>
                    <th className="px-4 py-3 text-gray-600 font-medium">Status</th>
                    <th className="px-4 py-3 text-gray-600 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {users.map((data, index) => (
                    <tr key={data._id}>
                      <td className="px-4 py-3">
                        {(currentPage - 1) * rowsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-3 font-medium">{data?.name}</td>
                      <td className="px-4 py-3 font-medium">{data?.email}</td>
                      <td className="px-4 py-3">{data?.mobile ?? "Not provided"}</td>
                      <td className="px-4 py-3">{data?.dob ? data.dob.split("T")[0] : "Not provided"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${data?.isBlocked
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                          }`}>
                          {data?.isBlocked ? 'Inactive' : 'Active'}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <Link
                          href={`/user-management/${data._id}`}
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
                <p>
                  Searching for {inputValue ? `phone: ${inputValue}` : emailValue ? `email: ${emailValue}` : "active filter"}
                </p>
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
    </div >
  );
}