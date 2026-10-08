# DevStream: Software Architecture & Requirements Specification (SRS)

> **Document Version:** 1.0.0  
> **Target System:** DevStream Platform v1.x  
> **Author:** Senior Systems Architect & Engineering Team  
> **Status:** Approved / B.Tech IT Final Year Project Specification  
> **Date:** October 2026  

---

## Executive Summary

**DevStream** is an advanced, developer-centric blogging and live portfolio aggregation platform engineered specifically for computer science and engineering students. Traditional publishing platforms (such as Medium or WordPress) lack native support for software engineering lifecycle artifacts, structured code blocks, mathematical formulations (LaTeX), and live repository metrics. DevStream bridges this gap by offering a specialized rich-text publishing environment integrated with artificial intelligence for automated summarization and tagging, coupled with real-time portfolio orchestration from external developer ecosystems like GitHub.

The platform employs a **Feature-Driven Monorepo Architecture** utilizing **Polyglot Persistence**. High-frequency, ACID-compliant relational transactions (identity, authentication, role-based authorization) are handled by a local **PostgreSQL** instance, while dynamic, schema-less content artifacts (rich-text HTML/Markdown, version histories, AI metadata) reside in **MongoDB Atlas**. The central orchestrator is implemented in **Spring Boot (Java 17+)**, utilizing `@Async` thread-pool dispatch to communicate asynchronously with a standalone **Python FastAPI** microservice powered by **LangChain** and Large Language Models (LLMs). The user experience is delivered through a modern **React.js** single-page application built with **Vite** and **Tailwind CSS**, featuring client-side XSS sanitization via **DOMPurify** and rich-text editing through **TipTap/Quill**.

---

## Table of Contents

