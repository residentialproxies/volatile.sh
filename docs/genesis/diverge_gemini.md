# volatile.sh - Product Strategy Analysis

## Zero-Knowledge Secret Sharing for the Privacy-First Era

---

## 1. User Personas

### Persona A: The Security-Conscious Developer ("DevSecOps Dana")

**Profile:**

- Senior developer or DevOps engineer at a startup/mid-size company
- Age 28-42, works remotely or hybrid
- Uses CLI daily, comfortable with technical tools

**Pain Points:**

- Sharing API keys, database passwords, and SSH keys with teammates is a constant friction
- Current solutions: Slack DMs (insecure), password managers (requires shared accounts), encrypted email (cumbersome)
- Audit trail anxiety: "Did that credential I shared 6 months ago get deleted?"
- Compliance pressure from SOC 2, ISO 27001 requirements

**Job to be Done:**
"I need to share a production database password with a contractor RIGHT NOW, know they received it, and guarantee it disappears after."

---

### Persona B: The Privacy Advocate ("Journalist Jordan")

**Profile:**

- Investigative journalist, activist, or whistleblower handler
- Works with sensitive sources who need anonymity
- Operates in potentially hostile information environments

**Pain Points:**

- Cannot trust mainstream communication tools (email, messaging apps)
- Needs to receive sensitive documents/information without creating trails
- Sources are non-technical and need dead-simple UX
- Metadata exposure is as dangerous as content exposure

**Job to be Done:**
"I need my source to send me information in a way that leaves no trace on either end, and requires zero technical knowledge from them."

---

### Persona C: The Paranoid Professional ("Lawyer/Doctor/Accountant Pat")

**Profile:**

- Professional bound by confidentiality obligations (attorney-client, HIPAA, fiduciary)
- Age 35-55, not deeply technical but understands risk
- Handles sensitive client information daily

**Pain Points:**

- Email feels unsafe but it is the default
- Client portals are expensive and clunky
- Needs to send SSNs, account numbers, case details
- Fear of data breach liability

**Job to be Done:**
"I need to send my client their tax documents in a way that I can prove was secure, without making them download an app or create an account."

---

## 2. Core Features (MVP Scope)

### Must-Have for Launch

