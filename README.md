# DevStream: Developer-Centric Blogging Platform

## week 1

## Project Administration

**Project Guide:** Er. Ram Babu Buri
* **Research Area:** Machine Learning & Data Science
* **Specializations:** Java, JSP–Servlet, Spring Boot, MySQL, Python



### Team Members

| Name | Enrollment | Email | Mobile |
| :--- | :--- | :--- | :--- |
| Aman Raj | ACEIT24IT6357-6357 | araj2271770@gmail.com | 7488742145 |
| Chitransh Sain | ACEIT24IT6363-6363 | chitranshsain157@gmail.com | 8306244403 |
| Mahadev Prasad Yadav | ACEIT24IT6379-6379 | mahadevyadav7375@gmail.com | 7375088538 |
| Suman Kumar | ACEIT24IT6409-6409 | sumank76495@gmail.com | 6205867784 |
| Aaradhy Sharma | ACEIT24IT6349-6349 | aaradhysharma426@gmail.com | 6367143506 |

---

## Abstract
This project introduces DevStream, a developer-centric blogging and portfolio platform engineered to address the limitations of traditional content management systems in handling complex technical documentation. While standard blogging platforms lack the structural formatting required for software life-cycle artifacts, DevStream provides a specialized environment for engineering students and developers to publish rigorous software requirements, code-heavy tutorials, and architectural designs.

The system operates on a polyglot persistence architecture orchestrated by a Java Spring Boot backend. It utilizes PostgreSQL for ACID-compliant Identity and Access Management (IAM) and Role-Based Access Control (RBAC), paired with MongoDB for the flexible, document-based storage of version-controlled Markdown articles. The client-side interface, developed in React.js, features a dedicated Markdown editor capable of rendering complex technical syntax. To enhance content discoverability and reduce cognitive load for readers, the platform integrates a standalone Python microservice utilizing LangChain and Large Language Models (LLMs). This AI layer performs automated text analysis to generate concise "TL;DR" abstracts and predictive metadata tags for lengthy submissions.

Ultimately, the platform converges these distinct architectural modules into a dynamically aggregated "Live Portfolio." This aggregator seamlessly stitches together a user’s secure identity profile, AI-enhanced technical publications, and external API data (such as pinned GitHub repositories) into a unified, professional showcase. The resulting system bridges the gap between technical writing and professional networking, providing a comprehensive toolset for developers to document their workflows and demonstrate their engineering competencies.

---

## week 2 


## User Roles
DevStream enforces strict Role-Based Access Control (RBAC) at the API layer utilizing Spring Security and stateless JSON Web Tokens (JWT).
* **Student Author**: Can create and edit technical documentation, manage their live portfolio, and link their GitHub profile.
* **Guest Reader**: Unauthenticated users permitted to view public portfolios and read open software documentation.
* **Moderator**: Administrative users possessing elevated privileges to monitor content quality and enforce platform guidelines.

---

### SRS PDF

