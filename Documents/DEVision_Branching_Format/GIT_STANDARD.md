# DEVision Git Branching Standards

**Version:** 1.1  
**Objective:** Standardize branch names so we instantly know **Who** is working on it, **Which Team** it belongs to, and **What** type of work it is.

---

## 1. The Branch Naming Format

All branches must follow this structure:

`{TEAM}-{NAME}-{TYPE}-{DESCRIPTION}`

### A. The Breakdown

| Component | Options | Description |
| :--- | :--- | :--- |
| **TEAM** | `BE` / `FE` / `DOCS` | **BE** = Backend, **FE** = Frontend, **DOCS** = Documentation/DevOps |
| **NAME** | `[YourName]` | Your first name or nickname (e.g., `tuan`, `alex`, `khoa`). |
| **TYPE** | `Feat` / `Fix` / `Chore` | **Feat** = New Feature, **Fix** = Bug Fix, **Chore** = Config/Maintenance. |
| **DESCRIPTION** | `kebab-case-text` | Short description of the task (2-4 words). |

---

## 2. Examples by Role

### Backend (BE)

Use **BE** as the prefix.

* **Feature:** `BE-Khoa-Feat-Google-Auth`
* **Bug Fix:** `BE-Khoa-Fix-Payment-Timeout`
* **Config:** `BE-Khoa-Chore-Docker-Setup`

### Frontend (FE)

Use **FE** as the prefix.

* **Feature:** `FE-Dong-Feat-Login-Screen`
* **Bug Fix:** `FE-Dong-Fix-Mobile-Layout`
* **Refactor:** `FE-Dong-Chore-Upgrade-React`

### Documentation / DevOps (DOCS)

Use **DOCS** or **INFRA** as the prefix.

* **Documentation:** `DOCS-Huy-Feat-System-Diagram`
* **Readme:** `DOCS-Huy-Fix-Typo-Readme`

---

## 3. Pull Request (PR) Title Standard

When merging your branch into `develop` or `main`, the PR Title should look like this:

`[TEAM] Short Description of Work`

**Examples:**

* `[BE] Implement Google Authentication Logic`
* `[FE] Fix Responsive Layout on Job Page`
* `[DOCS] Update Architecture Diagram`

---
