// src/features/settings/components/ProfileTab.tsx

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";
import { useAuthStore } from "@/features/auth/store/auth.store";
import api from "@/services/api";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  avatar?: string;
}

interface ProfileTabProps {
  user?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    address?: string;
    avatar?: string;
  } | null;
  onUpdate?: () => void;
}

export default function ProfileTab({ user, onUpdate }: ProfileTabProps) {
  const { updateUser } = useAuthStore();
  
  const [formData, setFormData] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Load user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        company: user.company || "",
        address: user.address || "",
      });
      if (user.avatar) {
        setAvatarPreview(user.avatar);
      }
    }
  }, [user]);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 3000);
  };

  const validateField = (field: keyof ProfileData, value: string): string => {
    switch (field) {
      case "name":
        if (!value.trim()) return "Full name is required";
        if (value.length < 2) return "Name must be at least 2 characters";
        return "";
      case "email":
        if (!value.trim()) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return "Please enter a valid email address";
        return "";
      case "phone":
        if (value && !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(value)) {
          return "Please enter a valid phone number";
        }
        return "";
      default:
        return "";
    }
  };

  const handleChange = (field: keyof ProfileData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
    setIsEditing(true);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showNotification("Avatar size must be less than 5MB", "error");
        return;
      }
      if (!file.type.startsWith("image/")) {
        showNotification("Please upload an image file", "error");
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        setIsEditing(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    newErrors.name = validateField("name", formData.name);
    newErrors.email = validateField("email", formData.email);
    newErrors.phone = validateField("phone", formData.phone);
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  // API: Update Profile
  const updateProfile = async (data: ProfileData) => {
    const response = await api.put("/user/profile", data);
    return response.data;
  };

  // API: Upload Avatar
  const uploadAvatar = async (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    const response = await api.post("/user/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification("Please fix the errors before saving", "error");
      return;
    }

    setIsSaving(true);
    
    try {
      // Update profile data
      const profileData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        address: formData.address,
      };
      
      const profileResponse = await updateProfile(profileData);
      
      // Upload avatar if changed
      let avatarUrl = null;
      if (avatarFile) {
        const avatarResponse = await uploadAvatar(avatarFile);
        avatarUrl = avatarResponse.data.avatar;
      }
      
      // Update local store using updateUser
      if (updateUser) {
        updateUser({
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          company: profileData.company,
          address: profileData.address,
          avatar: avatarUrl || profileResponse.data.avatar,
        });
      }
      
      showNotification("Profile updated successfully!", "success");
      setIsEditing(false);
      
      // Callback to refresh parent component
      if (onUpdate) {
        onUpdate();
      }
      
    } catch (error: any) {
      console.error("Error updating profile:", error);
      if (error.response?.status === 409) {
        showNotification("Email already exists", "error");
      } else if (error.response?.status === 400) {
        showNotification(error.response?.data?.message || "Invalid data", "error");
      } else {
        showNotification("Failed to update profile", "error");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      company: user?.company || "",
      address: user?.address || "",
    });
    setAvatarPreview(user?.avatar || null);
    setAvatarFile(null);
    setErrors({});
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {/* Notification Toast */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-20 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${
              notification.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircleIcon className="w-5 h-5" />
            ) : (
              <XCircleIcon className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
        
        {/* Header - Same as ChangePasswordForm */}
        <div className="px-4 sm:px-6 md:px-8 py-4 md:py-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <UserIcon className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                Profile Information
              </h2>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                Manage your personal information and account settings
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 md:p-8">
          
          {/* Avatar Section */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-red-500 to-rose-500 shadow-lg">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-3xl md:text-4xl font-bold">
                    {formData.name?.charAt(0) || "U"}
                  </div>
                )}
              </div>
              
              <label className="absolute bottom-0 right-0 p-1.5 bg-white dark:bg-gray-700 rounded-full shadow-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition">
                <CameraIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 md:space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={`w-full pl-9 pr-4 py-2.5 md:py-3 bg-gray-50 dark:bg-gray-700/50 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm ${
                    errors.name
                      ? "border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 dark:border-gray-600 focus:ring-red-500/20 focus:border-red-500"
                  }`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={`w-full pl-9 pr-4 py-2.5 md:py-3 bg-gray-50 dark:bg-gray-700/50 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 dark:border-gray-600 focus:ring-red-500/20 focus:border-red-500"
                  }`}
                  placeholder="Enter your email address"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className={`w-full pl-9 pr-4 py-2.5 md:py-3 bg-gray-50 dark:bg-gray-700/50 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm ${
                    errors.phone
                      ? "border-red-500 focus:ring-red-500/20"
                      : "border-gray-200 dark:border-gray-600 focus:ring-red-500/20 focus:border-red-500"
                  }`}
                  placeholder="+1 234 567 8900"
                />
              </div>
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
            </div>

            {/* Company */}
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Company / Organization
              </label>
              <div className="relative">
                <BuildingOfficeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleChange("company", e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 md:py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm"
                  placeholder="Your company name"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              
             
            </div>
          </div>

          {/* Info Note */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <span className="font-semibold">Note:</span> Your email address cannot be changed without verification. 
              Contact support if you need to update your email.
            </p>
          </div>

          {/* Action Buttons - Same gradient as ChangePasswordForm */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 md:mt-8">
            {isEditing && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-2 py-2 md:py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition font-semibold text-sm"
              >
                Cancel
              </button>
            )}
            
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 md:py-3 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white rounded-xl transition font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <PencilIcon className="w-4 h-4" />
                  {isEditing ? "Save Changes" : "Edit Profile"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}