You can access the [Project SRS Click](https://drive.google.com/file/d/1LixhIziyjHDVCXckHiU0Rzo9B0P1E16u/view?usp=drive_link)

---

## Architecture & Core Modules

The DevStream architecture operates as a distributed system, with a Spring Boot Java backend acting as the central orchestrator, a React.js frontend, and an isolated Python AI microservice.


### Functional Modules
* **Module 1: Identity & Access Management (IAM)**
  Validates user credentials and issues secure, time-bound JWTs. It manages user profile metadata, academic affiliations, and external repository URLs, acting as the system gatekeeper.
* **Module 2: Core Content Engine**
  Manages the drafting, version control, and storage of flexible, unstructured technical documentation. It uses boolean states to differentiate between "Draft" and "Published" content and maintains a nested version history for all edits.
* **Module 3: Interactive Frontend (React.js)**
  The client-side application featuring a specialized Markdown editor, role-based dashboards, and the final aggregated portfolio view.
* **Module 4: AI Microservice (Python + LangChain)**
  A standalone Python environment that processes natural language asynchronously. It uses an LLM to ingest articles and output a 2-3 sentence abstract, alongside assigning relevant technology domain tags.
* **Module 5: Orchestration & Portfolio Aggregation**
  The Spring Boot bridge that merges relational IAM data with document content via unified Data Transfer Objects (DTOs). This layer also communicates with the GitHub REST API to display pinned user repositories in real-time.

---

## Polyglot Persistence Database Strategy

The system utilizes a Polyglot Persistence model, routing data to appropriate engines based on structural needs rather than forcing a single paradigm.


### PostgreSQL (Relational Core)
* **Usage**: Stores User Accounts, Roles, Credentials, and API Keys.
* **Structure**: Enforces strict schemas and referential integrity with ACID compliance.
* **Integration**: Connects via Spring Data JPA and Hibernate using `@Entity` mapping.
* **Keys**: Utilizes UUIDs for users to mitigate enumeration attacks.

### MongoDB (Content Engine)
* **Usage**: Stores Markdown Posts, AI Summaries, Revision Histories, View Counts, and Tags.
* **Structure**: Highly flexible document structures containing nested objects and dynamic arrays.
* **Integration**: Connects via Spring Data MongoDB using `@Document` mapping.
* **Keys**: Uses native BSON ObjectIDs mapped back to the author's UUID.

---

## Non-Functional Requirements
* **Performance**: The Portfolio Aggregator must execute parallel asynchronous queries to PostgreSQL, MongoDB, and GitHub to resolve the complete portfolio payload in under 500ms.
* **Security**: All passwords are hashed via BCrypt before database insertion. The platform implements global CORS policies and sanitizes all Markdown input to prevent Cross-Site Scripting (XSS).
* **Fault Tolerance**: Utilizes Resilience4j for circuit breakers when communicating with external endpoints like GitHub and the AI Provider. If the LLM service times out, articles must save successfully without a summary rather than failing the transaction.
* **Scalability**: The Python AI microservice is containerized separately from the Spring Boot application, allowing it to be scaled independently during high text-processing traffic.

---
### Week 3
---
### UML Design
---
* [DevStream Class Diagram]![alt text](./image/Gemini_Generated_Image_lz6bxwlz6bxwlz6b.png)

* [DevStream Architecture]![Project Screenshot](./image/Gemini_Generated_Image_4dvtt54dvtt54dvt.png)

---


## Week 4: Database Design & UI Mock-ups

### 1. Database Architecture & Polyglot Persistence Strategy

DevStream operates on a **Polyglot Persistence Architecture** that routes data to PostgreSQL for transactional identity management and MongoDB Atlas for high-throughput, unstructured article documentation.

#### A. PostgreSQL Relational Database Schema (Identity & Access Management)

* **`users` Table**: Core identity and security credentials.
  * `id` (`BIGSERIAL`, `PRIMARY KEY`)
  * `username` (`VARCHAR(50)`, `UNIQUE`, `NOT NULL`)
  * `email` (`VARCHAR(100)`, `UNIQUE`, `NOT NULL`)
  * `password` (`VARCHAR(255)`, BCrypt Hash)
  * `created_at` (`TIMESTAMP`, `DEFAULT CURRENT_TIMESTAMP`)

* **`roles` Table**: Role-Based Access Control definitions.
  * `id` (`BIGSERIAL`, `PRIMARY KEY`)
  * `name` (`VARCHAR(30)`, `UNIQUE`) — `ROLE_STUDENT_AUTHOR`, `ROLE_MODERATOR`, `ROLE_GUEST`

* **`user_roles` Join Table**: M-to-N user-role mappings.
  * `user_id` (`BIGINT`, `FOREIGN KEY` -> `users.id`)
  * `role_id` (`BIGINT`, `FOREIGN KEY` -> `roles.id`)

* **`developer_portfolios` Table**: Portfolio bio, social handles, and technical skills.
  * `id` (`BIGSERIAL`, `PRIMARY KEY`)
  * `user_id` (`BIGINT`, `FOREIGN KEY` -> `users.id`, `UNIQUE`)
  * `bio` (`TEXT`)
  * `github_username` (`VARCHAR(100)`)
  * `avatar_url` (`VARCHAR(500)`)
  * `location` (`VARCHAR(100)`)
  * `skills_json` (`JSONB`, `DEFAULT '[]'`)

#### B. MongoDB Atlas Document Database Schema (Content Engine)

* **`articles` Collection**: Unstructured document storage for WYSIWYG HTML, TipTap JSON AST, Markdown, and analytics counters.
  ```json
  {
    "_id": "ObjectId",
    "title": "String",
    "slug": "String (Unique Index)",
    "contentHtml": "String (DOMPurify Sanitized)",
    "contentJson": "String (TipTap JSON)",
    "contentMarkdown": "String (Legacy Markdown)",
    "summary": "String (LangChain AI Summary)",
    "authorUsername": "String",
    "tags": ["Array of Strings"],
    "status": "PUBLISHED | HIDDEN | DRAFT",
    "viewCount": 0,
    "createdAt": "ISODate",
    "updatedAt": "ISODate"
  }
  ```

* **`tags` Collection**: Global taxonomy tags.
  ```json
  {
    "_id": "ObjectId",
    "name": "String (Unique Index)",
    "description": "String",
    "usageCount": 0
  }
  ```

---

#### C. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USERS ||--o{ USER_ROLES : "has assigned"
    ROLES ||--o{ USER_ROLES : "mapped to"
    USERS ||--|| DEVELOPER_PORTFOLIOS : "owns"
    USERS ..o{ ARTICLES : "authors (cross-DB reference)"
    ARTICLES }o--o{ TAGS : "categorized by"

    USERS {
        bigint id PK
        string username UK
        string email UK
        string password
        timestamp created_at
    }

    ROLES {
        bigint id PK
        string name UK
    }

    USER_ROLES {
        bigint user_id PK, FK
        bigint role_id PK, FK
    }

    DEVELOPER_PORTFOLIOS {
        bigint id PK
        bigint user_id FK, UK
        text bio
        string github_username
        string avatar_url
        string location
        jsonb skills_json
        timestamp updated_at
    }

    ARTICLES {
        objectId _id PK
        string title
        string slug UK
        string contentHtml
        string contentJson
        string contentMarkdown
        string summary
        string authorUsername FK
        string_array tags
        enum status "PUBLISHED|HIDDEN|DRAFT"
        int viewCount
        timestamp createdAt
    }

    TAGS {
        objectId _id PK
        string name UK
        string description
        int usageCount
    }
```

---

### 2. User Interface (UI) Mock-ups

#### A. Moderator Control Center (Queue, Read Article & Moderation Actions)
Features live queue monitoring, in-app full article reader view with DOMPurify XSS protection, and inline visibility controls (`PUBLISHED`, `HIDDEN`, `DRAFT`).

* [DevStream Moderator Control Center]![Moderator Dashboard](./image/image.png)
 
* [DevStream User Dashboard]![User Dashboard](./image/image%20copy.png)


---
