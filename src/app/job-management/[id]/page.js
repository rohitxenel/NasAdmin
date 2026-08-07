'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAllRide, gejobById } from '@/services/rideManagementService';
import {
    FiArrowLeft,
    FiMapPin,
    FiPhone,
    FiMail,
    FiDollarSign,
    FiCreditCard,
    FiShield,
    FiUser,
    FiCalendar,
    FiGlobe,
    FiCheckCircle,
    FiXCircle,
    FiClock,
    FiNavigation,
    FiTruck,
    FiCreditCard as FiCard,
    FiDollarSign as FiCash,
    FiAlertCircle,
    FiMap,
    FiTrendingUp,
    FiLock,
    FiCopy,
    FiStar,
    FiHash

} from 'react-icons/fi';
import Snackbar from '@/components/layout/Snackbar';
import { MdOutlineDirectionsCar } from "react-icons/md";
export default function UserProfilePage() {
    const { id } = useParams();
    const router = useRouter();

    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'trips'
    const [snackbar, setSnackbar] = useState({
        visible: false,
        message: '',
        type: 'success'
    });
    const [copied, setCopied] = useState("");
    const [showFullUserComment, setShowFullUserComment] = useState(false);
    const [showFullDriverComment, setShowFullDriverComment] = useState(false);

    const renderComment = (comment, showFull, setShowFull) => {
        if (!comment) return "—";
        const isLong = comment.length > 100; // Adjust the length threshold
        if (!isLong) return comment;

        return (
            <>
                {showFull ? comment : `${comment.slice(0, 100)}...`}
                <button
                    onClick={() => setShowFull(!showFull)}
                    className="ml-2 text-indigo-600 text-sm"
                >
                    {showFull ? "See Less" : "See More"}
                </button>
            </>
        );
    };
    const StarRating = ({ value = 0, max = 5 }) => {
        return (
            <div className="flex">
                {[...Array(max)].map((_, i) => (
                    <FiStar
                        key={i}
                        className={`w-4 h-4 ${i < value ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                            }`}
                    />
                ))}
            </div>
        );
    };


    const handleCopy = (text, type) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(""), 1500); // reset after 1.5s
    };
    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);


                // fetch trips
                const resTrips = await gejobById(id);
                if (resTrips?.statusCode === 200 && resTrips?.status) {
                    // Check if data is nested in a data property
                    console.log("job Data", resTrips)
                    const tripsData = resTrips.data.data || resTrips.data;
                    setTrips(tripsData);
                } else {
                    setTrips([]); // fallback
                }

            } catch (err) {
                console.error('Failed to fetch user:', err);
                showSnackbar(err.message || 'Failed to load user data', 'error');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchUser();
        } else {
            showSnackbar('User ID is required', 'error');
            setLoading(false);
        }
    }, [id]);

    const showSnackbar = (message, type = 'success') => {
        setSnackbar({ visible: true, message, type });
    };

    const hideSnackbar = () => {
        setSnackbar({ ...snackbar, visible: false });
    };

    // Format date for better readability
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

    // Format time for better readability
    const formatTime = (timeString) => {
        if (!timeString) return '';

        try {
            // Handle both "06:45 PM" format and ISO time format
            if (timeString.includes('PM') || timeString.includes('AM')) {
                return timeString;
            }

            // If it's in ISO format, extract the time part
            const timeParts = timeString.split('T')[1]?.split(':');
            if (timeParts) {
                let hours = parseInt(timeParts[0]);
                const minutes = timeParts[1];
                const ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12;
                hours = hours ? hours : 12; // the hour '0' should be '12'
                return `${hours}:${minutes} ${ampm}`;
            }

            return timeString;
        } catch (error) {
            return timeString;
        }
    };

    // Get status badge with appropriate colors
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

    // Get payment method icon
    const getPaymentMethodIcon = (method) => {
        switch (method) {
            case 'CASH':
                return <FiCash className="text-green-500" />;
            case 'CARD':
                return <FiCard className="text-blue-500" />;
            case 'PAYPAL':
                return <FiDollarSign className="text-blue-400" />;
            default:
                return <FiCreditCard className="text-gray-500" />;
        }
    };

    // Get vehicle type icon
    const getVehicleIcon = (type) => {
        switch (type) {
            case 'Bike':
                return <FiNavigation className="text-indigo-500" />;
            case 'Sedan':
            case 'SUV':
            case 'Hatchback':
                return <FiTruck className="text-indigo-500" />;
            default:
                return <FiTruck className="text-gray-500" />;
        }
    };

    // Safely get nested properties
    const getSafeValue = (value, fallback = 'Not provided') => {
        return value !== null && value !== undefined ? value : fallback;
    };



    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!trips) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="mx-auto h-16 w-16 text-red-400 mb-4">
                        <FiXCircle className="w-full h-full" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Trip Not Found</h2>
                    <p className="text-gray-600 mb-6">The Trip you're looking for doesn't exist or couldn't be loaded.</p>
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

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Tabs for Profile and Trip History */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div className="border-b border-gray-200 flex items-center">
                        {/* Back button */}
                        <button
                            onClick={() => router.back()}
                            className="flex items-center text-gray-500 hover:text-gray-700 font-medium py-4 px-6 transition-colors border-b-2 border-transparent"
                        >
                            <FiArrowLeft className="mr-1" /> Back
                        </button>

                        {/* Tabs */}
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`py-4 px-6 text-center font-medium text-sm border-b-2 transition-colors ${activeTab === 'profile' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                Job Details
                            </button>

                        </nav>
                    </div>

                    <div className="p-6">
                        {activeTab === 'profile' ? (
                            <>
                                {/* User Stats Overview */}
                                {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                                        <div className="flex items-center">
                                            <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                                                <FiTrendingUp className="text-indigo-600" />
                                            </div>
                                            
                                        </div>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                        <div className="flex items-center">
                                            <div className="p-2 bg-green-100 rounded-lg mr-3">
                                                <FiCheckCircle className="text-green-600" />
                                            </div>
                                           
                                        </div>
                                    </div>
                                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                                        <div className="flex items-center">
                                            <div className="p-2 bg-red-100 rounded-lg mr-3">
                                                <FiXCircle className="text-red-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-red-700">Cancelled</p>
                                                <p className="text-xl font-bold text-red-900">{tripStats.cancelled}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                                        <div className="flex items-center">
                                            <div className="p-2 bg-purple-100 rounded-lg mr-3">
                                                <FiDollarSign className="text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-purple-700">Total Spent</p>
                                                <p className="text-xl font-bold text-purple-900">₹{tripStats.totalSpent}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div> */}

                                {/* Trip details */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                    {/* Driver Information */}
                                    <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                                <FiUser className="mr-2 text-indigo-600" /> Hirer Information
                                            </h3>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-500 mb-1">Full Name</p>
                                                    <p className="font-medium text-gray-900">{getSafeValue(trips?.hirer?.name)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 mb-1">Address</p>
                                                    <p className="font-medium text-gray-900 text-sm">{getSafeValue(trips?.hirer?.address, 'N/A')}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 mb-1">Date Of birth</p>
                                                    <p className="font-medium text-gray-900 text-sm">{trips?.hirer?.dob
                                                        ? new Date(trips?.hirer?.dob).toLocaleDateString("en-US", {
                                                            year: "numeric",
                                                            month: "short",
                                                            day: "numeric",
                                                        })
                                                        : "Date of Birth not provided"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 mb-1">Hirer Id</p>
                                                    <p className="font-medium text-gray-900 text-sm">{getSafeValue(trips?.hirer?._id, 'N/A')}</p>
                                                </div>
                                            </div>
                                            <div className="border-t border-gray-100 pt-4">
                                                <div className="grid grid-cols-2 gap-6">
                                                    {/* Email */}
                                                    <div className="min-w-0">
                                                        <p className="text-sm text-gray-500 mb-1">Email Address</p>
                                                        <div className="flex items-center">
                                                            <FiMail className="mr-2 text-gray-400 flex-shrink-0" />
                                                            <p className="font-medium text-gray-900 truncate">
                                                                {getSafeValue(trips?.hirer?.email)}
                                                            </p>
                                                            <button
                                                                onClick={() => handleCopy(getSafeValue(trips?.hirer?.email), "email")}
                                                                className="ml-2 text-gray-500 hover:text-blue-600"
                                                                title="Copy Email"
                                                            >
                                                                <FiCopy />
                                                            </button>
                                                            {copied === "email" && (
                                                                <span className="ml-2 text-xs text-green-600">Copied!</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Phone */}
                                                    <div className="min-w-0">
                                                        <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                                                        <div className="flex items-center">
                                                            <FiPhone className="mr-2 text-gray-400 flex-shrink-0" />
                                                            <p className="font-medium text-gray-900 break-all">
                                                                {getSafeValue(trips?.hirer?.mobile)}
                                                            </p>
                                                            <button
                                                                onClick={() => handleCopy(getSafeValue(trips?.hirer?.mobile), "mobile")}
                                                                className="ml-2 text-gray-500 hover:text-blue-600"
                                                                title="Copy Phone"
                                                            >
                                                                <FiCopy />
                                                            </button>
                                                            {copied === "mobile" && (
                                                                <span className="ml-2 text-xs text-green-600">Copied!</span>
                                                            )}

                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Customer Information */}
                                    <div className="max-w bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                                        <div className="flex items-center justify-between mb-4 w-full">
                                            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                                <FiUser className="mr-2 text-indigo-600" /> Assistant Information
                                            </h3>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-500 mb-1">Full Name</p>
                                                    <p className="font-medium text-gray-900">{getSafeValue(trips?.selectedAssistant?.name)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 mb-1">Address</p>
                                                    <p className="font-medium text-gray-900 text-sm">{getSafeValue(trips?.selectedAssistant?.address, 'N/A')}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 mb-1">Date Of birth</p>
                                                    <p className="font-medium text-gray-900 text-sm">{trips?.selectedAssistant?.dob
                                                        ? new Date(trips?.selectedAssistant?.dob).toLocaleDateString("en-US", {
                                                            year: "numeric",
                                                            month: "short",
                                                            day: "numeric",
                                                        })
                                                        : "Date of Birth not provided"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 mb-1">Assistant Id</p>
                                                    <p className="font-medium text-gray-900 text-sm">{getSafeValue(trips?.selectedAssistant?._id, 'N/A')}</p>
                                                </div>
                                            </div>
                                            <div className="border-t border-gray-100 pt-4">
                                                <div className="grid grid-cols-2 gap-6">
                                                    {/* Email */}
                                                    <div className="min-w-0">
                                                        <p className="text-sm text-gray-500 mb-1">Email Address</p>
                                                        <div className="flex items-center">
                                                            <FiMail className="mr-2 text-gray-400 flex-shrink-0" />
                                                            <p className="font-medium text-gray-900 truncate">
                                                                {getSafeValue(trips?.selectedAssistant?.email)}
                                                            </p>
                                                            <button
                                                                onClick={() => handleCopy(getSafeValue(trips?.selectedAssistant?.email), "email")}
                                                                className="ml-2 text-gray-500 hover:text-blue-600"
                                                                title="Copy Email"
                                                            >
                                                                <FiCopy />
                                                            </button>
                                                            {copied === "email" && (
                                                                <span className="ml-2 text-xs text-green-600">Copied!</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Phone */}
                                                    <div className="min-w-0">
                                                        <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                                                        <div className="flex items-center">
                                                            <FiPhone className="mr-2 text-gray-400 flex-shrink-0" />
                                                            <p className="font-medium text-gray-900 break-all">
                                                                {getSafeValue(trips?.selectedAssistant?.mobile)}
                                                            </p>
                                                            <button
                                                                onClick={() => handleCopy(getSafeValue(trips?.selectedAssistant?.mobile), "phone")}
                                                                className="ml-2 text-gray-500 hover:text-blue-600"
                                                                title="Copy Phone"
                                                            >
                                                                <FiCopy />
                                                            </button>
                                                            {copied === "phone" && (
                                                                <span className="ml-2 text-xs text-green-600">Copied!</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                {/* Job Details Card */}
                                <div className="w-full mb-6">
                                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 w-full">
                                        {/* Header */}
                                        <div className="flex items-center mb-6 pb-4 border-b border-gray-100">
                                            <div className="w-2 h-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mr-3"></div>
                                            <h3 className="text-xl font-bold text-gray-900">Job Details</h3>
                                        </div>

                                        {/* Main Grid */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            {/* Left Column - Basic Info */}
                                            <div className="space-y-6">
                                                {/* Title */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-500 mb-2">Title</label>
                                                    <p className="text-lg font-semibold text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                                                        {trips?.title || "—"}
                                                    </p>
                                                </div>

                                                {/* Description */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-500 mb-2">Description</label>
                                                    <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 max-h-32 overflow-y-auto">
                                                        <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                                                            {trips?.description || "—"}
                                                        </p>
                                                    </div>
                                                    {trips?.description && trips.description.length > 100 && (
                                                        <p className="text-xs text-gray-400 mt-1">Scroll to read full description</p>
                                                    )}
                                                </div>

                                                {/* Location & Money */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-500 mb-2">Job Location</label>
                                                        <div className="flex items-center bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                                                            <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                            <p className="text-gray-900 font-medium">{trips?.address || "—"}</p>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-500 mb-2">Money Offered</label>
                                                        <div className="bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                                                            <p className="text-2xl font-bold text-green-700 flex items-center">
                                                                <span className="text-lg mr-1"></span>
                                                                {trips?.moneyOffered || "—"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Column - Status & Reviews */}
                                            <div className="space-y-6">
                                                {/* Status */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-500 mb-2">Status</label>
                                                    <div className={`inline-flex items-center px-4 py-3 rounded-lg border font-semibold ${trips?.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
                                                        trips?.status === 'in-progress' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                            trips?.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                                trips?.status === 'cancelled' ? 'bg-red-100 text-red-800 border-red-200' :
                                                                    'bg-gray-100 text-gray-800 border-gray-200'
                                                        }`}>
                                                        <div className={`w-2 h-2 rounded-full mr-3 ${trips?.status === 'completed' ? 'bg-green-500' :
                                                            trips?.status === 'in-progress' ? 'bg-blue-500' :
                                                                trips?.status === 'pending' ? 'bg-yellow-500' :
                                                                    trips?.status === 'cancelled' ? 'bg-red-500' :
                                                                        'bg-gray-500'
                                                            }`}></div>
                                                        {trips?.status ? trips.status.charAt(0).toUpperCase() + trips.status.slice(1) : "—"}
                                                    </div>
                                                </div>

                                                {/* Reviews Section */}
                                                <div className="space-y-4">
                                                    {/* Assistant Review */}
                                                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-5">
                                                        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                                                            <svg className="w-4 h-4 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                            Assistant Review
                                                        </label>

                                                        {trips?.userReview ? (
                                                            <div className="space-y-3">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center">
                                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                                            <svg
                                                                                key={star}
                                                                                className={`w-5 h-5 ${star <= (trips.userReview.rating || 0)
                                                                                    ? 'text-yellow-400 fill-current'
                                                                                    : 'text-gray-300'
                                                                                    }`}
                                                                                fill="currentColor"
                                                                                viewBox="0 0 20 20"
                                                                            >
                                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                            </svg>
                                                                        ))}
                                                                    </div>
                                                                    <span className="text-sm font-medium text-gray-700 bg-white px-2 py-1 rounded border">
                                                                        {trips.userReview.rating}/5
                                                                    </span>
                                                                </div>
                                                                <div className="bg-white rounded-lg p-3 border border-gray-100">
                                                                    <p className="text-gray-700 text-sm leading-relaxed">
                                                                        {trips.userReview.comment || "No comment provided"}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-100">
                                                                <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                                                </svg>
                                                                <p className="text-gray-500 text-sm">No review yet</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Hirer Review */}
                                                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-5">
                                                        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                                                            <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                            </svg>
                                                            Hirer Review
                                                        </label>

                                                        {trips?.hirerReview ? (
                                                            <div className="space-y-3">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center">
                                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                                            <svg
                                                                                key={star}
                                                                                className={`w-5 h-5 ${star <= (trips.hirerReview.rating || 0)
                                                                                    ? 'text-yellow-400 fill-current'
                                                                                    : 'text-gray-300'
                                                                                    }`}
                                                                                fill="currentColor"
                                                                                viewBox="0 0 20 20"
                                                                            >
                                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                            </svg>
                                                                        ))}
                                                                    </div>
                                                                    <span className="text-sm font-medium text-gray-700 bg-white px-2 py-1 rounded border">
                                                                        {trips.hirerReview.rating}/5
                                                                    </span>
                                                                </div>
                                                                <div className="bg-white rounded-lg p-3 border border-gray-100">
                                                                    <p className="text-gray-700 text-sm leading-relaxed">
                                                                        {trips.hirerReview.comment || "No comment provided"}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-100">
                                                                <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                                                </svg>
                                                                <p className="text-gray-500 text-sm">No review yet</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>




                            </>
                        ) : (
                            /* Trip History Content */
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-6">Trip History</h2>

                                {trips.length === 0 ? (
                                    <div className="text-center py-10">
                                        <FiAlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No trips found</h3>
                                        <p className="mt-1 text-sm text-gray-500">This user hasn't taken any trips yet.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fare</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {trips.map((trip) => (
                                                    <tr key={trip._id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">{formatDate(trip.travelDate)}</div>
                                                            <div className="text-sm text-gray-500 flex items-center">
                                                                <FiClock className="mr-1" /> {formatTime(trip.travelTime)}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {trip.pickupLocation?.address || 'N/A'}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                to {trip.dropLocation?.address || 'N/A'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                {getVehicleIcon(trip.vehicleType)}
                                                                <span className="ml-2 text-sm text-gray-900">{trip.vehicleType}</span>
                                                            </div>
                                                            {trip.bookingType === 'PoolRide' && (
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                                                                    Shared Ride
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            ₹{trip.fareDetails?.totalFare || 0}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                {getPaymentMethodIcon(trip.payment?.method)}
                                                                <span className="ml-2 text-sm text-gray-900">{trip.payment?.method}</span>
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {trip.payment?.isPaid ? 'Paid' : 'Not Paid'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {getStatusBadge(trip.status)}
                                                            {trip.status === 'Cancelled' && trip.cancelreason && (
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    Reason: {trip.cancelreason}
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

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