# Security Policy

## Supported Versions

We actively provide security patches for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of ContextLion seriously. Because ContextLion handles raw web page DOM trees and executes inside the browser's security boundaries, we implement strict defenses including:

- **Cloned DOM Execution**: Readability is never executed directly on the live page DOM.
- **Strict Sanitization**: All HTML extracted from external pages is sanitized via DOMPurify to strip scripts and harmful attributes before markdown conversion.
- **Zero Remote Code**: No scripts are loaded dynamically from remote URLs.

If you believe you have found a security issue or vulnerability:

1. Please do **not** disclose the issue publicly in an open GitHub issue.
2. Email details of the issue to security@malilion.dev or open a Private Security Advisory on GitHub.
3. We will acknowledge receipt within 48 hours and coordinate a fix and release.
