# volatile.sh - Product Strategy Analysis

## Zero-Knowledge Encrypted Secret Sharing Platform

---

## 1. User Personas

### Persona A: DevOps Engineer "Security-Conscious Sam"

- **Who**: Mid-senior developer at a tech company, manages CI/CD pipelines and infrastructure
- **Pain Points**:
  - Constantly needs to share API keys, database credentials, SSH keys with teammates
  - Hates seeing secrets in Slack history that persist forever
  - Compliance requirements (SOC2, HIPAA) demand audit trails for credential sharing
  - Current solutions (1Password sharing, encrypted emails) feel clunky for one-off shares
- **Trigger Moment**: New contractor joins, needs 15 different credentials on day one

### Persona B: Journalist/Activist "Whistleblower Wendy"

- **Who**: Investigative journalist, human rights worker, or corporate whistleblower
- **Pain Points**:
  - Sources need to share sensitive documents without leaving digital trails
  - Cannot trust corporate email or messaging platforms
  - Metadata (who sent what, when) is as dangerous as content
  - Needs plausible deniability - if link is burned, evidence of sharing disappears
- **Trigger Moment**: Source wants to leak documents but fears surveillance

### Persona C: Privacy-Aware Professional "Careful Carlos"

- **Who**: Lawyer, doctor, accountant, or financial advisor
- **Pain Points**:
  - Regularly shares sensitive client information (SSNs, medical records, account numbers)
  - Email feels insecure but clients expect convenience
  - Professional liability if data leaks
  - Needs something clients can use without installing apps or creating accounts
- **Trigger Moment**: Client asks "can you just email me my tax documents?"

---

## 2. Core Features (MVP Scope)

### Must-Have for Launch

