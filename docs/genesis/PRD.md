# volatile.sh - Product Requirements Document

## Product Vision

**volatile.sh** is a zero-knowledge, burn-after-reading secret sharing platform that enables secure, ephemeral sharing of sensitive information. Built on Cloudflare Workers and Durable Objects, it provides instant, globally-distributed secret sharing with mathematical guarantees that data cannot be retrieved after viewing. Our mission: make secure the default, not the exception.

---

## Target Users

### Primary Persona: DevSecOps Engineer

- **Profile**: Senior developer/DevOps at tech companies
- **Need**: Share API keys, credentials, SSH keys instantly without persistent trails
- **Pain**: Slack DMs are insecure, password managers require both parties to have accounts
- **Trigger**: New team member needs 15 credentials on day one

### Secondary Persona: Compliance-Bound Professional

- **Profile**: Lawyers, doctors, accountants, HR managers
- **Need**: Share sensitive PII/PHI while meeting regulatory requirements
- **Pain**: Email feels insecure, client portals are expensive
- **Trigger**: "Can you just email me my tax documents?"

### Tertiary Persona: Privacy Advocate

- **Profile**: Journalists, activists, whistleblower handlers
- **Need**: Zero-trace communication with sources
- **Pain**: All mainstream tools leave audit trails
- **Trigger**: Source needs plausible deniability

---

## MVP Features (Prioritized)

### P0 - Must Have for Launch

| #   | Feature                            | Description                              | Success Criteria           |
| --- | ---------------------------------- | ---------------------------------------- | -------------------------- |
| 1   | **Text Secret Sharing**            | Paste text, get shareable link           | < 30 seconds to share      |
| 2   | **Client-Side AES-GCM Encryption** | Key never leaves browser                 | Zero server-side plaintext |
| 3   | **URL Hash Key Storage**           | Decryption key in fragment (#)           | Key invisible to server    |
| 4   | **Atomic Delete-on-Read**          | Durable Objects ensure exactly-once read | 100% burn guarantee        |
| 5   | **Time-Based Expiration**          | Auto-delete after TTL (1h/24h/7d)        | No orphaned secrets        |
| 6   | **No Auth Required**               | Zero friction for sender and receiver    | Works without account      |
| 7   | **Mobile-Responsive UI**           | Terminal-style dark theme                | Works on all devices       |

### P1 - Post-Launch

| #   | Feature             | Description                      |
| --- | ------------------- | -------------------------------- |
| 8   | Password Protection | Additional passphrase layer      |
| 9   | File Upload         | Encrypted files up to 10MB       |
| 10  | CLI Tool            | `volatile send "secret"`         |
| 11  | Read Receipts       | Notify sender when secret viewed |
| 12  | Multiple Views      | Allow N reads before burn        |

### P2 - Growth Phase

| #   | Feature                 | Description               |
| --- | ----------------------- | ------------------------- |
| 13  | Team Workspaces         | Audit log (metadata only) |
| 14  | Custom Domains          | `secrets.company.com`     |
| 15  | Slack/Teams Integration | `/volatile` command       |
| 16  | API Access              | Programmatic creation     |
| 17  | SSO Integration         | SAML/OIDC                 |

---

## Success Metrics

### MVP Launch (First 48h)

- [ ] 1,000+ secrets created
- [ ] < 5% error rate
- [ ] HN/Reddit organic traffic

### Month 1

- [ ] 10,000+ secrets shared
- [ ] 50%+ completion rate (secrets viewed vs expired)
- [ ] Zero security incidents

### Year 1

- [ ] 100,000 secrets/month
- [ ] 1,000 Pro subscribers ($9/mo)
- [ ] 50 Team accounts ($29/mo)
- [ ] Featured in major DevOps publications

---

## Technical Architecture (Overview)

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                        │
├─────────────────────────────────────────────────────────────────┤
│  1. Generate 256-bit AES key                                    │
│  2. Encrypt secret with AES-GCM                                 │
│  3. Send ciphertext to server                                   │
│  4. Receive URL with key in hash fragment (#)                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │ POST /api/create
                            │ (ciphertext only)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE WORKER                            │
├─────────────────────────────────────────────────────────────────┤
│  - Route API requests                                           │
│  - Generate unique DO IDs                                       │
│  - Serve static frontend                                        │
│  - Handle CORS                                                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DURABLE OBJECT (Vault)                       │
├─────────────────────────────────────────────────────────────────┤
│  - Store encrypted payload                                      │
│  - Atomic read + delete transaction                             │
│  - TTL alarm for auto-expiration                                │
│  - Single-writer guarantee                                      │
└─────────────────────────────────────────────────────────────────┘
```

### Security Properties

- **Zero-Knowledge**: Server never sees plaintext or encryption key
- **Forward Secrecy**: Each secret has unique key, deleted after read
- **No Metadata**: No accounts, no logs, no cookies
- **Edge-Native**: Sub-100ms latency globally

---

## Competitive Positioning

```
                         SIMPLE UX
                            │
        volatile.sh    ★    │
                            │
     CONSUMER ──────────────┼────────────── ENTERPRISE
                            │
                    Vault   │    1Password
                            │
                        COMPLEX
```

| vs Competitor   | Our Advantage                    |
| --------------- | -------------------------------- |
| Privnote        | True zero-knowledge, open source |
| One-Time Secret | Edge-native, modern UX           |
| Password Pusher | No setup, faster                 |
| Bitwarden Send  | No account required              |
| HashiCorp Vault | Human-friendly, instant          |

### Positioning Statement

> "volatile.sh is the fastest way to share a secret that disappears. Zero-knowledge encryption means even we cannot see your data. No accounts, no apps, no trace."

---

## Open Questions

1. **Abuse Prevention**: How to prevent malware/phishing distribution without compromising zero-knowledge?
   - Rate limiting, content-length limits, abuse reporting

2. **URL Hash Security**: Browser extensions/analytics capturing full URLs?
   - Document risk, offer password layer

3. **Enterprise Sales**: Self-serve or sales-assisted?
   - Start self-serve, let compliance pull enterprises in

4. **Open Source Strategy**: Core vs Premium?
   - Open source client encryption, proprietary hosted service

---

## Brand Guidelines

### Name: volatile.sh

- "Volatile" = ephemeral, unstable, disappears
- `.sh` = shell script association, developer-friendly

### Visual Identity

- **Theme**: Terminal/hacker aesthetic
- **Colors**: Black (#0d0d0d) + Neon green (#33ff00)
- **Typography**: Monospace (Courier New, Fira Code)
- **Tagline**: "Zero Disk. Zero Logs. 100% RAM."

---

_Document Status: Ready for Architecture Design_
