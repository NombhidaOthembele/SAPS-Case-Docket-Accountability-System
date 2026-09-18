# Updated SAPS Case Accountability Portal

The browser prototype now follows the requested operational flow:

1. **Officer sign-in and OTP verification** – role-aware login screen with a prototype OTP. Real SMS/email delivery must be integrated with an approved identity provider before production use.
2. **Victim statement capture** – the officer records the statement and six W's. A unique CAS number is generated immediately.
3. **Station Commander review** – newly registered cases appear in the commander's queue. Approval requires a complete six-W record and decision note.
4. **Investigator workbench** – approved cases are routed to investigators and every progress update is recorded with the six W's.
5. **Case analysis** – dashboard statistics show case status, station distribution, accountable events and case health.
6. **Accountability trail** – each case action contains the actor, timestamp, action and supporting detail.

## Run

```bash
npm install
npm start
```

Open `http://localhost:3000`.

### Prototype credentials

Any identity and password can be entered. Use the displayed OTP `482913` to complete the demo login. Select a role to view that role's workspace.

## Important security note

This is a classroom prototype and uses browser `localStorage`; it does not send real OTPs or provide production authentication. It also uses a restrained text watermark rather than copying an official SAPS logo asset. An authorised SAPS brand asset and identity-provider integration should be supplied and approved before deployment.
