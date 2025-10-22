// ===============================
// Microsoft AZ-104 — Exam Simulation Mini Bank (NEW)
// 5 questions total: 1 per AZ-104 domain (same schema/fields as your AWS SAA bank)
// Fields: question, options[], correctAnswer (index), difficulty, explanation, explanationRich, links[]
// ===============================

const questions = [
  // -------------------- Domain 1 --------------------
  {
    category: "Domain 1: Manage Azure identities and governance",
    questions: [
      {
        question:
          "You must grant a support engineer time-bound, least-privilege access to restart a production VM and view its logs, with MFA and approval. What should you implement?",
        options: [
          "Assign the Owner role permanently at the subscription scope",
          "Create a custom role with full permissions and assign it indefinitely",
          "Use Azure AD Privileged Identity Management (PIM) with an *eligible* Virtual Machine Contributor role that requires approval and MFA on activation",
          "Share a service principal secret with Contributor at the resource group"
        ],
        correctAnswer: 2,
        difficulty: "medium",
        explanation:
          "Azure AD PIM enables just-in-time (JIT) elevation to an *eligible* role for a limited time, enforced with approval workflows and MFA. Assign the minimal RBAC role (e.g., Virtual Machine Contributor and Log Analytics Reader) at the smallest scope (the VM or its RG).",
        explanationRich:
          "Configure <strong>Azure AD Privileged Identity Management (PIM)</strong> to assign the engineer as <em>eligible</em> for the <strong>Virtual Machine Contributor</strong> role (and optionally <strong>Log Analytics Reader</strong>) scoped to the specific VM or resource group. Require <strong>approval</strong>, <strong>MFA</strong>, and a <strong>reason</strong> on activation, and set a <em>maximum activation duration</em>. PIM logs activations for audit and you can add <em>Access Reviews</em> for ongoing governance.",
        links: [
          { title: "Microsoft Docs — What is Azure AD PIM?", url: "https://learn.microsoft.com/azure/active-directory/privileged-identity-management/pim-configure" },
          { title: "Microsoft Docs — Assign Azure resource roles in PIM", url: "https://learn.microsoft.com/azure/active-directory/privileged-identity-management/pim-resource-roles-assign-roles" },
          { title: "Microsoft Docs — Azure built-in roles", url: "https://learn.microsoft.com/azure/role-based-access-control/built-in-roles" }
        ]
      }
    ]
  },

  // -------------------- Domain 2 --------------------
  {
    category: "Domain 2: Implement and manage storage",
    questions: [
      {
        question:
          "Your compliance team requires tamper-proof retention of application logs in Azure Blob Storage and the ability to place temporary legal holds. Which feature should you enable?",
        options: [
          "Cool access tier with soft delete",
          "Blob versioning only",
          "Immutable storage for Blob containers with time-based retention and legal hold",
          "Geo-redundant storage (GRS) only"
        ],
        correctAnswer: 2,
        difficulty: "medium",
        explanation:
          "Immutable storage (WORM) prevents modification or deletion until the retention period expires; legal holds freeze data until explicitly cleared. It satisfies many regulatory controls for log immutability.",
        explanationRich:
          "Enable <strong>Immutable Storage</strong> at the container level and configure <em>time-based retention</em> (e.g., 365 days) for your logs. Optionally apply <strong>legal holds</strong> (named tags) to pause deletions regardless of the time policy. Combine with <strong>Blob versioning</strong> and <strong>soft delete</strong> for defense-in-depth, and consider <strong>GRS</strong> or <strong>RA-GRS</strong> for cross-region durability.",
        links: [
          { title: "Microsoft Docs — Immutable storage for Azure Blob", url: "https://learn.microsoft.com/azure/storage/blobs/immutable-storage-overview" },
          { title: "Microsoft Docs — Blob versioning", url: "https://learn.microsoft.com/azure/storage/blobs/versioning-overview" },
          { title: "Microsoft Docs — Soft delete for blobs", url: "https://learn.microsoft.com/azure/storage/blobs/soft-delete-blob-overview" }
        ]
      }
    ]
  },

  // -------------------- Domain 3 --------------------
  {
    category: "Domain 3: Deploy and manage Azure compute resources",
    questions: [
      {
        question:
          "You manage hundreds of Windows and Linux VMs across subscriptions. You need centralized scheduling for OS patching, maintenance windows, and compliance reporting—without building your own orchestration. What should you use?",
        options: [
          "Manual RDP/SSH and local update scripts",
          "Azure Automation Runbooks only",
          "Azure Update Manager (formerly Update Management) with maintenance configurations",
          "Custom cron jobs on each VM"
        ],
        correctAnswer: 2,
        difficulty: "low",
        explanation:
          "Azure Update Manager provides at-scale patch orchestration, maintenance windows, pre/post scripts, dynamic scoping, and compliance reporting for Azure, Arc-enabled, and scale-set VMs.",
        explanationRich:
          "Adopt <strong>Azure Update Manager</strong> to define <em>maintenance configurations</em> (windows, reboot options), include <em>pre/post scripts</em>, and target resources by <strong>Azure Policy</strong> or dynamic queries (tags/filters). Review <strong>compliance reports</strong> and create alerts on failed updates. Works across subscriptions/tenants with Azure Lighthouse/Arc.",
        links: [
          { title: "Microsoft Docs — Azure Update Manager overview", url: "https://learn.microsoft.com/azure/update-center/overview" },
          { title: "Microsoft Docs — Manage updates for multiple machines", url: "https://learn.microsoft.com/azure/update-center/manage-multiple-machines" }
        ]
      }
    ]
  },

  // -------------------- Domain 4 --------------------
  {
    category: "Domain 4: Configure and manage virtual networking",
    questions: [
      {
        question:
          "Workloads in a private subnet must access Azure Storage accounts and Azure SQL Database using private IPs only and block public network access. What should you configure?",
        options: [
          "NAT Gateway to the internet and storage firewall allowing the VNet",
          "Service endpoints only, leaving public access enabled",
          "Azure Private Link: create Private Endpoints for each service, disable public network access, and use Private DNS zone mappings",
          "User-defined routes to the internet"
        ],
        correctAnswer: 2,
        difficulty: "medium",
        explanation:
          "Private Endpoints map PaaS services to private IPs in your VNet. Disabling public network access ensures all traffic stays on the Microsoft backbone.",
        explanationRich:
          "Implement <strong>Azure Private Link</strong>: create <strong>Private Endpoints</strong> for the Storage account (blob/file/queue/table as needed) and for Azure SQL. Disable <em>Public network access</em> on those resources. Integrate the endpoint NICs with <strong>Private DNS zones</strong> (e.g., <code>privatelink.blob.core.windows.net</code>, <code>privatelink.database.windows.net</code>) and link them to your VNets for seamless name resolution.",
        links: [
          { title: "Microsoft Docs — Private Link & Private Endpoints", url: "https://learn.microsoft.com/azure/private-link/private-link-overview" },
          { title: "Microsoft Docs — Private DNS zones for Private Endpoints", url: "https://learn.microsoft.com/azure/private-link/private-endpoint-dns" }
        ]
      }
    ]
  },

  // -------------------- Domain 5 --------------------
  {
    category: "Domain 5: Monitor and maintain Azure resources (including backup)",
    questions: [
      {
        question:
          "You want centralized platform/app logs across subscriptions with Kusto queries, alerts, and long-term retention on low-cost storage. Which architecture is best?",
        options: [
          "Keep logs on each VM and download when needed",
          "Send diagnostic settings to one Log Analytics workspace and also archive to a Storage account; query with Azure Monitor Logs and create alert rules",
          "Use Activity Log only",
          "Export to Event Hubs only"
        ],
        correctAnswer: 1,
        difficulty: "medium",
        explanation:
          "Diagnostic settings can route logs/metrics to a central Log Analytics workspace for KQL queries and alerts, and simultaneously archive to Storage for long-term retention at lower cost.",
        explanationRich:
          "Create subscription- and resource-level <strong>diagnostic settings</strong> that send logs and metrics to a centralized <strong>Log Analytics workspace</strong> (for <em>KQL</em>, workbooks, and alert rules) and to <strong>Azure Storage</strong> for inexpensive, long-term retention. Optionally stream to <strong>Event Hubs</strong> for SIEM ingestion. Use <strong>Azure Backup</strong> with <strong>Recovery Services vault</strong> for VM/database backups, and configure policies/alerts and cross-region restore where supported.",
        links: [
          { title: "Microsoft Docs — Diagnostic settings", url: "https://learn.microsoft.com/azure/azure-monitor/essentials/diagnostic-settings" },
          { title: "Microsoft Docs — Azure Monitor Logs (Log Analytics)", url: "https://learn.microsoft.com/azure/azure-monitor/logs/log-analytics-overview" },
          { title: "Microsoft Docs — Azure Backup overview", url: "https://learn.microsoft.com/azure/backup/backup-overview" }
        ]
      }
    ]
  }
];

// Optional export bindings (to match your SAA file style)
if (typeof window !== "undefined") window.questions = questions;
if (typeof module !== "undefined") module.exports = questions;
