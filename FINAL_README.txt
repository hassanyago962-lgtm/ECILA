ECILA 2.0 — FINAL DEPLOYABLE HANDOFF

This package is the final application handoff prepared for owner deployment.

START HERE:
1. Read docs/LAUNCH_RUNBOOK.md
2. Provision PostgreSQL, private S3-compatible storage, hosting, email, AI providers and a domain.
3. Configure .env.example values in the hosting secret manager.
4. Run: npm install
5. Run: npm run verify
6. Run: npm run preflight
7. Run: npm run build
8. Start: npm start
9. Start worker: npm run worker
10. Start document worker: python python_worker/worker.py
11. Create your admin with scripts/create-admin.mjs
12. Test /api/health and complete the smoke-test checklist.

IMPORTANT:
The final public URL is created by the hosting provider after you connect your domain. This package does not contain a fake or temporary public link.

The development environment used to prepare this package could not complete npm dependency installation because its network install operation timed out. Therefore the final `npm run build` must be executed on the owner's hosting environment after dependencies are installed. Structural verification, Node script checks, Python worker compilation, and non-environment TypeScript diagnostic checks were completed here.
