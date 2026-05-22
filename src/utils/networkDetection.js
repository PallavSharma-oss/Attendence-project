// Network detection utility for office WiFi/IP validation

/**
 * Get client IP address
 * @returns {Promise<string|null>}
 */
export const getClientIP = async () => {
  try {
    // Try multiple IP detection services for reliability
    const services = [
      'https://api.ipify.org?format=json',
      'https://api.my-ip.io/ip.json',
      'https://ipapi.co/json/'
    ];

    for (const service of services) {
      try {
        const response = await fetch(service);
        const data = await response.json();
        const ip = data.ip || data.address;
        if (ip) return ip;
      } catch (err) {
        continue;
      }
    }
    return null;
  } catch (error) {
    console.error('Failed to get client IP:', error);
    return null;
  }
};

/**
 * Check if IP is in allowed range
 * @param {string} ip - IP address to check
 * @param {Array<string>} allowedRanges - Array of IP ranges (e.g., ["192.168.1.0/24"])
 * @returns {boolean}
 */
export const isIPInRange = (ip, allowedRanges) => {
  if (!ip || !allowedRanges || allowedRanges.length === 0) {
    return false;
  }

  const ipToNumber = (ip) => {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
  };

  const parseCIDR = (cidr) => {
    const [baseIP, bits] = cidr.split('/');
    const mask = bits ? ~((1 << (32 - parseInt(bits, 10))) - 1) : 0xffffffff;
    return { base: ipToNumber(baseIP) & mask, mask };
  };

  const ipNum = ipToNumber(ip);

  return allowedRanges.some((range) => {
    // Support both CIDR notation and exact IP
    if (range.includes('/')) {
      const { base, mask } = parseCIDR(range);
      return (ipNum & mask) === base;
    } else {
      // Exact IP match
      return ipNum === ipToNumber(range);
    }
  });
};

/**
 * Validate if user is on office network
 * @param {Array<string>} allowedRanges - Whitelisted IP ranges
 * @returns {Promise<{isOfficeNetwork: boolean, ipAddress: string|null}>}
 */
export const validateOfficeNetwork = async (allowedRanges) => {
  const ipAddress = await getClientIP();
  
  if (!ipAddress) {
    return { isOfficeNetwork: false, ipAddress: null };
  }

  const isOfficeNetwork = isIPInRange(ipAddress, allowedRanges);
  
  return { isOfficeNetwork, ipAddress };
};
