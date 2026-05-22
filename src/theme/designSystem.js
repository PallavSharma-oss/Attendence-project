// src/theme/designSystem.js
// Complete Design System for Attendance Management Application

export const colors = {
  // Primary Colors
  primary: {
    main: '#4F46E5',
    light: '#6366F1',
    dark: '#4338CA',
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
  },
  
  // Accent Colors
  accent: {
    main: '#0EA5E9',
    light: '#38BDF8',
    dark: '#0284C7',
  },
  
  // Status Colors
  success: {
    main: '#22C55E',
    light: '#4ADE80',
    dark: '#16A34A',
    bg: '#F0FDF4',
  },
  
  warning: {
    main: '#F59E0B',
    light: '#FBBF24',
    dark: '#D97706',
    bg: '#FFFBEB',
  },
  
  danger: {
    main: '#EF4444',
    light: '#F87171',
    dark: '#DC2626',
    bg: '#FEF2F2',
  },
  
  // Neutrals
  background: '#F8FAFC',
  card: '#FFFFFF',
  border: '#E2E8F0',
  
  text: {
    primary: '#0F172A',
    secondary: '#64748B',
    disabled: '#94A3B8',
  },
  
  // Sidebar
  sidebar: {
    bg: '#1E293B',
    hover: '#334155',
    active: '#4F46E5',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
  },
};

export const typography = {
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  
  h1: {
    fontSize: '32px',
    fontWeight: 700,
    lineHeight: '40px',
    letterSpacing: '-0.02em',
  },
  
  h2: {
    fontSize: '24px',
    fontWeight: 700,
    lineHeight: '32px',
    letterSpacing: '-0.01em',
  },
  
  h3: {
    fontSize: '20px',
    fontWeight: 600,
    lineHeight: '28px',
  },
  
  h4: {
    fontSize: '18px',
    fontWeight: 600,
    lineHeight: '24px',
  },
  
  body1: {
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: '24px',
  },
  
  body2: {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '20px',
  },
  
  caption: {
    fontSize: '12px',
    fontWeight: 400,
    lineHeight: '16px',
  },
  
  button: {
    fontSize: '14px',
    fontWeight: 600,
    lineHeight: '20px',
    textTransform: 'none',
  },
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

export const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  hover: '0 10px 20px -5px rgba(79, 70, 229, 0.2)',
};

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
};

export const layout = {
  sidebarWidth: '260px',
  sidebarCollapsedWidth: '80px',
  topbarHeight: '72px',
  maxContentWidth: '1400px',
};

// Animation presets
export const animations = {
  slideIn: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3 },
  },
  
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.2 },
  },
  
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.2 },
  },
};