| Feature                            | Description                                           | Why Critical              |
| ---------------------------------- | ----------------------------------------------------- | ------------------------- |
| **Text Secret Sharing**            | Paste text, get link, burns after one read            | Core value prop           |
| **Client-Side AES-GCM Encryption** | Key never leaves browser, server sees only ciphertext | Zero-knowledge claim      |
| **URL Hash Key Storage**           | Key in fragment (#) never sent to server              | Technical differentiator  |
| **Atomic Delete-on-Read**          | Durable Objects ensure exactly-once read              | Burn guarantee            |
| **Expiration Fallback**            | Auto-delete after 24h/7d even if unread               | Prevents orphaned secrets |
| **No Auth Required**               | Friction-free for both sender and receiver            | Adoption driver           |
| **Mobile-Responsive UI**           | Works on any device                                   | Universal access          |

### Technical MVP Architecture

```
Browser (Sender) → Generate Key → Encrypt → POST ciphertext → CF Worker → Durable Object
                                                                              ↓
Browser (Receiver) ← Decrypt with hash key ← GET ciphertext ← DELETE atomic ←┘
```

### Validation Metrics

- Can someone share a secret in under 30 seconds?
- Does the link work exactly once?
- Is the UX clear enough that non-technical users succeed?

---

## 3. Extended Features (V2 Roadmap)

### Phase 2: Power User Features

- **File Sharing**: Upload encrypted files (limit 10MB), same burn-after-read
- **Password Protection**: Optional additional passphrase layer
- **View Count Options**: Allow 2-5 views before burn (for team shares)
- **Custom Expiration**: 1 hour to 30 days
- **Read Receipts**: Notify sender when secret is accessed (optional)
- **CLI Tool**: `volatile send "my-secret"` returns link

### Phase 3: Enterprise/Team Features

- **Team Workspaces**: Shared audit log of secrets sent (metadata only)
- **SSO Integration**: SAML/OIDC for enterprise auth
- **Compliance Dashboard**: Export logs for SOC2/HIPAA audits
- **Custom Domains**: `secrets.yourcompany.com`
- **IP Restrictions**: Only allow reads from specific CIDR ranges
- **Slack/Teams Integration**: `/volatile` command to create and share

### Phase 4: Platform Play

- **API Access**: Embed volatile.sh into other apps
- **Webhooks**: Trigger actions on secret read/expiry
- **Secret Templates**: Structured sharing (credentials, API keys with metadata)
- **Browser Extension**: Right-click to share any selected text
- **E2E Encrypted Chat**: Ephemeral conversation threads

### Phase 5: Ecosystem

- **Open Source Core**: Self-host option for paranoid enterprises
- **Audit by Third Parties**: Security certifications
- **Hardware Key Support**: WebAuthn for sender verification

---

## 4. Monetization Strategies

### Freemium Model

| Tier           | Price            | Limits                                                                         |
| -------------- | ---------------- | ------------------------------------------------------------------------------ |
| **Free**       | $0               | 50 secrets/month, 1MB files, 7-day max expiry                                  |
| **Pro**        | $9/mo            | Unlimited secrets, 100MB files, 30-day expiry, password protect, read receipts |
| **Team**       | $29/mo (5 seats) | Audit log, custom domain, Slack integration                                    |
| **Enterprise** | Custom           | SSO, compliance, SLA, dedicated support                                        |

### Alternative/Additional Revenue

- **API Usage**: $0.001 per secret for high-volume integrations
- **White-Label**: License the platform to security companies
- **Consulting**: Help enterprises implement zero-knowledge architectures
- **Sponsored by Security Tools**: "Powered by volatile.sh" for password managers

### Unit Economics Target

- CAC < $20 (organic/content marketing)
- LTV Pro user: $108/year
- Target: 5% free-to-paid conversion

---

## 5. Competitive Landscape

### Direct Competitors

| Competitor              | Strengths                  | Weaknesses                               | volatile.sh Advantage          |
| ----------------------- | -------------------------- | ---------------------------------------- | ------------------------------ |
| **One-Time Secret**     | Established, simple        | No E2E encryption, server sees plaintext | True zero-knowledge            |
| **PrivateBin**          | Open source, self-hostable | Complex UI, no mobile focus              | Modern UX, managed service     |
| **Password Pusher**     | Developer-friendly         | Limited encryption options               | Stronger crypto, CF edge speed |
| **Yopass**              | Clean UI, encrypted        | Requires setup, not as polished          | One-click, global edge         |
| **Firefox Send** (dead) | Mozilla trust              | Discontinued due to abuse                | Actively maintained            |

### Indirect Competitors

- **1Password/LastPass Sharing**: Requires both parties to have accounts
- **Signal Disappearing Messages**: Requires app install, account
- **ProtonMail**: Email-centric, not for quick shares
- **Keybase**: Complex, shutting down features

### Differentiation Matrix

```
                    Zero-Knowledge    No Setup Required    Modern UX    Edge-Fast
volatile.sh              X                  X                 X            X
One-Time Secret                             X
PrivateBin               X
Password Pusher                             X                 X
Yopass                   X                                    X
```

### Positioning Statement

> "volatile.sh is the fastest way to share a secret that disappears. Zero-knowledge encryption means even we cannot see your data. No accounts, no apps, no trace."

---

## 6. Critical Questions

### Technical Risks

1. **Abuse Prevention**: How do we stop volatile.sh from becoming a malware/phishing distribution tool?
   - Rate limiting per IP
   - Optional link preview/scan before creation
   - Abuse reporting mechanism
   - Block known malicious patterns

2. **Key in URL Hash**: What if browser extensions or analytics capture the full URL?
   - Document the risk clearly
   - Offer optional password layer
   - Consider alternative key exchange methods

3. **Durable Objects Reliability**: What happens during CF outages?
   - Multi-region replication
   - Graceful degradation messaging

### Business Risks

4. **"Good Enough" Problem**: Is the pain acute enough that people pay?
   - Validate with DevOps communities first (HN, Reddit)
   - Free tier must be generous enough to build habit

5. **Trust Paradox**: Why trust volatile.sh more than alternatives?
   - Open-source the client-side encryption code
   - Third-party security audit
   - Verifiable builds

6. **Enterprise Sales Cycle**: Can a bootstrapped startup win enterprise deals?
   - Start with self-serve Teams tier
   - Let compliance requirements pull enterprises in

### Market Risks

7. **Big Player Entry**: What if 1Password or Slack builds this?
   - Move fast, build community, open-source core
   - Deep integrations they would not prioritize

8. **Regulatory Pressure**: Could governments demand backdoors?
   - Architecture makes it technically impossible
   - Clear legal jurisdiction (choose carefully)

### Success Criteria (Year 1)

- [ ] 100,000 secrets shared monthly
- [ ] 1,000 Pro subscribers
- [ ] 50 Team accounts
- [ ] Zero security breaches
- [ ] Featured in major security/DevOps publications

---

## Summary: The Opportunity

volatile.sh sits at the intersection of three trends:

1. **Rising privacy awareness** post-Snowden, post-GDPR
2. **Remote work explosion** creating more credential sharing needs
3. **Cloudflare's edge compute** making zero-latency global apps viable

The moat is not the encryption (anyone can implement AES-GCM). The moat is:

- **Trust** built through transparency and audits
- **UX** that makes secure the default, not a hurdle
- **Integrations** that embed volatile.sh into developer workflows
- **Brand** as the "obvious choice" for ephemeral secrets

The initial wedge is DevOps teams. They feel the pain daily, have budget authority, and spread tools virally. From there, expand to privacy-conscious professionals and eventually enterprises with compliance requirements.

---

_Next steps: Technical architecture document, landing page copy, and HN Show post draft._
