# VOLATILE.SH - GENESIS DOCUMENT

## Final Synthesis: From Idea to Architecture

---

## 1. Executive Summary

**volatile.sh** is a zero-knowledge, burn-after-reading secret sharing platform that enables secure, ephemeral sharing of sensitive information. Built on Cloudflare Workers and Durable Objects, it provides instant, globally-distributed secret sharing with cryptographic guarantees that:

1. **We never see your secrets** - Client-side AES-256-GCM encryption
2. **Secrets burn after reading** - Atomic delete-on-read via Durable Objects
3. **No accounts, no trace** - Zero friction, zero metadata

**Target market**: DevOps teams sharing credentials, privacy-conscious professionals, journalists/activists.

**Differentiation**: True zero-knowledge (key in URL hash), edge-native (sub-10ms latency), modern UX.

---

## 2. Recommended Stack

| Layer             | Choice                          | Source      | Why                                                                   |
| ----------------- | ------------------------------- | ----------- | --------------------------------------------------------------------- |
| **Compute**       | Cloudflare Workers              | All three   | Sub-ms cold starts, 300+ edge locations, 99.99% SLA                   |
| **State**         | Durable Objects                 | All three   | Atomic transactions, single-writer guarantee, co-located with compute |
| **Encryption**    | AES-256-GCM (Web Crypto API)    | Performance | Hardware-accelerated, ~0.1ms for 10KB                                 |
| **Frontend**      | Vanilla JS (single file)        | Simplicity  | Zero dependencies, ~30KB total, junior-friendly                       |
| **Protocol**      | JSON over HTTPS                 | Simplicity  | Trade +0.5ms for debuggability                                        |
| **TTL Cleanup**   | DO Alarm API                    | Robustness  | No cron jobs, guaranteed cleanup                                      |
| **Rate Limiting** | IP-based (100 creates/hr)       | Robustness  | Abuse prevention without breaking ZK                                  |
| **Monitoring**    | Cloudflare Analytics + External | Robustness  | Health checks, alert thresholds                                       |

---

## 3. Trade-offs Accepted

| What We Sacrifice         | Why It's OK for MVP                                      |
| ------------------------- | -------------------------------------------------------- |
| **Binary protocol**       | JSON adds ~0.5ms but dramatically improves debuggability |
| **Multi-view secrets**    | MVP is one-view-only; add later based on demand          |
| **File uploads**          | Text-only MVP; files add complexity (R2, size limits)    |
| **Custom domains**        | Use `volatile.sh` first; custom domains for paid tier    |
| **TypeScript**            | Plain JS for MVP; add TS when team grows                 |
| **Framework (React/Vue)** | Single-file HTML is simpler, faster, no build step       |

**Key insight from synthesis**: The Simplicity architecture won for MVP because shipping fast matters more than perfect performance. The Performance and Robustness patterns are documented for V2.

---

## 4. Phase 1 Action Plan (MVP)

### Step 1: Project Setup

```bash
cd /Volumes/SSD/dev/volatile.sh
npm install
```

### Step 2: Configure Domain

1. Add `volatile.sh` to Cloudflare Dashboard
2. Point nameservers to Cloudflare
3. Add route in `wrangler.toml`:
   ```toml
   routes = [{ pattern = "volatile.sh/*", custom_domain = true }]
   ```

### Step 3: Deploy

```bash
npm run deploy
```

### Step 4: Verify

1. Create a secret
2. Open the link in incognito
3. Verify secret displays
4. Refresh - should show "not found"

### Step 5: Launch

1. Post to Hacker News (Show HN)
2. Post to r/programming, r/netsec
3. Tweet with demo

---

## 5. Phase 2 Roadmap (After MVP Validation)

### If 1,000+ secrets in first 48h:

