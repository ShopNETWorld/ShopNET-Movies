import { Injectable, BadRequestException } from '@nestjs/common';
import * as dns from 'dns/promises';
import * as net from 'net';
import { Logger } from '@shopnet/logger';

const logger = new Logger('ssrf-protection');

/**
 * Server-Side Request Forgery (SSRF) Protection Service.
 * Validates and sanitizes external URLs before fetching or proxying.
 * Strictly blocks loopback, private RFC 1918 ranges, link-local, and cloud IMDS endpoints.
 */
@Injectable()
export class SsrfProtectionService {
  private readonly blockedHostnames = new Set([
    'localhost',
    'metadata.google.internal',
    'instance-data',
  ]);

  /**
   * Check if an IPv4 address is in a private, loopback, or cloud-metadata range.
   */
  private isPrivateOrRestrictedIpv4(ip: string): boolean {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some(isNaN)) return true;

    const [a, b] = parts;

    // 0.0.0.0/8 (Current network)
    if (a === 0) return true;

    // 127.0.0.0/8 (Loopback)
    if (a === 127) return true;

    // 10.0.0.0/8 (Private RFC 1918)
    if (a === 10) return true;

    // 172.16.0.0/12 (Private RFC 1918)
    if (a === 172 && b >= 16 && b <= 31) return true;

    // 192.168.0.0/16 (Private RFC 1918)
    if (a === 192 && b === 168) return true;

    // 169.254.0.0/16 (Link-local & AWS/GCP/Azure Cloud IMDS metadata 169.254.169.254)
    if (a === 169 && b === 254) return true;

    // 100.64.0.0/10 (Carrier-grade NAT)
    if (a === 100 && b >= 64 && b <= 127) return true;

    return false;
  }

  /**
   * Check if an IPv6 address is private or loopback.
   */
  private isPrivateOrRestrictedIpv6(ip: string): boolean {
    const normalized = ip.toLowerCase();
    // Loopback
    if (normalized === '::1' || normalized === '0:0:0:0:0:0:0:1') return true;
    // Unspecified
    if (normalized === '::' || normalized === '0:0:0:0:0:0:0:0') return true;
    // Unique Local (fc00::/7)
    if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
    // Link-local (fe80::/10)
    if (normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')) return true;

    return false;
  }

  /**
   * Validates a URL and ensures it does not resolve to private or cloud infrastructure.
   * Throws BadRequestException if the URL is unsafe.
   */
  async assertSafeUrl(urlString: string): Promise<string> {
    let parsed: URL;
    try {
      parsed = new URL(urlString);
    } catch {
      throw new BadRequestException('Malformed URL');
    }

    // 1. Only allow HTTP and HTTPS protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new BadRequestException(`Forbidden protocol: ${parsed.protocol}. Only http: and https: are allowed.`);
    }

    const hostname = parsed.hostname.toLowerCase();

    // 2. Check blocked hostnames
    if (this.blockedHostnames.has(hostname) || hostname.endsWith('.localhost')) {
      logger.warn('SSRF attempt blocked by hostname', { hostname });
      throw new BadRequestException(`Access to host "${hostname}" is forbidden`);
    }

    // 3. Direct IP address check
    const ipType = net.isIP(hostname);
    if (ipType === 4 && this.isPrivateOrRestrictedIpv4(hostname)) {
      logger.warn('SSRF attempt blocked by direct IPv4', { ip: hostname });
      throw new BadRequestException(`Access to private/internal IP "${hostname}" is forbidden`);
    }
    if (ipType === 6 && this.isPrivateOrRestrictedIpv6(hostname)) {
      logger.warn('SSRF attempt blocked by direct IPv6', { ip: hostname });
      throw new BadRequestException(`Access to private/internal IP "${hostname}" is forbidden`);
    }

    // 4. Resolve DNS to prevent DNS rebinding
    if (ipType === 0) {
      try {
        const lookup = await dns.lookup(hostname);
        if (lookup.family === 4 && this.isPrivateOrRestrictedIpv4(lookup.address)) {
          logger.warn('SSRF attempt blocked by DNS lookup IPv4', { hostname, resolved: lookup.address });
          throw new BadRequestException(`Host "${hostname}" resolves to forbidden IP "${lookup.address}"`);
        }
        if (lookup.family === 6 && this.isPrivateOrRestrictedIpv6(lookup.address)) {
          logger.warn('SSRF attempt blocked by DNS lookup IPv6', { hostname, resolved: lookup.address });
          throw new BadRequestException(`Host "${hostname}" resolves to forbidden IP "${lookup.address}"`);
        }
      } catch (err: any) {
        if (err instanceof BadRequestException) throw err;
        logger.warn('DNS lookup failed for URL host', { hostname, error: err.message });
        throw new BadRequestException(`Cannot resolve host "${hostname}"`);
      }
    }

    return parsed.href;
  }
}
