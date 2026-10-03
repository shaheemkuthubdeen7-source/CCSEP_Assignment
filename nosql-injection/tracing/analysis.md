# Trace Analysis

The NoSQL Injection trace was analysed by the use of **Burp Suite request/response captures** with the corresponding **application authentication logs**. This allows the request sent to the vulnerable application to be traced through input processing, database query construction, and the resulting authentication response.

## Normal Authentication Trace - NSQL-01

The normal authentication request was sent to:

```text
POST /api/auth/login
```

with a JSON body containing `username` and `password` as ordinary string values. Burp Suite recorded a successful `HTTP/1.1 200 OK` response.

The corresponding application log recorded:

```text
Input types: username=[string], password=[string]
Executing query: {"username":"alice_admin","password":"..."}
Login successful: alice_admin (Administrator)
POST /api/auth/login HTTP/1.1" 200
```

This is the baseline trace. Both authentication fields were received as strings, the resulting query used ordinary values, and authentication completed successfully.

An incorrect-password test(NSQL-02) produced a `401 Unauthorized` response and a corresponding `Login failed` log entry. This demonstrates that the application is capable of rejecting an ordinary invalid authentication attempt before the NoSQL Injection tests were performed.

## Targeted NoSQL Injection Trace - NSQL-03

The first controlled NoSQL Injection changed the password value from a string into an object containing the `$ne` operator:

```json
{
    "username": "alice_admin",
    "password": {
        "$ne": ""
    }
}
```

The Burp capture showed that the application returned:

```text
HTTP/1.1 200 OK
```

with an authentication-success response.

The corresponding server log at **12:09:36** recorded:

```text
Input types: username=[string], password=[object]
Executing query: {"username":"alice_admin","password":{"$ne":""}}
Login successful: alice_admin (Administrator)
POST /api/auth/login HTTP/1.1" 200
```

The trace shows a clear change from the normal request. The password was no longer interpreted as a string; it was received as an object. The application subsequently incorporated the object containing `$ne` into the database query and returned a successful authentication result.

The matching timestamp and endpoint information connect the Burp request to the server-side log event.

## Full NoSQL Injection Trace - NSQL-04

NoSQL operators in both authentication fields:

```json
{
    "username": {
        "$ne": ""
    },
    "password": {
        "$gt": ""
    }
}
```

Burp Suite recorded:

```text
HTTP/1.1 200 OK
```

and an authentication-success response.

The corresponding application log at **12:10:39** recorded:

```text
Input types: username=[object], password=[object]
Executing query: {"username":{"$ne":""},"password":{"$gt":""}}
Login successful: alice_admin (Administrator)
POST /api/auth/login HTTP/1.1" 200
```

The trace shows evidance of vulnerable behaviour. Unlike the normal request, both authentication fields were received as objects rather than strings. The application then constructed a query containing the supplied `$ne` and `$gt` operators and returned a successful authentication response.

## Trace Comparison

| Trace | Input structure | Query structure | HTTP result | Application result |
|---|---|---|---|---|
| Normal login | string + string | normal values | `200 OK` | Successful authentication |
| Wrong password | string + string | normal values | `401 Unauthorized` | Authentication failed |
| Targeted NoSQL Injection | string + object | `$ne` operator | `200 OK` | Successful authentication |
| Full NoSQL Injection | object + object | `$ne` + `$gt` operators | `200 OK` | Successful authentication |


## Mitigated NoSQL Injection Trace - Secure Build

The NoSQL Injection tests were repeated against the secure authentication implementation using the same controlled operator-based inputs. Burp Suite was used to capture the HTTP request and response, while the application authentication logs provided the corresponding server-side trace.

### Secure Normal Authentication Trace - MNSQL-01

A normal login request continued to work in the secure implementation. The application log recorded:

```text
[AUTH-SECURE] [2026-10-03T03:27:28.659Z] Login attempt from IP: ::ffff:127.0.0.1
[AUTH-SECURE] Input types: username=[string], password=[string]
[AUTH-SECURE] Executing validated equality query for username: alice_admin
[AUTH-SECURE] Login successful: alice_admin (Administrator)
POST /api/auth/login HTTP/1.1" 200
```