1. [Introduction](#1-introduction)
   * 1.1 [Purpose](#11-purpose)
   * 1.2 [Scope](#12-scope)
   * 1.3 [Target Audience](#13-target-audience)
2. [System Architecture & Polyglot Persistence](#2-system-architecture--polyglot-persistence)
   * 2.1 [Architectural Pattern](#21-architectural-pattern)
   * 2.2 [Polyglot Persistence Rationale](#22-polyglot-persistence-rationale)
   * 2.3 [End-to-End System Data Flow](#23-end-to-end-system-data-flow)
   * 2.4 [System Architecture Diagrams](#24-system-architecture-diagrams)
3. [Module Breakdown](#3-module-breakdown)
   * 3.1 [Module 1: Identity & Access Management (IAM)](#31-module-1-identity--access-management-iam)
   * 3.2 [Module 2: Core Content Engine](#32-module-2-core-content-engine)
   * 3.3 [Module 3: Interactive Frontend](#33-module-3-interactive-frontend)
   * 3.4 [Module 4: AI Microservice](#34-module-4-ai-microservice)
   * 3.5 [Module 5: Orchestration & Portfolio Aggregation](#35-module-5-orchestration--portfolio-aggregation)
4. [Security & Role-Based Access Control (RBAC)](#4-security--role-based-access-control-rbac)
   * 4.1 [Stateless Authentication Architecture](#41-stateless-authentication-architecture)
   * 4.2 [Cross-Site Scripting (XSS) Mitigation Strategy](#42-cross-site-scripting-xss-mitigation-strategy)
   * 4.3 [RBAC Permission Matrix](#43-rbac-permission-matrix)
   * 4.4 [API Route Protection Rules](#44-api-route-protection-rules)
5. [Database Schema Design](#5-database-schema-design)
   * 5.1 [PostgreSQL Relational Schema](#51-postgresql-relational-schema)
   * 5.2 [MongoDB Document Schema](#52-mongodb-document-schema)
   * 5.3 [Entity-Relationship Diagram](#53-entity-relationship-diagram)
6. [Non-Functional Requirements (NFRs)](#6-non-functional-requirements-nfrs)
   * 6.1 [Performance Metrics](#61-performance-metrics)
   * 6.2 [Security & Governance](#62-security--governance)
   * 6.3 [Fault Tolerance & Circuit Breaking](#63-fault-tolerance--circuit-breaking)
   * 6.4 [Scalability & Monorepo Structure](#64-scalability--monorepo-structure)

---

## 1. Introduction

### 1.1 Purpose
This Technical Architecture Document and Software Requirements Specification (SRS) provides an exhaustive breakdown of the design, module interactions, data persistence models, security protocols, and operational requirements for the **DevStream** platform. It serves as the primary technical specification for developers, systems architects, and academic evaluators.

### 1.2 Scope
The scope of DevStream encompasses:
* **User Lifecycle & IAM:** Secure registration, authentication, profile curation, academic affiliation management, and role assignment using JSON Web Tokens (JWT).
* **Rich-Text Publishing:** WYSIWYG article creation with code syntax highlighting, inline LaTeX math rendering, image embedding, version control history, and status flags (`Draft` vs. `Published`).
* **Automated AI Intelligence:** Natural Language Processing (NLP) pipeline running in an isolated Python environment that generates TL;DR abstracts and classifies technical taxonomy tags.
* **Portfolio Aggregation:** Dynamic, real-time stitching of relational identity data, document-based publications, and GitHub API repository telemetry into a unified developer portfolio.

### 1.3 Target Audience
This document is prepared for:
1. **Academic Review Boards & Project Guides:** For evaluation as a B.Tech Information Technology final-year project.
2. **Software Engineers & Contributors:** For maintaining, extending, and deploying the codebase.
3. **DevOps & System Administrators:** For understanding containerization, microservice communication, and polyglot database topologies.

---

## 2. System Architecture & Polyglot Persistence

### 2.1 Architectural Pattern
DevStream is structured as a **Feature-Driven Monorepo with Microservice Integration**. The repository is organized into distinct domain folders (`devstream-frontend`, `devstream-backend`, `devstream-ai`), facilitating simplified local execution via Docker Compose while maintaining strict boundary separation between operational domains.

```
devstream-monorepo/
├── devstream-frontend/      # React.js + Vite + Tailwind CSS + TipTap Editor
├── devstream-backend/       # Spring Boot (Java 17+) Orchestrator & REST API
├── devstream-ai/            # FastAPI + LangChain + Python NLP Microservice
└── docker-compose.yml       # Infrastructure Orchestration (PostgreSQL, Mongo, Services)
```

### 2.2 Polyglot Persistence Rationale
Rather than forcing all application state into a single relational database engine or an unindexed document store, DevStream implements **Polyglot Persistence**:

| Database Engine | Storage Paradigm | Domain Scope | Justification |
| :--- | :--- | :--- | :--- |
| **PostgreSQL** (Local Engine) | Relational (ACID) | User Accounts, Auth Credentials, Roles, GitHub Profiles | Strict relational integrity, foreign key constraints, sub-millisecond indexed joins, and immutable audit logs. |
| **MongoDB Atlas** (Cloud Engine) | Document (BSON) | Articles, Revisions, AI Summaries, Dynamic Tags, Views | Schema-less flexibility for complex rich-text HTML/Markdown structures, arrays of tags, nested version snapshots, and rapid document retrieval. |

### 2.3 End-to-End System Data Flow

1. **Content Authoring & Client Sanitization:**
   * The user composes an article using the TipTap/Quill WYSIWYG editor in `devstream-frontend`.
   * Before sending payload over HTTP, `DOMPurify.sanitize()` strips unsafe HTML vectors (`<script>`, `onload`, `javascript:`), preserving safe tags (`<code>`, `<pre>`, `<h1>-<h6>`, `<p>`).
2. **Spring Boot Orchestration:**
   * The sanitized request arrives at `devstream-backend` with a JWT `Authorization: Bearer <token>` header.
   * `JwtAuthenticationFilter` validates token signature against PostgreSQL user records.
   * Upon successful authorization, the article payload is persisted into MongoDB Atlas with a state of `DRAFT` or `PUBLISHED`.
3. **Asynchronous AI Microservice Call:**
   * Spring Boot triggers an asynchronous task using `@Async` and `WebClient` to invoke the `devstream-ai` FastAPI endpoint (`POST /api/v1/summarize`).
   * The Python microservice processes article text via LangChain LLM chains, generating a 2-3 sentence summary and an array of tech tags (`["java", "spring-boot", "react"]`).
   * The AI microservice returns the generated metadata, which is patched into the MongoDB article document asynchronously without blocking the user response.
4. **Live Portfolio Aggregation:**
   * When a viewer requests a user profile, Spring Boot fetches identity data from PostgreSQL, published articles from MongoDB Atlas, and repository statistics directly from the GitHub REST API.
   * The responses are consolidated into a single unified `LivePortfolioDTO` JSON payload.

### 2.4 System Architecture Diagrams

#### Component Architecture Diagram

```mermaid
flowchart TD
    subgraph Client Tier ["Client Tier (Browser)"]
        UI["React.js + Vite SPA"]
        Editor["TipTap / Quill Editor"]
        DOMP["DOMPurify XSS Filter"]
        UI --> Editor
        Editor --> DOMP
    end

    subgraph API Tier ["API & Orchestration Tier"]
        JWT["JWT Auth Filter"]
        SBoot["Spring Boot Backend (Java 17+)"]
        AsyncEngine["@Async Task Executor"]
        Resilience["Resilience4j Circuit Breaker"]
        
        DOMP -->|HTTPS / JSON + Bearer JWT| JWT
        JWT --> SBoot
        SBoot --> AsyncEngine
        SBoot --> Resilience
    end

    subgraph AI Tier ["AI Microservice Tier"]
        FastAPI["Python FastAPI Service"]
        LangChain["LangChain Engine"]
        LLM["LLM Provider (OpenAI/Gemini)"]
        
        AsyncEngine -->|Async HTTP POST /api/v1/summarize| FastAPI
        FastAPI --> LangChain
        LangChain --> LLM
    end

    subgraph Data Tier ["Polyglot Persistence & External APIs"]
        PG[("PostgreSQL\n(User Accounts & RBAC)")]
        Mongo[("MongoDB Atlas\n(Articles & Revisions)")]
        GitHub["GitHub REST API\n(Pinned Repos)"]
        
        SBoot -->|JPA / Hibernate| PG
        SBoot -->|Spring Data Mongo| Mongo
        Resilience -->|REST Client| GitHub
    end
```

#### Sequence Diagram: Article Publication & Async AI Enrichment

```mermaid
sequenceDiagram
    autonumber
    actor Author as Student Author
    participant FE as React Frontend
    participant SB as Spring Boot Backend
    participant PG as PostgreSQL DB
    participant MG as MongoDB Atlas
    participant AI as Python AI Service

    Author->>FE: Click "Publish Article"
    FE->>FE: DOMPurify.sanitize(htmlContent)
    FE->>SB: POST /api/v1/articles (Payload + JWT)
    SB->>PG: Validate JWT & User UUID
    PG-->>SB: User Verified (ROLE_STUDENT_AUTHOR)
    SB->>MG: Save Article Document (Status: PUBLISHED)
    MG-->>SB: Document Saved (BSON ObjectId)
    SB-->>FE: 201 Created (Article DTO)
    FE-->>Author: Display "Article Published Successfully"

    note over SB,AI: Non-blocking Asynchronous AI Processing Loop
    SB->>SB: Trigger @Async Event Thread
    SB->>AI: POST /api/v1/summarize {articleId, textContent}
    AI->>AI: Run LangChain LLM Summarization & Tagging Pipeline
    AI-->>SB: Return {summary, tags: ["spring", "mongodb"]}
    SB->>MG: Update Article Document with AI Metadata
```

---

## 3. Module Breakdown

### 3.1 Module 1: Identity & Access Management (IAM)
* **Core Responsibilities:** User registration, password encryption, authentication credential issuance, session state management via stateless JWTs, and user metadata tracking (enrollment number, academic department, GitHub handle).
* **Key Components:**
  * `UserRepository`: Spring Data JPA interface for querying PostgreSQL `users` table.
  * `JwtTokenProvider`: Generates and verifies HMAC-SHA256 signed JWT tokens with claim payloads containing user UUID, email, and assigned roles.
  * `CustomUserDetailsService`: Bridges Spring Security authentication manager with database identity records.
* **Security Rules:** Passwords must be hashed using **BCrypt** with a minimum work factor of 12 before persistence.

### 3.2 Module 2: Core Content Engine
* **Core Responsibilities:** Manages lifecycle of technical publications including creation, modification, deletion, draft management, and version history.
* **Key Components:**
  * `ArticleRepository`: Spring Data MongoDB interface for querying MongoDB Atlas `articles` collection.
  * `ArticleService`: Handles CRUD workflows, status transitions (`DRAFT` $\rightarrow$ `PUBLISHED`), view increment logic, and version snapshot creation.
  * `RevisionHistorySubdocument`: Embedded MongoDB array keeping historical diffs of article content for auditing.

### 3.3 Module 3: Interactive Frontend
* **Core Responsibilities:** User interface rendering, interactive WYSIWYG editing, client-side input sanitization, role-based component rendering, and portfolio visualization.
* **Key Components:**
  * `TipTap / Quill Component`: Customized editor supporting code blocks with syntax highlighting (Prism.js), inline table formatting, and LaTeX math expressions.
  * `DOMPurify Integration`: Enforces strict HTML sanitization before REST dispatch.
  * `RoleBasedRoute`: Higher-Order Component (HOC) guarding author and moderator routes based on decoded JWT claims.

### 3.4 Module 4: AI Microservice
* **Core Responsibilities:** Automated natural language processing, generating concise 2–3 sentence summaries (TL;DR), and predicting relevant tech tags.
* **Key Components:**
  * `FastAPI Application`: Micro-framework serving lightweight REST endpoints (`/api/v1/summarize`, `/api/v1/extract-tags`).
  * `LangChain Summarization Chain`: Structured prompt template fed into LLMs to generate reproducible abstracts.
  * `Taxonomy Extractor`: System prompt constraining generated tags to recognized technology keywords (e.g., `Java`, `Spring Boot`, `Docker`, `Kubernetes`).

### 3.5 Module 5: Orchestration & Portfolio Aggregation
* **Core Responsibilities:** Serving as the gateway and aggregator that combines user metadata from PostgreSQL, article content from MongoDB Atlas, and external developer metrics from GitHub into a single high-performance portfolio payload.
* **Key Components:**
  * `PortfolioAggregatorService`: Parallel data execution engine using Java `CompletableFuture` / Spring `@Async`.
  * `GitHubRestClient`: Spring `WebClient` wrapped with **Resilience4j** circuit breakers to safely query GitHub's public API (`GET https://api.github.com/users/{username}/repos`).
  * `LivePortfolioDTO`: Composite data transfer object sent to client.

---

## 4. Security & Role-Based Access Control (RBAC)

### 4.1 Stateless Authentication Architecture
DevStream uses stateless **JSON Web Tokens (JWT)**. Upon successful authentication at `/api/v1/auth/login`, the client receives a signed JWT containing:
* **Subject (`sub`):** User UUID
* **Issuer (`iss`):** `devstream-auth-service`
* **Issued At (`iat`) & Expiration (`exp`):** Expiry set to 24 hours.
* **Roles Claim (`roles`):** Array of assigned roles (`ROLE_GUEST`, `ROLE_STUDENT_AUTHOR`, `ROLE_MODERATOR`).

Every guarded request must supply this token in the header:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4.2 Cross-Site Scripting (XSS) Mitigation Strategy
To allow rich-text HTML rendering (headings, code blocks, bold text) while preventing XSS execution vectors, DevStream enforces a **Dual-Layer Sanitization Strategy**:

```mermaid
flowchart LR
    A["User Input (Raw HTML / Math / Script)"] --> B["DOMPurify.sanitize() (Client)"]
    B --> C{"Clean HTML?"}
    C -->|Yes| D["REST Payload Transmission"]
    C -->|No - Script Removed| D
    D --> E["Spring Boot Validation Engine"]
    E --> F["MongoDB BSON Document Storage"]
```

1. **Client-Side Defense:** All content produced by TipTap/Quill is filtered through `DOMPurify.sanitize()` prior to payload construction:
   ```javascript
   import DOMPurify from 'dompurify';

   const rawHTML = editor.getHTML();
   const cleanHTML = DOMPurify.sanitize(rawHTML, {
     ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'h1', 'h2', 'h3', 'code', 'pre', 'ul', 'ol', 'li', 'blockquote', 'span', 'table', 'tr', 'td', 'th'],
     ALLOWED_ATTR: ['class', 'language']
   });
   ```
2. **Server-Side Defense:** Spring Boot backend validates strings and encodes responses to ensure script injection vectors are rendered inert.

### 4.3 RBAC Permission Matrix

System permissions are partitioned across three primary security roles:

| System Capability | `ROLE_GUEST` | `ROLE_STUDENT_AUTHOR` | `ROLE_MODERATOR` |
| :--- | :---: | :---: | :---: |
| **Browse Public Published Articles** | ✅ Enabled | ✅ Enabled | ✅ Enabled |
| **Search Articles by Tag / Author** | ✅ Enabled | ✅ Enabled | ✅ Enabled |
| **View Student Live Portfolios** | ✅ Enabled | ✅ Enabled | ✅ Enabled |
| **Create & Save Article Drafts** | ❌ Denied | ✅ Enabled | ✅ Enabled |
| **Publish Technical Articles** | ❌ Denied | ✅ Enabled | ✅ Enabled |
| **Edit / Delete Own Articles** | ❌ Denied | ✅ Enabled (Owned Only) | ✅ Enabled (All Content) |
| **Trigger AI Summarization Engine** | ❌ Denied | ✅ Enabled | ✅ Enabled |
| **Link & Sync GitHub Profile** | ❌ Denied | ✅ Enabled | ✅ Enabled |
| **Flag / Unpublish Violating Content**| ❌ Denied | ❌ Denied | ✅ Enabled |
| **Access Platform Admin Analytics** | ❌ Denied | ❌ Denied | ✅ Enabled |

### 4.4 API Route Protection Rules

```java
// Spring Security SecurityFilterChain configuration snippet
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .csrf(AbstractHttpConfigurer::disable)
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            // Public Endpoints
            .requestMatchers("/api/v1/auth/**", "/api/v1/public/**").permitAll()
            // Student Author Endpoints
            .requestMatchers(HttpMethod.POST, "/api/v1/articles/**").hasAnyRole("STUDENT_AUTHOR", "MODERATOR")
            .requestMatchers(HttpMethod.PUT, "/api/v1/articles/**").hasAnyRole("STUDENT_AUTHOR", "MODERATOR")
            .requestMatchers("/api/v1/portfolio/me/**").hasAnyRole("STUDENT_AUTHOR", "MODERATOR")
            // Moderator Endpoints
            .requestMatchers("/api/v1/moderation/**").hasRole("MODERATOR")
            .anyRequest().authenticated()
        )
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
    return http.build();
}
```

---

## 5. Database Schema Design

### 5.1 PostgreSQL Relational Schema

PostgreSQL handles structured identity, security, authentication, and external profile references.

#### Table: `users`
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY`, Default `gen_random_uuid()` | Immutable unique identifier. |
| `email` | `VARCHAR(255)` | `UNIQUE`, `NOT NULL` | User's primary login email. |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | BCrypt salted hash of password. |
| `first_name` | `VARCHAR(100)` | `NOT NULL` | First name. |
| `last_name` | `VARCHAR(100)` | `NOT NULL` | Surname. |
| `enrollment_no` | `VARCHAR(50)` | `UNIQUE`, `NOT NULL` | Academic enrollment number. |
| `department` | `VARCHAR(100)` | `NOT NULL` | Field of study (e.g., Information Technology). |
| `github_username`| `VARCHAR(100)` | Nullable | Bound GitHub handle. |
| `created_at` | `TIMESTAMP` | `NOT NULL`, Default `CURRENT_TIMESTAMP` | Account creation timestamp. |
| `updated_at` | `TIMESTAMP` | `NOT NULL`, Default `CURRENT_TIMESTAMP` | Profile update timestamp. |

#### Table: `roles`
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY`, `AUTO_INCREMENT` | Unique role identifier. |
| `name` | `VARCHAR(50)` | `UNIQUE`, `NOT NULL` | Role name (`ROLE_GUEST`, `ROLE_STUDENT_AUTHOR`, `ROLE_MODERATOR`). |

#### Table: `user_roles`
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `user_id` | `UUID` | `FOREIGN KEY (users.id) ON DELETE CASCADE` | References user account. |
| `role_id` | `INTEGER` | `FOREIGN KEY (roles.id) ON DELETE CASCADE` | References assigned role. |

---

### 5.2 MongoDB Document Schema

MongoDB Atlas handles rich-text publications, version snapshots, and AI metadata.

#### Collection: `articles`
```json
{
  "_id": { "$oid": "651d8b9f1234567890abcdef" },
  "author_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "title": "Building a Polyglot Persistence Engine with Spring Boot and MongoDB",
  "slug": "building-a-polyglot-persistence-engine-with-spring-boot-and-mongodb",
  "content_html": "<p>In this article we explore...</p><pre><code class=\"language-java\">@Entity public class User {}</code></pre>",
  "status": "PUBLISHED",
  "tags": ["java", "spring-boot", "mongodb", "architecture"],
  "ai_summary": {
    "tldr": "This article demonstrates how to combine PostgreSQL and MongoDB Atlas in a Spring Boot application to achieve polyglot persistence.",
    "generated_at": { "$date": "2026-10-08T09:30:00.000Z" },
    "model_version": "gpt-4o-mini / langchain-v0.2"
  },
  "view_count": 342,
  "revisions": [
    {
      "revision_id": 1,
      "updated_at": { "$date": "2026-10-07T14:20:00.000Z" },
      "content_snapshot": "<p>Draft content initial...</p>"
    }
  ],
  "created_at": { "$date": "2026-10-07T14:00:00.000Z" },
  "updated_at": { "$date": "2026-10-08T09:30:00.000Z" }
}
```

---

### 5.3 Entity-Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ USER_ROLES : possesses
    ROLES ||--o{ USER_ROLES : assigned_to
    USERS ||--o{ ARTICLES : authors
    ARTICLES ||--o{ REVISIONS : maintains
    ARTICLES ||--|| AI_SUMMARY : embeds

    USERS {
        uuid id PK
        string email
        string password_hash
        string enrollment_no
        string github_username
    }

    ROLES {
        int id PK
        string name
    }

    USER_ROLES {
        uuid user_id FK
        int role_id FK
    }

    ARTICLES {
        objectId id PK
        uuid author_id FK
        string title
        string content_html
        string status
        array tags
    }

    REVISIONS {
        int revision_id
        string content_snapshot
        datetime updated_at
    }

    AI_SUMMARY {
        string tldr
        datetime generated_at
    }
```

---

## 6. Non-Functional Requirements (NFRs)

### 6.1 Performance Metrics

1. **Portfolio Aggregation Latency:**
   The total resolution time for the composite `LivePortfolioDTO` payload must remain below **500 ms** under normal load:
   $$T_{\text{aggregation}} = \max(T_{\text{PostgreSQL}}, T_{\text{MongoDB}}) + T_{\text{GitHub API}} < 500\text{ ms}$$
   Parallel execution using Java `CompletableFuture` prevents sequential waiting.

2. **Asynchronous Non-Blocking Execution:**
   AI processing operations must execute outside the main HTTP request-response thread pool. The Spring Boot backend returns `201 Created` immediately upon article persistence, while `@Async` worker threads dispatch payload to Python FastAPI asynchronously.

3. **Database Indexing:**
   * PostgreSQL indexes applied on `users(email)`, `users(enrollment_no)`, and `users(id)`.
   * MongoDB compound indexes created on `{ author_id: 1, status: 1 }` and text indexes on `{ title: "text", tags: "text" }`.

### 6.2 Security & Governance

1. **Password Hashing:** BCrypt algorithm with log rounds $S = 12$.
2. **Transport Security:** All HTTP communications enforced over TLS 1.3 in production environments.
3. **Cross-Origin Resource Sharing (CORS):** Strict origin white-listing (`http://localhost:5173` for development, domain-restricted in production).
4. **Input Sanitization:** Client-side DOMPurify stripping all `<script>`, `<iframe>`, `on*` event handlers, and `javascript:` URIs.

### 6.3 Fault Tolerance & Circuit Breaking

External integrations (GitHub REST API and Python AI Service) are wrapped with **Resilience4j Circuit Breakers**:

* **GitHub API Degradation:** If GitHub API rates out or fails, the portfolio service returns identity and articles, falling back to a cached or gracefully degraded state for GitHub repos.
* **AI Service Failure:** If the AI microservice times out ($> 3000\text{ ms}$), the article persists cleanly with `ai_summary: null`. An asynchronous retry event is scheduled without failing the user transaction.

```yaml
# Resilience4j Circuit Breaker configuration snippet
resilience4j.circuitbreaker:
  instances:
    githubService:
      slidingWindowSize: 10
      failureRateThreshold: 50
      waitDurationInOpenState: 10000ms
    aiService:
      slidingWindowSize: 5
      failureRateThreshold: 40
      waitDurationInOpenState: 5000ms
```

### 6.4 Scalability & Monorepo Structure

* **Independent Scaling:** Microservices are containerized via Docker. The Python AI microservice can be horizontally scaled independently to accommodate heavy NLP workload spikes without requiring additional Java Spring Boot instances.
* **Maintainability:** The monorepo layout simplifies shared versioning, centralized local integration testing via `docker-compose`, and standardizes deployment pipelines.

---
*End of Technical Architecture Document.*
