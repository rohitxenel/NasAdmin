'use client';
import { useState } from 'react';
import {
    FiUser, FiMail, FiPhone, FiBriefcase, FiCreditCard,
    FiEdit, FiSave, FiX, FiLock, FiGlobe,
    FiUpload, FiCheckCircle, FiAlertTriangle
} from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

const VerificationBadge = ({ verified, text }) => (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${verified ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
        }`}>
        {verified ? (
            <FiCheckCircle className="mr-1" />
        ) : (
            <FiAlertTriangle className="mr-1" />
        )}
        {text}
    </span>
);

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [tempProfile, setTempProfile] = useState({});
    const [profileImage, setProfileImage] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const { user } = useAuth();

    // Format user data for display
    const formattedProfile = {
        name: user?.profile?.BankData?.name_at_bank || user?.profile?.name || 'Not provided',
        email: user?.email || 'Not provided',
        phone: user?.profile?.phone ? `+91 ${user.profile.phone}` : 'Not provided',
        type: user?.profile?.type || 'Not specified',
        wallet: user?.profile?.Wallet ? `₹${user.profile.Wallet.toFixed(3)}` : '₹0.00',
        isEmailVerified: user?.profile?.isemailVerified || false,
        isPhoneVerified: user?.profile?.isPhoneVerified || false,
        isKYCVerified: user?.profile?.isKYCVerified || false,
        isGSTVerified: user?.profile?.isGstVerified || false,
        isPanVerified: user?.profile?.isPanCardVerified || false,
        isAdharVerified: user?.profile?.isadharVerified || false,
        panNumber: user?.profile?.pancard || 'Not provided',
        panData: user?.profile?.panData || null,
        gstNumber: user?.profile?.GST || 'Not provided',
        bankDetails: {
            accountNumber: user?.profile?.bankAccountNumber || 'Not provided',
            ifsc: user?.profile?.ifscCode || 'Not provided',
            bankName: user?.profile?.BankData?.bank_name || 'Not provided',
            accountHolder: user?.profile?.BankData?.name_at_bank || 'Not provided',
            city: user?.profile?.BankData?.city || 'Not provided'
        }
    };

    const isIndividual = user?.profile?.type === 'INDIVIDUAL';

    // Add these handler functions with your other handlers
    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordSubmit = () => {
        // Add your password change logic here
        console.log('Password change submitted:', passwordData);
        setShowPasswordModal(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const handleEditToggle = () => {
        if (!isEditing) {
            setTempProfile({ ...formattedProfile });
        }
        setIsEditing(!isEditing);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const handleSave = () => {
        // Here you would typically call an API to save changes
        setIsEditing(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const handleChange = (e) => {
        setTempProfile({
            ...tempProfile,
            [e.target.name]: e.target.value
        });
    };

    const handleImageUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfileImage(URL.createObjectURL(file));
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl font-bold text-gray-900"
                        >
                            Profile Settings
                        </motion.h1>
                        <div className="flex gap-2">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleCancel}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
                                    >
                                        <FiX className="mr-2" /> Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
                                    >
                                        <FiSave className="mr-2" /> Save Changes
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={handleEditToggle}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
                                >
                                    <FiEdit className="mr-2" /> Edit Profile
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        {/* Profile Picture Section */}
                        <div className="p-8 border-b border-gray-200">
                            <div className="flex items-center gap-6">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                                        {profileImage ? (
                                            <Image src={profileImage}
                                                alt="Profile" width={100} height={100} />
                                        ) : (
                                            <span className="text-2xl font-bold text-indigo-600">
                                                {formattedProfile.name.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    {isEditing && (
                                        <label className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-sm cursor-pointer border border-gray-200 hover:bg-gray-50">
                                            <FiUpload className="text-gray-600" />
                                            <input
                                                type="file"
                                                className="hidden"
                                                onChange={handleImageUpload}
                                                accept="image/*"
                                            />
                                        </label>
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">{formattedProfile.name}</h2>
                                    <p className="text-gray-600 capitalize">{formattedProfile.type.toLowerCase()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Form Section */}
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Personal Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <FiUser /> Personal Information
                                    </h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        {isEditing ? (
                                            <input
                                                name="name"
                                                value={tempProfile.name}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                                            />
                                        ) : (
                                            <div className="px-4 py-2 rounded-lg bg-gray-50">
                                                {formattedProfile.name}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                        <div className="flex items-center gap-2">
                                            {isEditing ? (
                                                <input
                                                    name="email"
                                                    type="email"
                                                    value={tempProfile.email}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                                                />
                                            ) : (
                                                <div className="px-4 py-2 rounded-lg bg-gray-50 flex-1">
                                                    {formattedProfile.email}
                                                </div>
                                            )}
                                            <VerificationBadge
                                                verified={formattedProfile.isEmailVerified}
                                                text={formattedProfile.isEmailVerified ? "Verified" : "Unverified"}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                        <div className="flex items-center gap-2">
                                            {isEditing ? (
                                                <input
                                                    name="phone"
                                                    value={tempProfile.phone}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                                                />
                                            ) : (
                                                <div className="px-4 py-2 rounded-lg bg-gray-50 flex-1">
                                                    {formattedProfile.phone}
                                                </div>
                                            )}
                                            <VerificationBadge
                                                verified={formattedProfile.isPhoneVerified}
                                                text={formattedProfile.isPhoneVerified ? "Verified" : "Unverified"}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Verification Status */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <FiBriefcase /> Account Verification
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">KYC Status</label>
                                            <VerificationBadge
                                                verified={formattedProfile.isKYCVerified}
                                                text={formattedProfile.isKYCVerified ? "KYC Verified" : "KYC Not Verified"}
                                            />
                                            {!formattedProfile.isKYCVerified && (
                                                <p className="text-xs text-amber-600 mt-1">
                                                    Please complete KYC verification to access all features
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">PAN Status</label>
                                            <div className="flex items-center gap-2">
                                                <div className="px-4 py-2 rounded-lg bg-gray-50 flex-1">
                                                    {formattedProfile.panNumber}
                                                </div>
                                                <VerificationBadge
                                                    verified={formattedProfile.isPanVerified}
                                                    text={formattedProfile.isPanVerified ? "Verified" : "Unverified"}
                                                />
                                            </div>
                                        </div>
                                        {!isIndividual && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">GST Status</label>
                                                <div className="flex items-center gap-2">
                                                    <div className="px-4 py-2 rounded-lg bg-gray-50 flex-1">
                                                        {formattedProfile.gstNumber}
                                                    </div>
                                                    <VerificationBadge
                                                        verified={formattedProfile.isGSTVerified}
                                                        text={formattedProfile.isGSTVerified ? "Verified" : "Unverified"}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* PAN Card Details Section */}
                            {formattedProfile.panData && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                                        <FiCreditCard /> PAN Card Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
                                            <div className="px-4 py-2 rounded-lg bg-gray-50 font-mono">
                                                {formattedProfile.panData.pan}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Name on PAN</label>
                                            <div className="px-4 py-2 rounded-lg bg-gray-50">
                                                {formattedProfile.panData.name_pan_card}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                            <div className="px-4 py-2 rounded-lg bg-gray-50">
                                                {formattedProfile.panData.date_of_birth}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                            <div className="px-4 py-2 rounded-lg bg-gray-50 capitalize">
                                                {formattedProfile.panData.gender.toLowerCase()}
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                            <div className="px-4 py-2 rounded-lg bg-gray-50">
                                                {formattedProfile.panData.address?.full_address}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Linked</label>
                                            <div className="px-4 py-2 rounded-lg bg-gray-50">
                                                {formattedProfile.panData.aadhaar_linked ? "Yes" : "No"}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                            <div className="px-4 py-2 rounded-lg bg-gray-50 capitalize">
                                                {formattedProfile.panData.status.toLowerCase()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Bank Details Section */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                                    <FiBriefcase /> Bank Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder</label>
                                        <div className="px-4 py-2 rounded-lg bg-gray-50">
                                            {formattedProfile.bankDetails.accountHolder}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                                        <div className="px-4 py-2 rounded-lg bg-gray-50">
                                            {formattedProfile.bankDetails.accountNumber}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                                        <div className="px-4 py-2 rounded-lg bg-gray-50">
                                            {formattedProfile.bankDetails.bankName}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                                        <div className="px-4 py-2 rounded-lg bg-gray-50">
                                            {formattedProfile.bankDetails.ifsc}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                        <div className="px-4 py-2 rounded-lg bg-gray-50">
                                            {formattedProfile.bankDetails.city}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Wallet Section */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                                    <FiBriefcase /> Wallet Balance
                                </h3>
                                <div className="px-4 py-3 bg-indigo-50 rounded-lg">
                                    <div className="text-2xl font-bold text-indigo-700">
                                        {formattedProfile.wallet}
                                    </div>
                                    <p className="text-sm text-indigo-600 mt-1">
                                        Available balance
                                    </p>
                                </div>
                            </div>

                            {/* Security Section */}
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                                    <FiLock /> Security
                                </h3>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-medium text-gray-700">Password</h4>
                                        <p className="text-sm text-gray-500">Last changed 3 months ago</p>
                                    </div>
                                    <button
                                        onClick={() => setShowPasswordModal(true)}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                                    >
                                        <FiLock className="text-sm" /> Change Password
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>

                    <AnimatePresence>
                        {showPasswordModal && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                            >
                                <motion.div
                                    initial={{ scale: 0.9, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    exit={{ scale: 0.9, y: 20 }}
                                    className="bg-white rounded-xl shadow-lg w-full max-w-md"
                                >
                                    <div className="p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                            Change Password
                                        </h3>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Current Password
                                                </label>
                                                <input
                                                    type="password"
                                                    name="currentPassword"
                                                    value={passwordData.currentPassword}
                                                    onChange={handlePasswordChange}
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                                                    placeholder="Enter current password"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    name="newPassword"
                                                    value={passwordData.newPassword}
                                                    onChange={handlePasswordChange}
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                                                    placeholder="Enter new password"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Confirm New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    name="confirmPassword"
                                                    value={passwordData.confirmPassword}
                                                    onChange={handlePasswordChange}
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                                                    placeholder="Confirm new password"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-6 flex justify-end gap-3">
                                            <button
                                                onClick={() => setShowPasswordModal(false)}
                                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handlePasswordSubmit}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                                disabled={!passwordData.currentPassword || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
                                            >
                                                Update Password
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Success Notification */}
                    <AnimatePresence>
                        {showSuccess && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg"
                            >
                                <div className="flex items-center gap-2">
                                    <FiCheckCircle className="text-green-600" />
                                    <span className="text-sm font-medium text-green-800">
                                        Profile updated successfully!
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}