Burp Suite recorded an `HTTP/1.1 200 OK` response for the valid credentials.

This confirms that the secure implementation continued to support legitimate authentication while processing ordinary username and password values as strings.

### Secure Wrong-Password Trace - MNSQL-02

A normal incorrect-password request was also rejected:

```text
[AUTH-SECURE] [2026-10-03T03:28:23.474Z] Login attempt from IP: ::ffff:127.0.0.1
[AUTH-SECURE] Input types: username=[string], password=[string]
[AUTH-SECURE] Executing validated equality query for username: alice_admin
[AUTH-SECURE] Login failed for user: alice_admin
POST /api/auth/login HTTP/1.1" 401
```

Burp Suite recorded `HTTP/1.1 401 Unauthorized`.

This provides a normal negative authentication trace for comparison with the rejected NoSQL operator inputs.

### Mitigated Targeted NoSQL Injection Trace - MNSQL-03

The targeted NoSQL Injection request used an object containing the `$ne` operator in the password field:

```json
{
    "username": "alice_admin",
    "password": {
        "$ne": ""
    }
}
```

The secure application rejected the request. Burp Suite recorded:

```text
HTTP/1.1 400 Bad Request
```

with the response message:

```json
{
  "status": "error",
  "message": "Username and password must be valid strings."
}
```

The corresponding server log recorded:

```text
[AUTH-SECURE] [2026-10-03T03:29:37.145Z] Login attempt from IP: ::ffff:127.0.0.1
[AUTH-SECURE] Input types: username=[string], password=[object]
[AUTH-SECURE] Rejected: invalid credential type or length.
POST /api/auth/login HTTP/1.1" 400
```

The trace shows that the password was received as an object rather than a string. Instead of incorporating the supplied `$ne` operator into a database query, the secure implementation rejected the request during input validation and returned `400 Bad Request`.

### Mitigated Full NoSQL Injection Trace - MNSQL-04

The full NoSQL Injection request supplied operators in both authentication fields:

```json
{
    "username": {
        "$ne": ""
    },
    "password": {
        "$gt": ""
    }
}
```

Burp Suite recorded:

```text
HTTP/1.1 400 Bad Request
```

with the same validation response:

```json
{
  "status": "error",
  "message": "Username and password must be valid strings."
}
```

The corresponding server log recorded:

```text
[AUTH-SECURE] [2026-10-03T03:30:32.780Z] Login attempt from IP: ::ffff:127.0.0.1
[AUTH-SECURE] Input types: username=[object], password=[object]
[AUTH-SECURE] Rejected: invalid credential type or length.
POST /api/auth/login HTTP/1.1" 400
```

Both fields were therefore identified as objects and the request was rejected before a validated equality query was executed.

### Mitigated NoSQL Trace Comparison

| Trace | Input structure | Secure handling | HTTP result | Application result |
|---|---|---|---|---|
| Normal login | string + string | Validated equality query | `200 OK` | Successful authentication |
| Wrong password | string + string | Validated equality query | `401 Unauthorized` | Authentication failed |
| Targeted NoSQL Injection | string + object | Input validation rejected object | `400 Bad Request` | Request rejected |
| Full NoSQL Injection | object + object | Input validation rejected objects | `400 Bad Request` | Request rejected |


### Overall Secure Trace Conclusion

The mitigated NoSQL Injection tests show that the secure implementation no longer accepts structured operator values as username or password inputs. The targeted `$ne` request and the full `$ne`/`$gt` request both produced `400 Bad Request` responses, and the server logs recorded the invalid object input types and rejection decision.

The normal authentication trace continued to return `200 OK`, while an ordinary incorrect password returned `401 Unauthorized`. This provides evidence that the observed mitigation specifically affects the abnormal structured inputs while normal authentication behaviour remains available.
