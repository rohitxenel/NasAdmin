'use client';
import { useParams, useRouter } from 'next/navigation';
import { FiMaximize } from "react-icons/fi";
import { getdriverById, getPostJobData, changeStatus, getApplyJobData } from '@/services/UserManagement';
import { IMAGE_URL } from '@/lib/apiConfig'
import { useUserStore } from '@/store/userStore';
import { useEffect, useState, useRef, useMemo } from 'react';

import {
    FiArrowLeft,
    FiPhone,
    FiMail,
    FiDollarSign,
    FiUser,
    FiCalendar,
    FiGlobe,
    FiCheckCircle,
    FiXCircle,
    FiTruck,
    FiCreditCard as FiCard,
    FiDollarSign as FiCash,
    FiAlertCircle,
    FiTrendingUp,
    FiUserX,
    FiTrash2,
    FiAward,
    FiFileText,
    FiEdit,
    FiStar
} from 'react-icons/fi';
import Snackbar from '@/components/layout/Snackbar';
import Image from 'next/image';
import { FaBuilding, FaCar, FaRegFileAlt } from "react-icons/fa";

/* ===== Helpers for Recent Reviews ===== */

const timeAgo = (iso) => {
    if (!iso) return '';
    try {
        const d = new Date(iso);
        const diffMs = Date.now() - d.getTime();
        const mins = Math.floor(diffMs / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        if (days < 30) return `${days}d ago`;
        const months = Math.floor(days / 30);
        if (months < 12) return `${months}mo ago`;
        const years = Math.floor(months / 12);
        return `${years}y ago`;
    } catch {
        return '';
    }
};




/* ===== Page Component ===== */

export default function DriverProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [driver, setDriver] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');
    const [snackbar, setSnackbar] = useState({
        visible: false,
        message: '',
        type: 'success'
    });
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [actionType, setActionType] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [showUnverifyForm, setShowUnverifyForm] = useState(false);
    const [unverifyReason, setUnverifyReason] = useState('');
    const [selectedReasons, setSelectedReasons] = useState([]);
    const [trips, setTrips] = useState([]);
    const { users, setUsers, currentPage, setCurrentPage } = useUserStore();
    const [isLoading, setIsLoading] = useState(users.length === 0);
    const [fetchError, setFetchError] = useState(null);
    const [rowsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [isSearching, setIsSearching] = useState(false);
    const [driverState, setDriverState] = useState();
    const {
        postJobs,
        setPostJobs,
        postJobPage,
        setPostJobPage,
        postJobTotalPages,
        setPostJobTotalPages,
    } = useUserStore();





    const filterMap = {
        active: { isBlocked: false },
        inactive: { isBlocked: true },
    };




    // ✅ fetch driver details only once
    const fetchUser = async () => {
        try {
            setLoading(true);
            const resDriver = await getdriverById(id);

            if (resDriver?.statusCode === 200 && resDriver?.status) {
                setDriver(resDriver.data);
            } else {
                throw new Error(resDriver?.message || 'Failed to fetch driver data');
            }
        } catch (err) {
            showSnackbar(err.message || 'Failed to load driver data', 'error');
        } finally {
            setLoading(false);
        }
    };
    // ✅ fetch post jobs
    const fetchPostJobs = async (page = 1) => {
        try {
            const res = await getPostJobData(id, page);
            if (res?.statusCode === 200 && res?.status) {
                setPostJobs(res.data.data || []);
                console.log("totalpages", res.data.totalPages)
                setPostJobTotalPages(res.data.totalPages || 1);
            }
        } catch (error) {
            showSnackbar("Error fetching post jobs", "error");
        }
    };

    const fetchApplyJobs = async (page = 1) => {
        try {
            const res = await getApplyJobData(id, page);
            if (res?.statusCode === 200 && res?.status) {
                setUsers(res.data.data || []);//setUsers
                console.log("totalpages", res.data.totalPages)
                setCurrentPage(res.data.totalPages || 1);
            }
        } catch (error) {
            showSnackbar("Error fetching post jobs", "error");
        }
    };

    useEffect(() => {
        if (id) {
            fetchUser();
        }
    }, [id]);

    // ✅ call post jobs when tab changes
    useEffect(() => {
        if (activeTab === "postjob") {
            fetchPostJobs(postJobPage);
        }
    }, [activeTab, postJobPage]);

    useEffect(() => {
        if (activeTab === "applyjob") {
            fetchApplyJobs(currentPage);
        }
    }, [activeTab, currentPage]);


    // ✅ fetch driver once when id changes
    useEffect(() => {
        if (id) {
            fetchUser();
        } else {
            showSnackbar('Driver ID is required', 'error');
            setLoading(false);
        }
    }, [id]);

    // ✅ Dropdown click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isDropdownOpen && !event.target.closest('.relative')) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);




    const showSnackbar = (message, type = 'success') => {
        setSnackbar({ visible: true, message, type });
    };

    const hideSnackbar = () => {
        setSnackbar({ ...snackbar, visible: false });
    };

    const handleActionClick = (action) => {
        setActionType(action);

        if (action === 'block' || action === 'unblock') {
            setShowConfirmation(true);
        }

        setIsDropdownOpen(false);
    };

    const handleConfirmAction = async () => {
        try {
            setIsUpdating(true);

            // Determine the status based on actionType
            const isActive = actionType === 'unblock'; // true for Active, false for Inactive

            // Call API to update status
            const statusResponse = await changeStatus(id, isActive);

            if (statusResponse.statusCode === 200 && statusResponse.status === true) {
                // Update local state
                setDriver(prev => ({
                    ...prev,
                    isBlocked: !isActive // isBlocked should be opposite of isActive
                }));

                showSnackbar(
                    `User ${isActive ? 'activated' : 'deactivated'} successfully`,
                    'success'
                );
            } else {
                throw new Error(statusResponse?.message || 'Failed to update status');
            }

        } catch (error) {
            showSnackbar(error.message || 'Failed to update driver status', 'error');
        } finally {
            setIsUpdating(false);
            setShowConfirmation(false);
        }
    };
    const getStatusColor = () => {
        if (driver.isDeleted) return 'text-red-600 bg-red-100';
        if (driver.isBlocked) return 'text-yellow-600 bg-yellow-100';
        return 'text-green-600 bg-green-100';
    };

    const getStatusText = () => {
        if (driver.isDeleted) return 'Deleted';
        if (driver.isBlocked) return 'Inactive';
        return 'Active';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not available';

        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid date';
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Completed':
                return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Completed</span>;
            case 'Cancelled':
                return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Cancelled</span>;
            case 'Accepted':
                return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Accepted</span>;
            case 'Pending':
                return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pending</span>;
            default:
                return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{status}</span>;
        }
    };

    const getVerificationStatus = (isVerified) => {
        return isVerified ? (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                <FiCheckCircle className="mr-1" /> Verified
            </span>
        ) : (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center">
                <FiXCircle className="mr-1" /> Pending
            </span>
        );
    };

    const getSafeValue = (value, fallback = 'Not provided') => {
        return value !== null && value !== undefined ? value : fallback;
    };

    const calculateTripStats = () => {
        const completedTrips = trips.filter(trip => trip.status === 'Completed').length;
        const cancelledTrips = trips.filter(trip => trip.status === 'Cancelled').length;
        const totalEarnings = trips
            .filter(trip => trip.status === 'Completed' && trip.fareDetails?.totalFare)
            .reduce((sum, trip) => sum + trip.fareDetails.totalFare, 0);

        return {
            total: trips.length,
            completed: completedTrips,
            cancelled: cancelledTrips,
            totalEarnings: totalEarnings
        };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!driver) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="mx-auto h-16 w-16 text-red-400 mb-4">
                        <FiXCircle className="w-full h-full" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">User Not Found</h2>
                    <p className="text-gray-600 mb-6">The User you're looking for doesn't exist or couldn't be loaded.</p>
                    <button
                        onClick={() => router.back()}
                        className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const tripStats = calculateTripStats();

    return (
        <div className="min-h-screen bg-gray-50 p-3">
            <div className="mx-auto">
                {/* Header with Back Button */}
                <div className="flex items-center mb-2">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-gray-600 hover:text-gray-800 font-medium transition-colors mr-4"
                    >
                        <FiArrowLeft className="" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">User Profile</h1>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`py-4 px-6 text-center font-medium text-sm border-b-2 transition-colors ${activeTab === 'profile' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                Profile Details
                            </button>

                            <button
                                onClick={() => setActiveTab('postjob')}
                                className={`py-4 px-6 text-center font-medium text-sm border-b-2 transition-colors ${activeTab === 'postjob' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                Post Job History
                            </button>
                            <button
                                onClick={() => setActiveTab('applyjob')}
                                className={`py-4 px-6 text-center font-medium text-sm border-b-2 transition-colors ${activeTab === 'applyjob' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                Apply Job History
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        {activeTab === 'profile' ? (
                            <>
                                {/* Personal Information Card */}
                                <div className="flex flex-col md:flex-row items-start gap-6 mb-6 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                                    <div className="relative">
                                        {driver.profilePhoto ? (
                                            <img
                                                src={`${driver.profilePhoto}`}
                                                alt={driver.name || "Profile"}
                                                className="w-40 h-40 rounded-lg object-cover border-2 border-white shadow-lg"
                                            />
                                        ) : (
                                            <div className="w-24 h-24 bg-indigo-200 rounded-lg flex items-center justify-center text-indigo-600 text-3xl font-bold border-2 border-white shadow-lg">
                                                {driver.name ? driver.name.charAt(0).toUpperCase() : "D"}
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Side (Info + Button) */}
                                    <div className="flex-1 w-full">
                                        <div className="flex justify-between items-start gap-4">
                                            {/* Profile Details */}
                                            <div className="space-y-2"> {/* ✅ Adds consistent vertical gap */}
                                                {/* Name */}
                                                <h1 className="text-2xl font-bold text-gray-900">
                                                    {`Name - ${getSafeValue(driver.name)}`}
                                                </h1>

                                                {/* DOB */}
                                                <p className="flex items-center text-1xl text-gray-600">
                                                    <FiCalendar className="mr-2 text-1xl text-indigo-600" />
                                                    {`Date of Birth - ${driver.dob
                                                        ? new Date(driver.dob).toLocaleDateString("en-US", {
                                                            year: "numeric",
                                                            month: "short",
                                                            day: "numeric",
                                                        })
                                                        : "Date of Birth not provided"}`}
                                                </p>

                                                {/* Address */}
                                                <p className="flex items-center text-1xl text-gray-600">
                                                    <FiGlobe className="mr-2 text-1xl text-indigo-600" />
                                                    {`Address - ${getSafeValue(driver.address, "Address not provided")}`}
                                                </p>

                                                <p className="flex items-center text-1xl text-gray-600">
                                                    <FiCalendar className="mr-2 text-1xl text-indigo-600" />
                                                    {`Account Created - ${getSafeValue(driver.createdAt.split("T")[0], "Address not provided")}`}
                                                </p>
                                            </div>

                                            {/* Manage Button (top right) */}
                                            <div className="relative">
                                                <button
                                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                                    className="flex items-center px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm shadow-md"
                                                >
                                                    <FiEdit className="mr-2 h-4 w-4" />
                                                    Manage
                                                </button>

                                                {isDropdownOpen && (
                                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                                        <div className="p-2">
                                                            <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                                Account Status
                                                            </div>

                                                            {/* Active Option */}
                                                            <button
                                                                onClick={() => handleActionClick('unblock')}
                                                                className="flex items-center w-full px-3 py-2 text-sm text-green-700 hover:bg-green-50 rounded-md transition-colors"
                                                            >
                                                                <FiCheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                                                Active
                                                            </button>

                                                            {/* Inactive Option */}
                                                            <button
                                                                onClick={() => handleActionClick('block')}
                                                                className="flex items-center w-full px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded-md transition-colors"
                                                            >
                                                                <FiXCircle className="mr-2 h-4 w-4 text-red-600" />
                                                                Inactive
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>



                                {/* Detailed Information Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-t border-gray-100 pt-6">
                                    {/* Contact Information Card */}
                                    <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-semibold text-gray-800 flex items-center">
                                                <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                                                    <FiPhone className="text-indigo-600" />
                                                </div>
                                                Contact Information
                                            </h4>
                                        </div>

                                        <div className="space-y-4">
                                            {/* Phone Number */}
                                            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone Number</span>
                                                    {getVerificationStatus(true)}
                                                </div>
                                                <div className="flex items-center">
                                                    <div className="p-2 bg-blue-100 rounded-full mr-3">
                                                        <FiPhone className="text-blue-600 h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 text-lg">{getSafeValue(driver.mobile)}</p>
                                                        <p className="text-xs text-gray-500 mt-1">Primary contact number</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Email Address */}
                                            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email Address</span>
                                                    {getVerificationStatus(driver.isEmailVerified)}
                                                </div>
                                                <div className="flex items-center">
                                                    <div className="p-2 bg-purple-100 rounded-full mr-3">
                                                        <FiMail className="text-purple-600 h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 text-lg">{getSafeValue(driver.email)}</p>
                                                        <p className="text-xs text-gray-500 mt-1">Primary email address</p>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2 mt-3 pt-3 border-t border-gray-100">
                                                    {/* <button className="text-xs bg-purple-50 text-purple-600 px-3 py-1 rounded-full hover:bg-purple-100 transition">
                                                        Send Email
                                                    </button> */}
                                                    <button className="text-xs bg-gray-50 text-gray-600 px-3 py-1 rounded-full hover:bg-gray-100 transition">
                                                        Copy
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Account Information Card */}
                                    <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                                        <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
                                            <FiFileText className="mr-2 text-indigo-600" /> ID Document
                                        </h3>

                                        {driver.idPhoto ? (
                                            <>
                                                {/* License Preview */}
                                                <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden mb-4">
                                                    <img
                                                        src={`${driver.idPhoto}`}
                                                        alt="ID Document"
                                                        className="max-h-[90vh] max-w-[90vw] object-contain"
                                                    />

                                                </div>

                                                {/* Status & View Button */}
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-sm text-gray-500 mb-1">ID Document Upload</p>
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-xs font-medium ${driver.idPhoto
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-red-100 text-red-700"
                                                                }`}
                                                        >
                                                            {driver.idPhoto ? "Uploaded" : "Not Uploaded"}
                                                        </span>
                                                    </div>

                                                    {driver.idPhoto && (
                                                        <button
                                                            onClick={() => setIsOpen(true)}
                                                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
                                                        >
                                                            <FiMaximize className="w-4 h-4" />
                                                            View Full Size
                                                        </button>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                                                <FiAlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                                <p className="text-gray-500">No ID Document uploaded</p>
                                            </div>
                                        )}

                                        {/* Modal for Full Image */}
                                        {isOpen && (
                                            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setIsOpen(false)}
                                                        className="absolute top-2 right-2 text-white text-2xl"
                                                    >
                                                        ✕
                                                    </button>
                                                    <img
                                                        src={`${driver.idPhoto}`}
                                                        alt="ID Document"
                                                        className="max-h-[90vh] max-w-[90vw] object-contain"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                </div>

                                {/* Driver Stats Overview */}
                                <div className="border-t border-gray-100 pt-6 mt-6">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
                                        <FiTruck className="mr-2 text-indigo-600" /> Jobs Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                                        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                                            <div className="flex items-center">
                                                <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                                                    <FiTrendingUp className="text-indigo-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-indigo-700">Total Job Post</p>
                                                    <p className="text-xl font-bold text-indigo-900">{driverState?.totalTrips || 0}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                            <div className="flex items-center">
                                                <div className="p-2 bg-green-100 rounded-lg mr-3">
                                                    <FiCheckCircle className="text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-green-700">Post Job Completed</p>
                                                    <p className="text-xl font-bold text-green-900">{driverState?.completedTrips || 0}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                                            <div className="flex items-center">
                                                <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                                                    <FiTrendingUp className="text-indigo-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-indigo-700">Total Apply Job</p>
                                                    <p className="text-xl font-bold text-indigo-900">{driverState?.totalTrips || 0}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                            <div className="flex items-center">
                                                <div className="p-2 bg-green-100 rounded-lg mr-3">
                                                    <FiCheckCircle className="text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-green-700">Apply Job Completed</p>
                                                    <p className="text-xl font-bold text-green-900">{driverState?.completedTrips || 0}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : activeTab === 'postjob' ? (
                            /* Trip History Content */
                            <div className='mt-4'>
                                {/* Table */}
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 text-sm text-center">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-gray-600 font-medium">S.No.</th>
                                                <th className="px-4 py-3 text-gray-600 font-medium">Date</th>
                                                <th className="px-4 py-3 text-gray-600 font-medium">Time</th>
                                                <th className="px-4 py-3 text-gray-600 font-medium">Title</th>
                                                <th className="px-4 py-3 text-gray-600 font-medium">Description</th>
                                                <th className="px-4 py-3 text-gray-600 font-medium">Address</th>
                                                <th className="px-4 py-3 text-gray-600 font-medium">Status</th>
                                                <th className="px-4 py-3 text-gray-600 font-medium">Money Offer</th>
                                                <th className="px-4 py-3 text-gray-600 font-medium">Assistent Name</th>
                                                <th className="px-4 py-3 text-gray-600 font-medium">Assistent phone</th>
                                                <th className="px-4 py-3 text-gray-600 font-medium">Assistent Email</th>

                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-gray-700">
                                            {postJobs.length > 0 ? (
                                                postJobs.map((trip, index) => (

                                                    <tr key={trip._id}>
                                                        <td className="px-4 py-3">
                                                            {isSearching
                                                                ? index + 1
                                                                : (currentPage - 1) * rowsPerPage + index + 1
                                                            }
                                                        </td>
                                                        <td className="px-4 py-3 text-center whitespace-nowrap">
                                                            {trip?.createdAt
                                                                ? new Date(trip.createdAt).toISOString().split("T")[0] // YYYY-MM-DD
                                                                : "N/A"}
                                                        </td>

                                                        <td className="px-4 py-3 text-center whitespace-nowrap">
                                                            {trip?.createdAt
                                                                ? new Date(trip.createdAt).toLocaleTimeString("en-US", {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                    hour12: true,
                                                                })
                                                                : "N/A"}
                                                        </td>



                                                        <td className="px-4 py-3 max-w-[200px]">
                                                            <div className="flex items-center">
                                                                <span
                                                                    className={`truncate ${trip.showFull ? "whitespace-normal" : "whitespace-nowrap"} overflow-hidden`}
                                                                >
                                                                    {trip?.title || "N/A"}
                                                                </span>
                                                                {trip?.title && trip.title.length > 20 && ( // only show button if text is long
                                                                    <button
                                                                        onClick={() => {
                                                                            // toggle showFull for this row
                                                                            trip.showFull = !trip.showFull;
                                                                            setPostJobs([...postJobs]); // re-render
                                                                        }}
                                                                        className="ml-2 text-xs text-indigo-600 hover:underline"
                                                                    >
                                                                        {trip.showFull ? "Show Less" : "Show More"}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 max-w-[200px]">
                                                            <div className="flex items-center">
                                                                <span
                                                                    className={`truncate ${trip.showFull ? "whitespace-normal" : "whitespace-nowrap"} overflow-hidden`}
                                                                >
                                                                    {trip?.description || "N/A"}
                                                                </span>
                                                                {trip?.description && trip.description.length > 20 && ( // only show button if text is long 
                                                                    <button
                                                                        onClick={() => {
                                                                            // toggle showFull for this row
                                                                            trip.showFull = !trip.showFull;
                                                                            setPostJobs([...postJobs]); // re-render
                                                                        }}
                                                                        className="ml-2 text-xs text-indigo-600 hover:underline"
                                                                    >
                                                                        {trip.showFull ? "Show Less" : "Show More"}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>

                                                        <td className="px-4 py-3 max-w-[200px]">
                                                            <div className="flex items-center">
                                                                <span
                                                                    className={`truncate ${trip.showFull ? "whitespace-normal" : "whitespace-nowrap"} overflow-hidden`}
                                                                >
                                                                    {trip?.address || "N/A"}
                                                                </span>
                                                                {trip?.address && trip.address.length > 20 && ( // only show button if text is long 
                                                                    <button
                                                                        onClick={() => {
                                                                            // toggle showFull for this row
                                                                            trip.showFull = !trip.showFull;
                                                                            setPostJobs([...postJobs]); // re-render
                                                                        }}
                                                                        className="ml-2 text-xs text-indigo-600 hover:underline"
                                                                    >
                                                                        {trip.showFull ? "Show Less" : "Show More"}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            {trip?.status ? (
                                                                <span
                                                                    className={`px-3 py-1 rounded-full text-xs font-semibold
                                                                                ${trip.status === "pending" ? "bg-yellow-100 text-yellow-700" : ""}
                                                                                ${trip.status === "in_progress" ? "bg-blue-100 text-blue-700" : ""}
                                                                                ${trip.status === "completed" ? "bg-green-100 text-green-700" : ""}
                                                                                ${trip.status === "cancelled" ? "bg-red-100 text-red-700" : ""}
                                                                            `}
                                                                >
                                                                    {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                                                                </span>
                                                            ) : (
                                                                "N/A"
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3">{trip?.moneyOffered || 0}</td>
                                                        <td className="px-4 py-3">{trip?.selectedAssistant?.name || 'Pending'}</td>
                                                        <td className="px-4 py-3">{trip?.selectedAssistant?.mobile || 'Pending'}</td>
                                                        <td className="px-4 py-3">{trip?.selectedAssistant?.email || 'Pending'}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="10" className="px-4 py-8 text-center text-gray-500">
                                                        No Job Creates found for this user
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination - Only show if multiple pages exist */}
                                {postJobTotalPages > 1 && (
                                    <div className="flex justify-center items-center mt-6 gap-2">
                                        <button
                                            disabled={postJobPage === 1}
                                            onClick={() => {
                                                setPostJobPage(postJobPage - 1);
                                                fetchPostJobs(postJobPage - 1);
                                            }}
                                            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
                                        >
                                            Prev
                                        </button>
                                        <span className="text-sm text-gray-600">
                                            Page {postJobPage} of {postJobTotalPages}
                                        </span>
                                        <button
                                            disabled={postJobPage === postJobTotalPages}
                                            onClick={() => {
                                                setPostJobPage(postJobPage + 1);
                                                fetchPostJobs(postJobPage + 1);
                                            }}
                                            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                            : (
                                /* Post History Content */
                                <div className='mt-4'>
                                    {/* Table */}
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 text-sm text-center">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-gray-600 font-medium">S.No.</th>
                                                    <th className="px-4 py-3 text-gray-600 font-medium">Date</th>
                                                    <th className="px-4 py-3 text-gray-600 font-medium">Time</th>
                                                    <th className="px-4 py-3 text-gray-600 font-medium">Title</th>
                                                    <th className="px-4 py-3 text-gray-600 font-medium">Description</th>
                                                    <th className="px-4 py-3 text-gray-600 font-medium">Address</th>
                                                    <th className="px-4 py-3 text-gray-600 font-medium">Status</th>
                                                    <th className="px-4 py-3 text-gray-600 font-medium">Money Offer</th>
                                                    <th className="px-4 py-3 text-gray-600 font-medium">Hirer Name</th>
                                                    <th className="px-4 py-3 text-gray-600 font-medium">Hirer phone</th>
                                                    <th className="px-4 py-3 text-gray-600 font-medium">Hirer Email</th>

                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 text-gray-700">
                                                {users.length > 0 ? (
                                                    users.map((trip, index) => (

                                                        <tr key={trip._id}>
                                                            <td className="px-4 py-3">
                                                                {isSearching
                                                                    ? index + 1
                                                                    : (currentPage - 1) * rowsPerPage + index + 1
                                                                }
                                                            </td>
                                                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                                                {trip?.createdAt
                                                                    ? new Date(trip.createdAt).toISOString().split("T")[0] // YYYY-MM-DD
                                                                    : "N/A"}
                                                            </td>

                                                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                                                {trip?.createdAt
                                                                    ? new Date(trip.createdAt).toLocaleTimeString("en-US", {
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                        hour12: true,
                                                                    })
                                                                    : "N/A"}
                                                            </td>



                                                            <td className="px-4 py-3 max-w-[200px]">
                                                                <div className="flex items-center">
                                                                    <span
                                                                        className={`truncate ${trip.showFull ? "whitespace-normal" : "whitespace-nowrap"} overflow-hidden`}
                                                                    >
                                                                        {trip?.jobId?.title || "N/A"}
                                                                    </span>
                                                                    {trip?.jobId?.title && trip?.jobId?.title.length > 20 && ( // only show button if text is long
                                                                        <button
                                                                            onClick={() => {
                                                                                // toggle showFull for this row
                                                                                trip.showFull = !trip.showFull;
                                                                                setPostJobs([...postJobs]); // re-render
                                                                            }}
                                                                            className="ml-2 text-xs text-indigo-600 hover:underline"
                                                                        >
                                                                            {trip.showFull ? "Show Less" : "Show More"}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 max-w-[200px]">
                                                                <div className="flex items-center">
                                                                    <span
                                                                        className={`truncate ${trip.showFull ? "whitespace-normal" : "whitespace-nowrap"} overflow-hidden`}
                                                                    >
                                                                        {trip?.jobId?.description || "N/A"}
                                                                    </span>
                                                                    {trip?.jobId?.description && trip?.jobId?.description.length > 20 && ( // only show button if text is long 
                                                                        <button
                                                                            onClick={() => {
                                                                                // toggle showFull for this row
                                                                                trip.showFull = !trip.showFull;
                                                                                setPostJobs([...postJobs]); // re-render
                                                                            }}
                                                                            className="ml-2 text-xs text-indigo-600 hover:underline"
                                                                        >
                                                                            {trip.showFull ? "Show Less" : "Show More"}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>

                                                            <td className="px-4 py-3 max-w-[200px]">
                                                                <div className="flex items-center">
                                                                    <span
                                                                        className={`truncate ${trip.showFull ? "whitespace-normal" : "whitespace-nowrap"} overflow-hidden`}
                                                                    >
                                                                        {trip?.jobId?.address || "N/A"}
                                                                    </span>
                                                                    {trip?.jobId?.address && trip?.jobId?.address.length > 20 && ( // only show button if text is long 
                                                                        <button
                                                                            onClick={() => {
                                                                                // toggle showFull for this row
                                                                                trip.showFull = !trip.showFull;
                                                                                setPostJobs([...postJobs]); // re-render
                                                                            }}
                                                                            className="ml-2 text-xs text-indigo-600 hover:underline"
                                                                        >
                                                                            {trip.showFull ? "Show Less" : "Show More"}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                {trip?.jobId?.status ? (
                                                                    <span
                                                                        className={`px-3 py-1 rounded-full text-xs font-semibold
                                                                                ${trip?.jobId?.status === "pending" ? "bg-yellow-100 text-yellow-700" : ""}
                                                                                ${trip?.jobId?.status === "in_progress" ? "bg-blue-100 text-blue-700" : ""}
                                                                                ${trip?.jobId?.status === "completed" ? "bg-green-100 text-green-700" : ""}
                                                                                ${trip?.jobId?.status === "cancelled" ? "bg-red-100 text-red-700" : ""}
                                                                            `}
                                                                    >
                                                                        {trip?.jobId?.status?.charAt(0).toUpperCase() + trip?.jobId?.status.slice(1)}
                                                                    </span>
                                                                ) : (
                                                                    "N/A"
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3">{trip?.jobId?.moneyOffered || 0}</td>
                                                            <td className="px-4 py-3">{trip?.hirerId?.name || 'Pending'}</td>
                                                            <td className="px-4 py-3">{trip?.hirerId?.mobile || 'Pending'}</td>
                                                            <td className="px-4 py-3">{trip?.hirerId?.email || 'Pending'}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="10" className="px-4 py-8 text-center text-gray-500">
                                                            No  Apply Job found for this user
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination - Only show if multiple pages exist */}
                                    {totalPages > 1 && (
                                        <div className="flex justify-center items-center mt-6 gap-2">
                                            <button
                                                disabled={currentPage === 1}
                                                onClick={() => {
                                                    setCurrentPage(currentPage - 1);
                                                    fetchApplyJobs(currentPage - 1);
                                                }}
                                                className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
                                            >
                                                Prev
                                            </button>
                                            <span className="text-sm text-gray-600">
                                                Page {currentPage} of {totalPages}
                                            </span>
                                            <button
                                                disabled={currentPage === totalPages}
                                                onClick={() => {
                                                    setCurrentPage(currentPage + 1);
                                                    fetchApplyJobs(currentPage + 1);
                                                }}
                                                className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>

            {/* Show UnVerifie Popup */}
            {showUnverifyForm && (
                <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-white">
                            <div className="flex items-center">
                                <div className="p-3 bg-white/20 rounded-xl mr-4">
                                    <FiXCircle className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Unverify Account</h3>
                                    <p className="text-amber-100 text-sm mt-1">
                                        Please provide a reason for unverification
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Form Content */}
                        <div className="px-5 py-4">
                            <div className="space-y-3">
                                {/* Reason buttons */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Select Reason(s)
                                    </label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {[
                                            { value: "Vehicle", label: "Wrong Vehicle Details" },
                                            { value: "License", label: "Wrong Driver License" },
                                            { value: "Bank", label: "Wrong Bank Details" },
                                            { value: "Insurance", label: "Wrong Insurance Details" },
                                        ].map((reason) => {
                                            const isSelected = selectedReasons.includes(reason.value);
                                            return (
                                                <button
                                                    key={reason.value}
                                                    type="button"
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            setSelectedReasons(
                                                                selectedReasons.filter((r) => r !== reason.value)
                                                            );
                                                        } else {
                                                            setSelectedReasons([...selectedReasons, reason.value]);
                                                        }
                                                    }}
                                                    className={`p-2.5 text-left rounded-lg border text-sm transition-all ${isSelected
                                                        ? "border-amber-500 bg-amber-50 text-amber-700"
                                                        : "border-gray-200 hover:border-amber-300 hover:bg-amber-50"
                                                        }`}
                                                >
                                                    <div className="flex items-center">
                                                        <div
                                                            className={`w-4 h-4 rounded-full border flex items-center justify-center mr-2 ${isSelected
                                                                ? "border-amber-500 bg-amber-500 text-white"
                                                                : "border-gray-300"
                                                                }`}
                                                        >
                                                            {isSelected && <FiCheckCircle className="h-3 w-3" />}
                                                        </div>
                                                        {reason.label}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                </div>


                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="bg-gray-50 px-5 py-3 flex justify-end space-x-2">
                            <button
                                onClick={() => {
                                    setSelectedReasons([]);   // ✅ clear selections
                                    setUnverifyReason("");    // clear notes
                                    setShowUnverifyForm(false); // close popup
                                }}
                                className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={() => {
                                    if (!selectedReasons.length) {
                                        showSnackbar("Please select at least one reason", "error");
                                        return;
                                    }

                                    // 👉 pass array of reasons + notes
                                    handleConfirmAction({
                                        reasons: selectedReasons,
                                        notes: unverifyReason,
                                    });

                                    setSelectedReasons([]);   // ✅ clear selections after confirm
                                    setUnverifyReason("");    // clear notes
                                    setShowUnverifyForm(false); // close popup
                                }}
                                disabled={!selectedReasons.length}
                                className="px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-amber-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {showConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Confirm Action
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {actionType === 'block'
                                ? 'Are you sure you want to deactivate this driver?'
                                : 'Are you sure you want to activate this driver?'
                            }
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowConfirmation(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                                disabled={isUpdating}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmAction}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                                disabled={isUpdating}
                            >
                                {isUpdating ? 'Updating...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Snackbar for notifications */}
            <Snackbar
                visible={snackbar.visible}
                message={snackbar.message}
                type={snackbar.type}
                onClose={hideSnackbar}
                position="bottom-right"
            />
        </div>
    );
}
