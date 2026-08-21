import { isIPv4, isIPv6 } from 'net';
import dns from 'dns';

/**
 * Check if an IPv4 address is in a private/internal range.
 *
 * Blocked ranges:
 * - 0.0.0.0/8         (current network)
 * - 10.0.0.0/8        (private class A)
 * - 100.64.0.0/10      (carrier-grade NAT / shared address space)
 * - 127.0.0.0/8       (loopback)
 * - 169.254.0.0/16    (link-local)
 * - 172.16.0.0/12     (private class B)
 * - 192.168.0.0/16    (private class C)
 * - 198.18.0.0/15     (benchmarking)
 * - 224.0.0.0/4       (multicast)
 * - 240.0.0.0/4       (reserved)
 */
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
    return false;
  }

  const [a, b] = parts;

  // 0.0.0.0/8
  if (a === 0) return true;
  // 10.0.0.0/8
  if (a === 10) return true;
  // 100.64.0.0/10
  if (a === 100 && b >= 64 && b <= 127) return true;
  // 127.0.0.0/8
  if (a === 127) return true;
  // 169.254.0.0/16
  if (a === 169 && b === 254) return true;
  // 172.16.0.0/12
  if (a === 172 && b >= 16 && b <= 31) return true;
  // 192.168.0.0/16
  if (a === 192 && b === 168) return true;
  // 198.18.0.0/15
  if (a === 198 && (b === 18 || b === 19)) return true;
  // 224.0.0.0/4 (multicast)
  if (a >= 224 && a <= 239) return true;
  // 240.0.0.0/4 (reserved)
  if (a >= 240) return true;

  return false;
}

/**
 * Check if an IPv6 address is private/internal.
 *
 * Blocked ranges:
 * - ::1                (loopback)
 * - fc00::/7           (unique local addresses)
 * - fe80::/10          (link-local)
 */
function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();

  // Loopback
  if (normalized === '::1' || normalized === '0:0:0:0:0:0:0:1') return true;

  // Unique local (fc00::/7)
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;

  // Link-local (fe80::/10)
  if (normalized.startsWith('fe80')) return true;

  return false;
}

/**
 * Check if an IP address is private/internal (SSRF risk).
 */
function isPrivateIP(ip: string): boolean {
  if (isIPv4(ip)) return isPrivateIPv4(ip);
  if (isIPv6(ip)) return isPrivateIPv6(ip);
  return false;
}

/**
 * Resolve a hostname to IP addresses using DNS.
 * Uses `dns.resolve4` and `dns.resolve6` directly rather than
 * `dns.promises.lookup` to avoid DNS rebinding (which follows CNAME chains).
 */
function resolveHost(hostname: string): Promise<string[]> {
  return new Promise((resolve) => {
    const results: string[] = [];
    let pending = 2; // resolve4 + resolve6

    const done = () => {
      pending--;
      if (pending <= 0) resolve(results);
    };

    dns.resolve4(hostname, (err, addresses) => {
      if (!err && addresses) results.push(...addresses);
      done();
    });

    dns.resolve6(hostname, (err, addresses) => {
      if (!err && addresses) results.push(...addresses);
      done();
    });
  });
}

export type SSRFCheckResult =
  | { allowed: true }
  | { allowed: false; reason: string };

/**
 * Check if a URL is safe to fetch (not pointing to private/internal IPs).
 *
 * This prevents Server-Side Request Forgery (SSRF) attacks where an attacker
 * submits a URL like `http://169.254.169.254/latest/meta-data/` to access
 * cloud metadata services, or `http://127.0.0.1:5432/` to access local services.
 *
 * @param urlString - The URL to validate
 * @returns SSRFCheckResult indicating if the URL is allowed
 */
export async function checkSSRF(urlString: string): Promise<SSRFCheckResult> {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    return { allowed: false, reason: 'Invalid URL format' };
  }

  // Only allow HTTP(S) schemes
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return {
      allowed: false,
      reason: `Protocol "${url.protocol}" is not allowed. Use http: or https:`,
    };
  }

  const hostname = url.hostname;

  // Block common internal hostnames
  const blockedHostnames = [
    'localhost',
    '0.0.0.0',
    '127.0.0.1',
    '[::1]',
    'metadata.google.internal',
    'instance-data',
    '169.254.169.254',
  ];

  if (blockedHostnames.includes(hostname.toLowerCase())) {
    return {
      allowed: false,
      reason: `Hostname "${hostname}" is not allowed`,
    };
  }

  // Resolve the hostname and check all resolved IPs
  let resolvedIPs: string[];
  try {
    resolvedIPs = await resolveHost(hostname);
  } catch {
    // DNS resolution failed — block to be safe
    return {
      allowed: false,
      reason: `Could not resolve hostname "${hostname}"`,
    };
  }

  if (resolvedIPs.length === 0) {
    return {
      allowed: false,
      reason: `Hostname "${hostname}" resolved to no IP addresses`,
    };
  }

  // Check each resolved IP
  for (const ip of resolvedIPs) {
    if (isPrivateIP(ip)) {
      return {
        allowed: false,
        reason: `Hostname "${hostname}" resolves to a private/internal IP (${ip})`,
      };
    }
  }

  return { allowed: true };
}
