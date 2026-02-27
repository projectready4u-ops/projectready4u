import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert text to URL-friendly slug
 */
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

/**
 * Format Indian currency
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(price);
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (exactly 10 digits)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

/**
 * Format date in readable format
 */
export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Get YouTube video ID from URL
 */
export const getYouTubeVideoId = (url: string | null | undefined): string => {
  if (!url) return '';
  
  const regexes = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const regex of regexes) {
    const match = url.match(regex);
    if (match) return match[1];
  }

  return '';
};

/**
 * Get YouTube thumbnail URL
 */
export const getYouTubeThumbnail = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
};

/**
 * Generate WhatsApp message link
 */
export const generateWhatsAppLink = (phoneNumber: string, message: string): string => {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/91${phoneNumber}?text=${encodedMessage}`;
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
};

/**
 * Get status color
 */
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-600 border-yellow-200',
    approved: 'bg-green-500/20 text-green-600 border-green-200',
    rejected: 'bg-red-500/20 text-red-600 border-red-200',
  };
  return colors[status] || 'bg-gray-500/20 text-gray-600 border-gray-200';
};

/**
 * Get status badge icon
 */
export const getStatusBadge = (status: string): string => {
  const badges: Record<string, string> = {
    pending: '🟡',
    approved: '🟢',
    rejected: '🔴',
  };
  return badges[status] || '⚪';
};

/**
 * Indian states list
 */
export const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli',
  'Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

/**
 * Format request details as WhatsApp message (tabular format)
 */
export const formatRequestDetailsForWhatsApp = (
  projectId: string,
  requestId: string,
  projectTitle: string,
  fullName: string,
  college: string,
  email: string,
  phone: string
): string => {
  return `📋 *YOUR REQUEST DETAILS*\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📋 *Request ID:* ${requestId}\n🆔 *Project ID:* ${projectId}\n📚 *Project:* ${projectTitle}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n👤 *Name:* ${fullName}\n🏫 *College:* ${college}\n📧 *Email:* ${email}\n📱 *Phone:* ${phone}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n⏳ *Status:* Pending Review\n✅ *Next Step:* Admin will contact you shortly`;
};

/**
 * Project categories
 */
export const PROJECT_CATEGORIES = ['Web', 'Android', 'Python', 'ML/AI', 'IoT', 'Java', 'Other'];

/**
 * Traffic sources
 */
export const TRAFFIC_SOURCES = ['youtube', 'google', 'whatsapp', 'friend', 'other'];
