# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of CareBow seriously. If you discover a security vulnerability, please follow these steps:

### Do NOT

- Open a public GitHub issue
- Disclose the vulnerability publicly before it's fixed
- Exploit the vulnerability beyond what's necessary to demonstrate it

### Do

1. **Email us directly** at security@carebow.com with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes (optional)

2. **Allow time for response** - We aim to respond within 48 hours

3. **Work with us** - We'll coordinate the fix and disclosure timeline

## Security Measures

### Authentication

- NextAuth v5 with secure session management
- bcrypt password hashing with appropriate salt rounds
- JWT tokens with short expiration
- Secure cookie configuration

### Data Protection

- All API endpoints require authentication (except public routes)
- Input validation using Zod schemas
- Parameterized database queries (Prisma ORM)
- HTTPS enforced in production

### Mobile App Security

- Secure storage for sensitive data (react-native-keychain)
- Certificate pinning for API requests
- No sensitive data in logs
- Biometric authentication support

### Infrastructure

- Environment variables for secrets
- Regular dependency updates
- Security headers configured
- Rate limiting on API endpoints

## Responsible Disclosure

We believe in responsible disclosure and will:

1. Acknowledge receipt of your report within 48 hours
2. Provide an estimated timeline for the fix
3. Notify you when the vulnerability is fixed
4. Credit you in our security acknowledgments (if desired)

## Bug Bounty

We currently do not have a formal bug bounty program, but we deeply appreciate security researchers who help keep CareBow safe. Significant findings may be rewarded at our discretion.

## Security Updates

Security updates are released as patch versions and announced through:

- GitHub Security Advisories
- Release notes in CHANGELOG.md
- Direct notification to affected users (for critical issues)

---

Thank you for helping keep CareBow and our users safe!
