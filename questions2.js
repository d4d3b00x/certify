// ===============================
// Exam Banks (ENGLISH) — Same schema as your SAA file
// 3 Certifications from your screenshot (10 Qs each), organized by official domains.
// Each item: { question, options[], correctAnswer (index), difficulty, explanation, explanationRich, links[] }
// ===============================

// ---------------------------------------------------------------------
// 1) AWS Certified DevOps Engineer — Professional (DOP-C02) — 10 Qs
// DOP-C02 domains: SDLC Automation; Config Mgmt & IaC; Monitoring & Logging;
// Incident & Event Response; Security & Compliance; HA/FT/DR
// ---------------------------------------------------------------------
const aws_dop_questions = [
  {
    category: "Domain 1: SDLC Automation",
    questions: [
      {
        question: "You need to implement safe, automated blue/green deployments for an EC2-based service, with traffic shifting and automatic rollback on failed health checks. Which approach fits best?",
        options: [
          "Use AWS Elastic Beanstalk with immutable updates only",
          "Use AWS CodeDeploy with blue/green deployment and ELB traffic shifting",
          "Run a shell script on each instance to pull the new version and restart",
          "Bake AMIs with Packer and replace instances manually"
        ],
        correctAnswer: 1,
        difficulty: "medium",
        explanation: "CodeDeploy supports blue/green for EC2/On-Prem and ECS with traffic shifting and automatic rollback.",
        explanationRich:
          "Adopt <strong>AWS CodeDeploy</strong> blue/green: it provisions a <em>replacement fleet</em>, runs <em>lifecycle hooks</em>, shifts traffic via the ELB target group, and can <strong>automatically roll back</strong> on health-check failures or alarms. Pair with <strong>CodePipeline</strong> for CI/CD automation and <strong>CloudWatch Alarms</strong> to gate the deployment.",
        links: [
          { title: "AWS Docs — CodeDeploy blue/green for EC2/On-Prem", url: "https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-steps.html#deployment-steps-blue-green" },
          { title: "AWS Docs — Automatic rollbacks", url: "https://docs.aws.amazon.com/codedeploy/latest/userguide/deployments-rollback-and-redeploy.html" },
          { title: "AWS Docs — Integrating with CodePipeline", url: "https://docs.aws.amazon.com/codepipeline/latest/userguide/integrations-action-type.html#integrations-deploy" }
        ]
      },
      {
        question: "A team needs unit tests, security scanning, and container image build/push on each commit. What’s the most integrated AWS pipeline design?",
        options: [
          "CodeCommit → CodeBuild → ECR; add CodeBuild reports and CodeGuru Security",
          "GitHub → Jenkins on EC2 only",
          "CodeCommit → Lambda builds → ECR",
          "Manual Docker build on developer laptops"
        ],
        correctAnswer: 0,
        difficulty: "low",
        explanation: "Use native services: CodeCommit source, CodeBuild for tests/scans, push to ECR, and publish reports.",
        explanationRich:
          "Create a <strong>CodePipeline</strong> with <strong>CodeCommit</strong> as source. Use <strong>CodeBuild</strong> to run unit tests, <strong>CodeGuru Security</strong> / <em>CodeBuild reports</em> for SAST findings, then build and push to <strong>Amazon ECR</strong>. Optionally add <strong>OPA/Conftest</strong> or <strong>Trivy</strong> scans as build steps.",
        links: [
          { title: "AWS Docs — CodeBuild reports", url: "https://docs.aws.amazon.com/codebuild/latest/userguide/test-reporting.html" },
          { title: "AWS Docs — CodeGuru Security", url: "https://docs.aws.amazon.com/codeguru/latest/security-ug/what-is-codeguru-security.html" },
          { title: "AWS Docs — Pushing to ECR", url: "https://docs.aws.amazon.com/AmazonECR/latest/userguide/docker-push-ecr-image.html" }
        ]
      }
    ]
  },
  {
    category: "Domain 2: Configuration Management and Infrastructure as Code",
    questions: [
      {
        question: "You must provision repeatable, cross-account stacks with guardrails and drift detection. Which combination is most appropriate?",
        options: [
          "CloudFormation StackSets with service-managed permissions and AWS Config for drift",
          "Terraform from a developer laptop only",
          "Manual console provisioning with screenshots",
          "CDK synth output deployed manually with CLI per account"
        ],
        correctAnswer: 0,
        difficulty: "medium",
        explanation: "StackSets with service-managed permissions scale deployments across accounts/OUs. Config detects drift.",
        explanationRich:
          "<strong>CloudFormation StackSets</strong> (service-managed) deploy stacks to <em>multiple accounts and Regions</em> via Organizations. Use <strong>drift detection</strong> (CloudFormation + AWS Config) and <strong>SCPs</strong> for preventive guardrails.",
        links: [
          { title: "AWS Docs — CloudFormation StackSets", url: "https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/stacksets-concepts.html" },
          { title: "AWS Docs — Detecting drift", url: "https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/detect-drift-stack.html" },
          { title: "AWS Docs — Organizations integration", url: "https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/stacksets-orgs-enable-trusted-access.html" }
        ]
      },
      {
        question: "You need immutable servers for AMI-based deployments. What is the best pattern?",
        options: [
          "Bake AMIs with EC2 Image Builder and deploy via Auto Scaling instance refresh",
          "SSH into instances to update packages",
          "Use a single long-lived golden AMI for years",
          "Use Docker on the same host with in-place updates"
        ],
        correctAnswer: 0,
        difficulty: "low",
        explanation: "EC2 Image Builder automates hardened AMIs; Instance Refresh safely rolls fleets.",
        explanationRich:
          "Use <strong>EC2 Image Builder</strong> to create patched, hardened AMIs. Deploy through <strong>Auto Scaling Instance Refresh</strong> or <strong>CodeDeploy blue/green</strong> to roll the fleet immutably, improving reliability and auditability.",
        links: [
          { title: "AWS Docs — EC2 Image Builder", url: "https://docs.aws.amazon.com/imagebuilder/latest/userguide/what-is-image-builder.html" },
          { title: "AWS Docs — Instance Refresh", url: "https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-instance-refresh.html" }
        ]
      }
    ]
  },
  {
    category: "Domain 3: Monitoring and Logging",
    questions: [
      {
        question: "You must standardize cross-account, cross-Region log ingestion with near real-time queries. What should you use?",
        options: [
          "Push logs to CloudWatch Logs in each account and query per account",
          "CloudWatch Logs → Subscription filters → Kinesis Data Firehose → centralized S3 → Athena/Glue",
          "Tail files with cron and scp to a jump host",
          "Write logs to instance store and rotate monthly"
        ],
        correctAnswer: 1,
        difficulty: "medium",
        explanation: "Centralize via subscription filters and Firehose to S3 for analytics with Athena.",
        explanationRich:
          "Create <strong>subscription filters</strong> on CloudWatch Logs to stream to <strong>Kinesis Data Firehose</strong>, deliver to a central <strong>S3</strong> bucket partitioned by account/region/service, and query with <strong>Athena</strong>/<strong>Glue</strong>. Use <strong>CloudWatch Logs Insights</strong> for operational queries.",
        links: [
          { title: "AWS Docs — Subscription filters", url: "https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/SubscriptionFilters.html" },
          { title: "AWS Docs — Kinesis Firehose to S3", url: "https://docs.aws.amazon.com/firehose/latest/dev/create-destination.html#creating-destination-s3" },
          { title: "AWS Docs — Athena with CloudWatch logs in S3", url: "https://docs.aws.amazon.com/athena/latest/ug/cloudwatch-logs.html" }
        ]
      },
      {
        question: "You want SLO-style monitoring across microservices (latency, errors, saturation) and service maps. Which services help most?",
        options: [
          "CloudWatch metrics and alarms only",
          "AWS X-Ray with service map plus CloudWatch Synthetics and metrics",
          "SNS topics per service",
          "CloudTrail only"
        ],
        correctAnswer: 1,
        difficulty: "medium",
        explanation: "X-Ray traces and service map, Synthetics can test from canaries, CloudWatch gives RED/USE.",
        explanationRich:
          "Instrument code with <strong>AWS X-Ray</strong> to get <em>distributed traces</em> and <strong>service maps</strong>. Add <strong>CloudWatch Synthetics</strong> canaries for user-journey checks. Build RED (Rate, Errors, Duration) and USE (Utilization, Saturation, Errors) dashboards with CloudWatch.",
        links: [
          { title: "AWS Docs — X-Ray", url: "https://docs.aws.amazon.com/xray/latest/devguide/aws-xray.html" },
          { title: "AWS Docs — CloudWatch Synthetics", url: "https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Synthetics_Canaries.html" }
        ]
      }
    ]
  },
  {
    category: "Domain 4: Incident and Event Response",
    questions: [
      {
        question: "You need automatic ticketing and chat notifications when a critical CloudWatch Alarm fires. What’s a simple serverless pattern?",
        options: [
          "Alarm → SNS → Lambda that calls ticketing API and posts to ChatOps",
          "Write a cron job that polls metrics",
          "Send an email and hope someone reads it",
          "Store alarm state in DynamoDB and check weekly"
        ],
        correctAnswer: 0,
        difficulty: "low",
        explanation: "Use SNS to fan out to Lambda and integrations.",
        explanationRich:
          "Configure <strong>CloudWatch Alarm</strong> → <strong>SNS</strong> topic. Subscribe a <strong>Lambda</strong> that opens a ticket (e.g., JIRA/ServiceNow API) and posts to Slack/MS Teams. Add <strong>on-call escalation</strong> and <strong>auto-remediation</strong> where appropriate.",
        links: [
          { title: "AWS Docs — CloudWatch Alarms", url: "https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html" },
          { title: "AWS Samples — Chatbot/Slack integrations", url: "https://aws.amazon.com/blogs/mt/category/management-tools/aws-chatbot/" }
        ]
      },
      {
        question: "You must quarantine an EC2 instance automatically when GuardDuty reports a high-severity finding. What design is appropriate?",
        options: [
          "Manually log in and block all traffic",
          "EventBridge rule on GuardDuty findings → SSM Automation document to isolate ENIs and snapshot volumes",
          "Email the team",
          "Disable GuardDuty to avoid alerts"
        ],
        correctAnswer: 1,
        difficulty: "high",
        explanation: "Use EventBridge to trigger SSM runbooks for isolation and forensics.",
        explanationRich:
          "Create an <strong>EventBridge</strong> rule matching high-severity <strong>GuardDuty</strong> findings to start an <strong>SSM Automation</strong> runbook that: detaches from load balancers, applies restrictive NACL/SG, captures <em>memory/volume snapshots</em>, and tags for forensics. Report to <strong>Security Hub</strong> for central visibility.",
        links: [
          { title: "AWS Docs — GuardDuty Findings & EventBridge", url: "https://docs.aws.amazon.com/guardduty/latest/ug/guardduty_findings.html" },
          { title: "AWS Docs — SSM Automation", url: "https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-automation.html" },
          { title: "AWS Docs — Security Hub integration", url: "https://docs.aws.amazon.com/securityhub/latest/userguide/what-is-securityhub.html" }
        ]
      }
    ]
  },
  {
    category: "Domain 5: Security and Compliance",
    questions: [
      {
        question: "You need to enforce organization-wide preventive controls (deny actions) while allowing teams to build within boundaries. What should you use?",
        options: [
          "IAM inline policies only",
          "Service Control Policies (SCPs) with AWS Organizations",
          "Security groups",
          "Network ACLs"
        ],
        correctAnswer: 1,
        difficulty: "medium",
        explanation: "SCPs set the maximum permission boundary per account/OU, independent of identity policies.",
        explanationRich:
          "<strong>SCPs</strong> apply at the account or OU level and restrict what principals can do even if they have broader IAM permissions. Combine with <strong>permissions boundaries</strong> for delegated role creation and <strong>Access Analyzer</strong> for detection of unintended public/cross-account access.",
        links: [
          { title: "AWS Docs — Service Control Policies", url: "https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html" },
          { title: "AWS Docs — Permissions boundaries", url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_boundaries.html" },
          { title: "AWS Docs — IAM Access Analyzer", url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/what-is-access-analyzer.html" }
        ]
      },
      {
        question: "You must centrally distribute, rotate, and audit application secrets across accounts and Regions. Which services help most?",
        options: [
          "Store in Parameter Store plaintext",
          "Hardcode in Lambda environment variables",
          "AWS Secrets Manager with rotation and cross-account access via resource policies",
          "Put secrets in S3 with AES256"
        ],
        correctAnswer: 2,
        difficulty: "low",
        explanation: "Secrets Manager handles rotation, versioning, and cross-account access with resource policies and KMS.",
        explanationRich:
          "Use <strong>AWS Secrets Manager</strong> with <em>automatic rotation</em> (Lambda templates for RDS, etc.). Share cross-account via <strong>resource-based policies</strong> and encrypt with <strong>KMS CMKs</strong>. Audit access in <strong>CloudTrail</strong> and surface findings in <strong>Security Hub</strong>.",
        links: [
          { title: "AWS Docs — Secrets Manager", url: "https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html" },
          { title: "AWS Docs — Cross-account secrets", url: "https://docs.aws.amazon.com/secretsmanager/latest/userguide/auth-and-access_resource-policies.html" }
        ]
      }
    ]
  },
  {
    category: "Domain 6: High Availability, Fault Tolerance, and Disaster Recovery",
    questions: [
      {
        question: "For a critical API, you require zonal resilience and automatic instance replacement. What’s the target design?",
        options: [
          "Single AZ ASG with CloudWatch alarm",
          "ALB + Multi-AZ Auto Scaling group with ELB health checks",
          "One t3.large with an Elastic IP",
          "Manually restart instances during incidents"
        ],
        correctAnswer: 1,
        difficulty: "low",
        explanation: "Spread capacity across AZs and let ELB/ASG health checks replace unhealthy targets automatically.",
        explanationRich:
          "Deploy an <strong>ALB</strong> across multiple subnets (AZs) and an <strong>ASG</strong> with <em>ELB health checks</em>. The ASG will terminate and replace unhealthy instances, and rebalance across AZs. Add <strong>grace period</strong>, <strong>warm pools</strong>, and <strong>instance refresh</strong> for safe rollouts.",
        links: [
          { title: "AWS Docs — Health checks with ASG", url: "https://docs.aws.amazon.com/autoscaling/ec2/userguide/health-checks.html" },
          { title: "AWS Docs — Target health", url: "https://docs.aws.amazon.com/elasticloadbalancing/latest/application/target-group-health-checks.html" }
        ]
      },
      {
        question: "You need RTO≈0 and low RPO globally for a key-value workload. What’s the best AWS data layer?",
        options: [
          "RDS Multi-AZ",
          "Aurora Global Database (writes in one Region only)",
          "DynamoDB Global Tables (multi-active)",
          "Self-managed MySQL with cross-Region replicas"
        ],
        correctAnswer: 2,
        difficulty: "high",
        explanation: "Global Tables provide multi-Region, multi-active writes with conflict resolution for low RTO and low RPO.",
        explanationRich:
          "<strong>DynamoDB Global Tables</strong> replicate changes across Regions in a <em>multi-active</em> pattern, providing local read/write latency and last-writer-wins conflict resolution. Validate partition keys, conditional writes, and backpressure handling.",
        links: [
          { title: "AWS Docs — DynamoDB Global Tables", url: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GlobalTables.html" }
        ]
      }
    ]
  }
];

// ---------------------------------------------------------------------
// 2) Microsoft AZ-104 — Azure Administrator (Associate) — 10 Qs
// Domains: Identities & Governance; Storage; Compute; Virtual Networking; Monitor & Backup
// ---------------------------------------------------------------------
const az104_questions = [
  {
    category: "Domain 1: Manage Azure identities and governance",
    questions: [
      {
        question: "You need to grant a support engineer time-bound, least-privilege access to troubleshoot a VM in production. Which Azure feature should you use?",
        options: [
          "Assign Owner permanently at the subscription scope",
          "Create a custom role with all actions and assign permanently",
          "Use Azure AD Privileged Identity Management (PIM) with eligible role assignment and approval workflow",
          "Share the service principal secret"
        ],
        correctAnswer: 2,
        difficulty: "medium",
        explanation: "PIM provides just-in-time, time-bound role activation with approval, MFA, and audit.",
        explanationRich:
          "<strong>Azure AD PIM</strong> lets you assign <em>eligible</em> roles (e.g., <em>Virtual Machine Contributor</em>) that users must <em>activate</em> with MFA and approval for a limited duration. This enforces least privilege and provides full auditing.",
        links: [
          { title: "Microsoft Docs — What is Azure AD PIM?", url: "https://learn.microsoft.com/azure/active-directory/privileged-identity-management/pim-configure" },
          { title: "Microsoft Docs — Role management in PIM", url: "https://learn.microsoft.com/azure/active-directory/privileged-identity-management/pim-resource-roles-assign-roles" }
        ]
      },
      {
        question: "A policy must prevent creation of public IP addresses in a specific subscription. What should you deploy?",
        options: [
          "Role assignment at resource group",
          "Azure Policy with a DENY effect",
          "Azure Blueprints without policies",
          "Activity log alert"
        ],
        correctAnswer: 1,
        difficulty: "low",
        explanation: "Azure Policy can enforce organizational standards with effects like Deny/Audit/Append.",
        explanationRich:
          "Create an <strong>Azure Policy</strong> definition to <em>deny</em> public IP creation and assign it at <em>subscription</em> or <em>management group</em>. Monitor compliance in Policy and remediate via initiatives.",
        links: [
          { title: "Microsoft Docs — Azure Policy overview", url: "https://learn.microsoft.com/azure/governance/policy/overview" }
        ]
      }
    ]
  },
  {
    category: "Domain 2: Implement and manage storage",
    questions: [
      {
        question: "Your app requires immutable, write-once storage to protect logs from tampering. Which feature should you enable?",
        options: [
          "Cool access tier only",
          "Soft delete for blobs",
          "Immutable storage with legal hold or time-based retention",
          "Geo-redundant storage only"
        ],
        correctAnswer: 2,
        difficulty: "medium",
        explanation: "Immutable storage provides WORM (write once, read many) guarantees for compliance.",
        explanationRich:
          "Enable <strong>immutable storage</strong> (time-based retention or legal holds) at the container level for <strong>Azure Blob Storage</strong>. This prevents modification or deletion until the retention period expires or the legal hold is cleared.",
        links: [
          { title: "Microsoft Docs — Immutable storage for Azure Blob", url: "https://learn.microsoft.com/azure/storage/blobs/immutable-storage-overview" }
        ]
      },
      {
        question: "You need to migrate large on-premises file shares to Azure Files with minimal downtime. Which tool is recommended?",
        options: [
          "Robocopy only",
          "AzCopy v10 with SMB to Azure Files and incremental sync",
          "Manual copy via RDP",
          "FTP to a VM"
        ],
        correctAnswer: 1,
        difficulty: "low",
        explanation: "AzCopy supports efficient, resumable, and parallel transfers with SMB semantics.",
        explanationRich:
          "<strong>AzCopy v10</strong> can copy SMB file shares to <strong>Azure Files</strong> efficiently with <em>resumable</em> and <em>parallel</em> transfers. For hybrid access, enable <strong>Azure File Sync</strong> with cloud tiering.",
        links: [
          { title: "Microsoft Docs — AzCopy", url: "https://learn.microsoft.com/azure/storage/common/storage-use-azcopy-v10" },
          { title: "Microsoft Docs — Azure File Sync", url: "https://learn.microsoft.com/azure/storage/files/storage-sync-files-planning" }
        ]
      }
    ]
  },
  {
    category: "Domain 3: Deploy and manage Azure compute resources",
    questions: [
      {
        question: "You need automated OS patching and application updates across many VMs with maintenance windows. Which Azure capability fits?",
        options: [
          "Manual patching via RDP",
          "Azure Automation Update Management / Azure Update Manager",
          "Install updates only on first boot",
          "Rely on VM Scale Set automatic OS upgrades without testing"
        ],
        correctAnswer: 1,
        difficulty: "medium",
        explanation: "Use Update Management (now Azure Update Manager) for scheduled patching and compliance reporting.",
        explanationRich:
          "<strong>Azure Update Manager</strong> schedules <em>maintenance windows</em>, orchestrates patch installation, and reports compliance across Windows/Linux VMs, scale sets, and Arc-enabled servers.",
        links: [
          { title: "Microsoft Docs — Azure Update Manager", url: "https://learn.microsoft.com/azure/update-center/overview" }
        ]
      },
      {
        question: "Stateless web apps must scale automatically with zero node management. What should you choose?",
        options: [
          "VM Scale Sets with manual instance management",
          "Azure Kubernetes Service (AKS) only",
          "Azure App Service with autoscale",
          "Cloud Services (classic)"
        ],
        correctAnswer: 2,
        difficulty: "low",
        explanation: "App Service is PaaS for web apps with built-in autoscale, patches, and zero OS management.",
        explanationRich:
          "<strong>Azure App Service</strong> provides managed runtime, CI/CD integration, <strong>autoscaling</strong>, SSL offload, and staging slots. For containers, use <em>Web App for Containers</em> or <strong>Azure Container Apps</strong> for microservices.",
        links: [
          { title: "Microsoft Docs — Azure App Service", url: "https://learn.microsoft.com/azure/app-service/overview" },
          { title: "Microsoft Docs — Autoscale overview", url: "https://learn.microsoft.com/azure/azure-monitor/autoscale/autoscale-overview" }
        ]
      }
    ]
  },
  {
    category: "Domain 4: Configure and manage virtual networking",
    questions: [
      {
        question: "You need private access from subnets to Azure Storage and SQL without exposing public internet paths. What should you configure?",
        options: [
          "NAT Gateway only",
          "Application Gateway",
          "Private Endpoints (Private Link) for the services",
          "ExpressRoute"
        ],
        correctAnswer: 2,
        difficulty: "medium",
        explanation: "Private Endpoints map services to private IPs in your VNet.",
        explanationRich:
          "Use <strong>Azure Private Link</strong> to create <strong>Private Endpoints</strong> for PaaS services (e.g., Blob, SQL). DNS resolves service FQDNs to private IPs, keeping traffic on the Microsoft backbone.",
        links: [
          { title: "Microsoft Docs — Azure Private Link", url: "https://learn.microsoft.com/azure/private-link/private-link-overview" }
        ]
      },
      {
        question: "You must connect multiple VNets and on-premises networks at scale with centralized routing. What should you use?",
        options: [
          "VNet peering full mesh",
          "Point-to-site VPN per VM",
          "Azure Virtual WAN or Azure Route Server with NVA",
          "User-defined routes only"
        ],
        correctAnswer: 2,
        difficulty: "high",
        explanation: "Virtual WAN centralizes large-scale connectivity; Route Server simplifies BGP with NVAs.",
        explanationRich:
          "<strong>Azure Virtual WAN</strong> provides a managed hub-and-spoke for connecting VNets, branches (IPSec), and ExpressRoute. Alternatively, <strong>Azure Route Server</strong> enables BGP with NVAs for dynamic routing.",
        links: [
          { title: "Microsoft Docs — Azure Virtual WAN", url: "https://learn.microsoft.com/azure/virtual-wan/virtual-wan-about" },
          { title: "Microsoft Docs — Azure Route Server", url: "https://learn.microsoft.com/azure/route-server/route-server-overview" }
        ]
      }
    ]
  },
  {
    category: "Domain 5: Monitor and maintain Azure resources (including backup)",
    questions: [
      {
        question: "You require centralized log collection and Kusto-based queries across subscriptions. Which service do you use?",
        options: [
          "Activity log only",
          "Azure Monitor Logs with Log Analytics workspaces",
          "Diagnostic settings to a storage account only",
          "Application Insights classic"
        ],
        correctAnswer: 1,
        difficulty: "low",
        explanation: "Log Analytics provides centralized logs and KQL queries.",
        explanationRich:
          "Enable <strong>diagnostic settings</strong> to send platform logs/metrics to <strong>Log Analytics</strong>. Use <strong>Azure Monitor</strong> queries (KQL), alerts, workbooks, and cross-resource queries.",
        links: [
          { title: "Microsoft Docs — Azure Monitor Logs", url: "https://learn.microsoft.com/azure/azure-monitor/logs/log-analytics-overview" }
        ]
      },
      {
        question: "Backups must meet long-term retention and application-consistent snapshots for VMs. What should you implement?",
        options: [
          "AzCopy to another region",
          "Azure Backup with Recovery Services vault and policies",
          "Manual snapshots only",
          "RAID on the VM"
        ],
        correctAnswer: 1,
        difficulty: "medium",
        explanation: "Azure Backup provides policies, app-consistent snapshots, and vaults with retention.",
        explanationRich:
          "Use <strong>Azure Backup</strong> to protect VMs, SQL, and files. Configure <strong>Recovery Services vault</strong> with <em>retention policies</em>, application-consistent snapshots (VSS), and cross-region restore (where supported).",
        links: [
          { title: "Microsoft Docs — Azure Backup overview", url: "https://learn.microsoft.com/azure/backup/backup-overview" }
        ]
      }
    ]
  }
];

// ---------------------------------------------------------------------
// 3) Microsoft AZ-305 — Designing Microsoft Azure Infrastructure Solutions (Expert) — 10 Qs
// Domains: Design Identity, Governance & Monitoring; Design Data Storage; Design Business Continuity; Design Infrastructure
// ---------------------------------------------------------------------
const az305_questions = [
  {
    category: "Domain 1: Design identity, governance, and monitoring solutions",
    questions: [
      {
        question: "You must design a multi-tenant app with B2B access and least-privilege permissions to Microsoft Graph. What should you recommend?",
        options: [
          "Use Azure AD B2C with user flows only and grant Graph .ReadWrite.All",
          "Use Azure AD external identities (B2B) with app roles and least-privileged Graph scopes consented by admin",
          "Create a directory for each customer and sync identities",
          "Use anonymous access"
        ],
        correctAnswer: 1,
        difficulty: "high",
        explanation: "B2B invites guests, app roles define authorization, and Graph scopes should be minimal with admin consent.",
        explanationRich:
          "Adopt <strong>Azure AD external identities (B2B)</strong> for cross-tenant collaboration. Define <strong>app roles</strong>/<em>role assignments</em> and request only the minimal <strong>Graph API permissions</strong> (application/delegated). Use <strong>Conditional Access</strong> and <strong>PIM</strong> for privileged roles.",
        links: [
          { title: "Microsoft Docs — Azure AD external identities (B2B)", url: "https://learn.microsoft.com/azure/active-directory/external-identities/what-is-b2b" },
          { title: "Microsoft Docs — App roles", url: "https://learn.microsoft.com/azure/active-directory/develop/howto-add-app-roles-in-azure-ad-apps" },
          { title: "Microsoft Docs — Graph permissions", url: "https://learn.microsoft.com/graph/permissions-reference" }
        ]
      },
      {
        question: "You need guardrails to enforce tagging, region restrictions, and SKU limitations at scale. What should you use?",
        options: [
          "Azure RBAC only",
          "Azure Policy initiatives assigned at management group scope",
          "Activity Log Alerts",
          "Blueprints without policies"
        ],
        correctAnswer: 1,
        difficulty: "medium",
        explanation: "Policy initiatives combine multiple definitions and can be assigned at MG scope for inheritance.",
        explanationRich:
          "Create <strong>Azure Policy</strong> definitions for allowed locations/SKUs and required tags, group them into an <strong>initiative</strong>, and assign at <strong>management group</strong> to inherit across subscriptions. Use <em>deny</em>, <em>audit</em>, and <em>deployIfNotExists</em> effects.",
        links: [
          { title: "Microsoft Docs — Azure Policy initiatives", url: "https://learn.microsoft.com/azure/governance/policy/concepts/initiative-definition" }
        ]
      }
    ]
  },
  {
    category: "Domain 2: Design data storage solutions",
    questions: [
      {
        question: "A data platform must support low-latency key-value access and global distribution. Which service fits best?",
        options: [
          "Azure SQL Database single instance",
          "Azure Cosmos DB with multiple write regions",
          "Azure Files",
          "Storage queue"
        ],
        correctAnswer: 1,
        difficulty: "medium",
        explanation: "Cosmos DB provides multi-master, low-latency global distribution with tunable consistency.",
        explanationRich:
          "<strong>Azure Cosmos DB</strong> supports <strong>multi-region writes</strong>, <em>tunable consistency</em>, and APIs (Core/SQL, Mongo, Cassandra, Gremlin, Table). Choose a consistency level to balance latency and correctness; enable <em>autoscale throughput</em>.",
        links: [
          { title: "Microsoft Docs — Cosmos DB global distribution", url: "https://learn.microsoft.com/azure/cosmos-db/distribute-data-globally" },
          { title: "Microsoft Docs — Consistency levels", url: "https://learn.microsoft.com/azure/cosmos-db/consistency-levels" }
        ]
      },
      {
        question: "Analytics teams query petabytes stored in ADLS. How do you reduce cost and improve query performance?",
        options: [
          "Keep CSV and increase cluster size",
          "Store data in Parquet with partitioned folders and query via Azure Synapse Serverless SQL or Azure Databricks",
          "Copy data to premium disks first",
          "Convert to JSON"
        ],
        correctAnswer: 1,
        difficulty: "medium",
        explanation: "Columnar storage + partition pruning reduces scanned data; serverless engines are pay-per-query.",
        explanationRich:
          "Convert datasets to <strong>Parquet</strong> and partition by date/tenant. Query with <strong>Synapse Serverless SQL</strong> or <strong>Databricks</strong>, leveraging <em>predicate pushdown</em> and <em>partition pruning</em> to lower scan cost and latency.",
        links: [
          { title: "Microsoft Docs — Synapse Serverless SQL", url: "https://learn.microsoft.com/azure/synapse-analytics/sql/on-demand-workspace-overview" },
          { title: "Microsoft Docs — Data Lake storage best practices", url: "https://learn.microsoft.com/azure/storage/blobs/data-lake-storage-best-practices" }
        ]
      }
    ]
  },
  {
    category: "Domain 3: Design business continuity solutions",
    questions: [
      {
        question: "You must achieve RPO of near-zero and RTO minutes for a mission-critical SQL workload. Which design is appropriate?",
        options: [
          "Geo-redundant storage backups only",
          "Azure SQL Managed Instance with Auto-failover groups across regions",
          "Single-region Azure SQL Database",
          "Copy-only backups to another storage account"
        ],
        correctAnswer: 1,
        difficulty: "high",
        explanation: "Auto-failover groups provide cross-region replication and automatic failover/failback.",
        explanationRich:
          "Use <strong>Azure SQL Managed Instance</strong> (or <strong>Azure SQL Database</strong>) with <strong>Auto-failover groups</strong> to replicate to a secondary region and fail over automatically based on health, achieving low RPO/RTO.",
        links: [
          { title: "Microsoft Docs — Auto-failover groups", url: "https://learn.microsoft.com/azure/azure-sql/database/auto-failover-group-overview" }
        ]
      },
      {
        question: "A company needs zone and region failure protection for a web app. Which layered design is best?",
        options: [
          "Single App Service plan in one zone",
          "App Service with deployment across zones and Azure Front Door for global failover",
          "One VM with a public IP",
          "DNS CNAME to a single regional endpoint"
        ],
        correctAnswer: 1,
        difficulty: "medium",
        explanation: "Use zonal redundancy and a global entry point for failover and performance.",
        explanationRich:
          "Deploy <strong>App Service</strong> across <strong>Availability Zones</strong> (or multiple regions) and front with <strong>Azure Front Door</strong> for global routing, health probes, and failover. Store session state in a distributed cache (e.g., <strong>Azure Cache for Redis</strong>).",
        links: [
          { title: "Microsoft Docs — Azure Front Door", url: "https://learn.microsoft.com/azure/frontdoor/front-door-overview" },
          { title: "Microsoft Docs — App Service high availability", url: "https://learn.microsoft.com/azure/app-service/manage-scale-up" }
        ]
      }
    ]
  },
  {
    category: "Domain 4: Design infrastructure solutions",
    questions: [
      {
        question: "You must design secure hybrid connectivity with predictable performance and private access to PaaS services. What should you choose?",
        options: [
          "Site-to-site VPN only",
          "ExpressRoute + Private DNS + Private Endpoints",
          "Public internet with NSGs",
          "Bastion only"
        ],
        correctAnswer: 1,
        difficulty: "medium",
        explanation: "ExpressRoute provides private connectivity; Private Endpoints secure PaaS access on private IP.",
        explanationRich:
          "Use <strong>ExpressRoute</strong> (private peering) to connect on-prem to Azure VNets over the Microsoft backbone. Add <strong>Private Endpoints</strong> and <strong>Private DNS</strong> zones for PaaS services (e.g., Storage/SQL) to keep traffic private.",
        links: [
          { title: "Microsoft Docs — ExpressRoute overview", url: "https://learn.microsoft.com/azure/expressroute/expressroute-introduction" },
          { title: "Microsoft Docs — Private Link/Endpoints", url: "https://learn.microsoft.com/azure/private-link/private-link-overview" }
        ]
      },
      {
        question: "Containerized microservices must scale to zero and support Dapr, KEDA-based event-driven autoscaling, and revisions/traffic-splitting. Which service fits?",
        options: [
          "AKS only with HPA",
          "Azure Container Apps",
          "App Service Linux",
          "Azure Functions only"
        ],
        correctAnswer: 1,
        difficulty: "medium",
        explanation: "Azure Container Apps (ACA) provides serverless containers with Dapr and KEDA integrations.",
        explanationRich:
          "<strong>Azure Container Apps</strong> supports <em>scale to zero</em>, <strong>KEDA</strong> for event-driven autoscaling, <strong>Dapr</strong> building blocks (service invocation/pub-sub), and <em>revisions</em> for blue/green/canary routing.",
        links: [
          { title: "Microsoft Docs — Azure Container Apps", url: "https://learn.microsoft.com/azure/container-apps/overview" },
          { title: "Microsoft Docs — KEDA on ACA", url: "https://learn.microsoft.com/azure/container-apps/scale-app" }
        ]
      }
    ]
  }
];

// ---------------------------------------------
// Export / attach to window like your SAA file
// ---------------------------------------------
const questionBanks = {
  "AWS DevOps Engineer Professional (DOP-C02)": aws_dop_questions,
  "Microsoft AZ-104 (Azure Administrator)": az104_questions,
  "Microsoft AZ-305 (Azure Architect)": az305_questions
};

if (typeof window !== "undefined") window.questionBanks = questionBanks;
if (typeof module !== "undefined") module.exports = questionBanks;