| Feature                       | Description                                                  | Technical Note                      |
| ----------------------------- | ------------------------------------------------------------ | ----------------------------------- |
| **Zero-Knowledge Encryption** | AES-256-GCM client-side encryption, key never touches server | Key in URL fragment (#) only        |
| **One-Time Read**             | Secret auto-destructs on first view                          | Durable Objects atomic state        |
| **Time-Based Expiry**         | Set TTL: 5min, 1hr, 24hr, 7 days                             | Alarm API for cleanup               |
| **No Accounts Required**      | Instant use, no signup friction                              | Session-less architecture           |
| **Clean Sharing UI**          | Generate link, copy to clipboard                             | Mobile-responsive                   |
| **View Confirmation**         | Know when your secret was read                               | Optional email/webhook notification |
| **Password Protection**       | Additional passphrase layer                                  | Client-side PBKDF2 + AES            |

### MVP User Flow

```
Creator                              Recipient
   |                                     |
   |  1. Paste secret + set options      |
   |  2. Client encrypts (key in #hash)  |
   |  3. Get shareable link              |
   |         -------- LINK -------->     |
   |                                     |  4. Opens link
   |                                     |  5. Client decrypts
   |                                     |  6. Secret displayed
   |                                     |  7. DO deletes on read
   |  8. Gets notification (optional)    |
   |                                     |
```

### Technical MVP Stack

- **Runtime:** Cloudflare Workers (edge compute)
- **State:** Durable Objects (atomic operations, single-writer guarantee)
- **Storage:** DO transactional storage (encrypted at rest)
- **Frontend:** Vanilla JS or Preact (minimal bundle)
- **Domain:** volatile.sh (memorable, implies ephemerality)

---

## 3. Extended Features (V2 Roadmap)

### Phase 2: Power User Features

| Feature                | Value Proposition                                        |
| ---------------------- | -------------------------------------------------------- |
| **File Upload**        | Share encrypted files up to 25MB (R2 backend)            |
| **CLI Tool**           | `volatile create "secret" --ttl 1h` for DevOps workflows |
| **Slack/Teams Bot**    | `/volatile share @user` inline secret sharing            |
| **Burn Proof**         | Cryptographic receipt that secret was destroyed          |
| **Multiple Views**     | Allow N reads before destruction                         |
| **IP/Geo Restriction** | Only viewable from specific locations                    |
| **Custom Domains**     | `secrets.yourcompany.com` white-label                    |

### Phase 3: Platform Features

| Feature                  | Value Proposition                                  |
| ------------------------ | -------------------------------------------------- |
| **Team Workspaces**      | Shared secret history, audit logs, access controls |
| **API Access**           | Programmatic secret creation for CI/CD pipelines   |
| **Compliance Dashboard** | SOC 2 / HIPAA audit trail exports                  |
| **SSO Integration**      | Okta, Azure AD, Google Workspace                   |
| **Retention Policies**   | Company-wide TTL defaults and overrides            |
| **Secret Templates**     | Pre-formatted for API keys, passwords, PII         |
| **Webhooks**             | Notify external systems on create/read/expire      |
| **Self-Hosted Option**   | On-prem deployment for enterprise                  |

### Phase 4: Ecosystem Expansion

- **Browser Extension:** Right-click to share selected text securely
- **Mobile Apps:** Native iOS/Android with biometric unlock
- **VS Code Extension:** Share secrets directly from editor
- **GitHub Action:** Inject secrets into CI without exposing in logs
- **Terraform Provider:** Infrastructure-as-code secret sharing

---

## 4. Monetization Strategy

### Freemium Model

**Free Tier (Generous)**

- Unlimited secrets
- Up to 10KB per secret
- TTL up to 7 days
- Basic password protection
- Community support

**Pro Tier ($8/month per user)**

- File uploads up to 100MB
- Custom TTL (up to 30 days)
- View notifications (email/webhook)
- Priority support
- No branding on share pages

**Team Tier ($15/month per user, min 5)**

- Everything in Pro
- Team workspaces
- Audit logs (90 days)
- SSO integration
- API access (10K calls/month)
- Custom subdomain

**Enterprise (Custom pricing)**

- Everything in Team
- Unlimited audit retention
- Compliance certifications
- Dedicated support
- Custom SLAs
- Self-hosted option
- Volume discounts

### Revenue Projections (Conservative)

| Metric           | Year 1 | Year 2 | Year 3 |
| ---------------- | ------ | ------ | ------ |
| Free Users       | 50K    | 200K   | 500K   |
| Pro Users        | 500    | 3K     | 10K    |
| Team Users       | 100    | 1K     | 5K     |
| Enterprise Deals | 2      | 10     | 30     |
| ARR              | $70K   | $500K  | $2M    |

### Alternative Revenue Streams

1. **White-Label Licensing:** One-time fee for on-prem deployment
2. **Security Audit Reports:** Third-party penetration test results as premium add-on
3. **Compliance Certification Assistance:** Consulting for regulated industries
4. **API Marketplace:** Per-transaction pricing for high-volume integrations

---

## 5. Competitive Landscape

### Direct Competitors

| Competitor          | Strengths                 | Weaknesses                               | Positioning              |
| ------------------- | ------------------------- | ---------------------------------------- | ------------------------ |
| **PrivateBin**      | Open source, self-hosted  | Complex setup, no managed option         | Privacy purists          |
| **One-Time Secret** | Simple, established       | Dated UI, limited features, US-hosted    | Basic users              |
| **Password Pusher** | Open source, good UX      | Requires self-hosting for privacy        | Technical teams          |
| **Bitwarden Send**  | Trusted brand, integrated | Requires account, part of larger product | Existing Bitwarden users |
| **1Password Share** | Enterprise trust          | Requires 1Password subscription          | 1Password shops          |

### Indirect Competitors

- **Slack/Teams DMs:** Convenient but insecure and persistent
- **Encrypted Email (ProtonMail, Tutanota):** Secure but not ephemeral
- **Signal Disappearing Messages:** Mobile-first, requires app installation
- **HashiCorp Vault:** Overkill for simple sharing, complex setup

### volatile.sh Differentiation

```
                    SIMPLE
                       |
       volatile.sh  ★  |
                       |
   CONSUMER ───────────┼─────────── ENTERPRISE
                       |
              Vault    |    1Password
                       |
                    COMPLEX
```

**Key Differentiators:**

1. **True Zero-Knowledge:** Key never leaves client, provably secure
2. **Edge-Native:** Cloudflare Workers = global low-latency, no origin server
3. **Durable Objects:** Atomic delete guarantee (not eventual consistency)
4. **Developer-First:** CLI, API, integrations from day one
5. **Modern Stack:** Not a PHP app from 2012
6. **Transparent Security:** Open source client, published audit

---

## 6. Critical Questions

### Technical Viability

1. **Can Durable Objects handle scale?**
   - Each secret is its own DO instance (horizontal scaling built-in)
   - Need to validate: cost at 1M+ secrets/month

2. **Is the cryptography actually sound?**
   - AES-256-GCM is proven, but implementation matters
   - MUST: Third-party security audit before major launch

3. **What happens if Cloudflare goes down?**
   - Secrets are ephemeral anyway
   - Consider: Multi-region redundancy via DO replication

### Business Viability

4. **Will people pay for this?**
   - Validation: Run a smoke test with pricing page before building teams features
   - Signal: Enterprise inquiries from free users

5. **Is the market big enough?**
   - TAM: Every developer sharing secrets (millions)
   - SAM: Teams with security requirements (100K+ companies)
   - SOM: Early adopters on HN/Twitter (10K teams)

6. **Can we acquire users cost-effectively?**
   - Organic: Dev community word-of-mouth, Show HN
   - Content: "How we built zero-knowledge encryption" blog posts
   - Partnerships: Security-focused dev tool companies

### Regulatory/Legal

7. **What about illegal use cases?**
   - Need: Clear ToS, abuse reporting mechanism
   - Consider: Rate limiting, CAPTCHA for anonymous creation
   - Reality: Bad actors have many options; do not over-engineer

8. **GDPR/Data Residency?**
   - Cloudflare offers jurisdiction hints for DOs
   - EU customers may require EU-only data storage
   - Solution: Geo-fenced deployments for enterprise

### Competitive

9. **What if Cloudflare builds this?**
   - They build infrastructure, not consumer products
   - First-mover advantage in niche matters
   - Acquisition potential: Feature of Cloudflare Zero Trust

10. **What if 1Password/Bitwarden copies it?**
    - Their users already pay for their product
    - volatile.sh wins on simplicity and no-account requirement
    - Different markets: integrated vs. standalone

---

## Summary: The volatile.sh Opportunity

**The Thesis:**
Secret sharing is a daily pain point for millions of developers and professionals. Current solutions are either insecure (Slack DMs), complex (Vault), or require commitment (password manager subscriptions). volatile.sh occupies the white space: instant, zero-knowledge, ephemeral sharing with no accounts required.

**Why Now:**

1. Zero Trust security is becoming standard expectation
2. Remote work increased ad-hoc credential sharing
3. Cloudflare Workers/DO enables this architecture cost-effectively for the first time
4. Growing privacy consciousness post-GDPR

**First Milestone:**
Launch MVP on Hacker News. Target: 1,000 secrets created in first 48 hours. If hit, proceed to Pro tier development.

---

_"The best secrets are the ones that no longer exist."_