| Priority | Feature                  | Architecture Source                   |
| -------- | ------------------------ | ------------------------------------- |
| P1       | Password protection      | Robustness (PBKDF2 + AES)             |
| P1       | Multiple views (N reads) | Performance (view counter in DO)      |
| P2       | File uploads (10MB)      | Performance (R2 backend)              |
| P2       | CLI tool                 | Simplicity (`volatile send "secret"`) |
| P2       | Read receipts            | Robustness (webhook on read)          |
| P3       | Team workspaces          | Robustness (audit log, metadata only) |
| P3       | Slack integration        | All three (`/volatile` command)       |

### Monetization Trigger

At 10,000+ secrets/month:

- Launch Pro tier ($9/mo)
- Add file uploads, custom TTL, read receipts

---

## 6. Key Risks

### Risk 1: Abuse (Malware/Phishing Distribution)

- **Mitigation**: Rate limiting (100 creates/hr per IP)
- **Mitigation**: Size limits (10KB text)
- **Mitigation**: Abuse reporting (delete by ID without seeing content)
- **Monitor**: Create rate spikes, pattern detection

### Risk 2: Cloudflare Dependency

- **Mitigation**: Document escape hatch architecture
- **Mitigation**: Keep code portable (standard Web APIs)
- **Reality**: CF is stable; worry about this at scale

### Risk 3: Legal/Compliance

- **Mitigation**: Clear ToS (no illegal content)
- **Mitigation**: Zero-knowledge = can't comply with data requests
- **Mitigation**: Choose jurisdiction carefully (not US?)

---

## 7. Decision Points

### Decisions Made

| Decision    | Choice                              | Rationale                |
| ----------- | ----------------------------------- | ------------------------ |
| Framework   | None (Vanilla JS)                   | Simplicity > performance |
| Protocol    | JSON                                | Debuggability > 0.5ms    |
| Auth        | None for MVP                        | Friction = death         |
| Open source | Client-side crypto yes, backend TBD | Build trust              |

### Decisions Pending (Need User Input)

1. **Domain ownership**: Is `volatile.sh` already purchased?
2. **Cloudflare account**: Which account to deploy to?
3. **Legal entity**: Who owns this? Personal or company?
4. **Open source strategy**: When to release source?
5. **Launch timing**: This week or polish more?

---

## 8. Files Created

| File                               | Purpose                            |
| ---------------------------------- | ---------------------------------- |
| `docs/genesis/PRD.md`              | Product requirements               |
| `docs/genesis/diverge_*.md`        | Brainstorm outputs                 |
| `docs/genesis/arch_performance.md` | Speed-optimized architecture       |
| `docs/genesis/arch_robustness.md`  | Reliability-optimized architecture |
| `docs/genesis/arch_simplicity.md`  | Simplicity-optimized architecture  |
| `docs/genesis/GENESIS.md`          | This synthesis document            |
| `package.json`                     | Node.js project config             |
| `wrangler.toml`                    | Cloudflare Workers config          |
| `src/index.js`                     | Backend: Worker + Durable Object   |
| `public/index.html`                | Frontend: Single-file app          |

---

## 9. Success Metrics

### Launch (48h)

- [ ] 1,000+ secrets created
- [ ] < 5% error rate
- [ ] HN front page (bonus)

### Month 1

- [ ] 10,000+ secrets/month
- [ ] 50%+ completion rate (viewed vs expired)
- [ ] Zero security incidents
- [ ] First paying customer inquiry

### Year 1

- [ ] 100,000 secrets/month
- [ ] 1,000 Pro subscribers
- [ ] 50 Team accounts
- [ ] Featured in major publication

---

## 10. The volatile.sh Manifesto

```
Zero Disk. Zero Logs. 100% RAM.

We are not a vault. We are a fuse.
Your secrets pass through us, encrypted,
and vanish the moment they're seen.

Even we cannot read your data.
That's not a bug. That's the point.

One link. One view. Gone forever.
```

---

## Ready to Ship

The MVP is complete and ready for deployment:

```bash
cd /Volumes/SSD/dev/volatile.sh
npm run deploy
```

The hardest part is done. Now go launch it.

---

_Generated by Diamond Flow: 3 models diverged, 3 gods converged, 1 synthesis emerged._
