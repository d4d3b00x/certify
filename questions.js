// AWS Solutions Architect Associate — Exam Simulation Bank (ENRICHED, NEW)
// 20 questions total: 5 per domain.
// Fields preserved: question, options, correctAnswer (index), difficulty, explanation, explanationRich, links.

const questions = [
  // -------------------- Domain 1 --------------------
  {
    category: "Domain 1: Design Secure Architectures",
    questions: [
      {
        question: "How can you ensure that private subnets access Amazon S3 without traversing the public internet and only from a specific VPC endpoint?",
        options: [
          "Use a NAT Gateway and security groups allowing 0.0.0.0/0",
          "Create an S3 interface VPC endpoint and open the bucket to the VPC CIDR",
          "Create an S3 Gateway VPC Endpoint and restrict the S3 bucket policy with aws:SourceVpce",
          "Peer the VPC with another VPC that has internet access"
        ],
        correctAnswer: 2,
        difficulty: "medium",
        explanation: "S3 Gateway Endpoints provide private connectivity from route tables. Use a bucket policy with aws:SourceVpce to allow only that endpoint.",
        explanationRich:
          "Create an <strong>Amazon S3 Gateway VPC Endpoint</strong> and update private subnet route tables to target the endpoint for S3 prefixes. Add a <strong>bucket policy</strong> condition <code>aws:SourceVpce</code> to allow requests only when they arrive via that endpoint. This keeps traffic on the AWS network, removes the need for NAT for S3 access, and reduces exposure and NAT charges.",
        links: [
          { title: "AWS Docs — Gateway Endpoints for S3", url: "https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints-s3.html" },
          { title: "AWS Docs — Example S3 endpoint policies", url: "https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints-s3.html#vpce-policy-examples-s3" },
          { title: "AWS Docs — Example bucket policies using aws:SourceVpce", url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/example-bucket-policies-vpc-endpoint.html" }
        ]
      },
      {
        question: "On Amazon EKS, which approach grants a specific Kubernetes service account least-privilege access to AWS APIs?",
        options: [
          "Attach an instance profile role to all worker nodes",
          "Hardcode access keys in a Kubernetes Secret",
          "Use IAM Roles for Service Accounts (IRSA) with an OIDC provider",
          "Run a sidecar container that shares root credentials"
        ],
        correctAnswer: 2,
        difficulty: "medium",
        explanation: "IRSA maps a Kubernetes service account to an IAM role via OIDC, issuing scoped, short-lived credentials.",
        explanationRich:
          "Configure an <strong>OIDC identity provider</strong> for the cluster and create an <strong>IAM role</strong> with a trust policy for the service account and namespace. Annotate the service account with the role ARN. The pod receives <em>temporary</em>, <em>least-privilege</em> credentials (no node-level credential sharing), improving isolation and auditability.",
        links: [
          { title: "AWS Docs — IAM Roles for Service Accounts (IRSA)", url: "https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html" },
          { title: "AWS Blog — Fine-grained IAM with IRSA", url: "https://aws.amazon.com/blogs/opensource/introducing-fine-grained-iam-roles-service-accounts/" }
        ]
      },
      {
        question: "You need centralized key control, auditing, and fine-grained grants for encrypting data across EBS, RDS, and S3. Which option fits best?",
        options: [
          "Client-side encryption with keys stored in Git",
          "AWS KMS with Customer Managed Keys (CMKs)",
          "SSE-S3 only with S3-managed keys",
          "Use CloudHSM without KMS"
        ],
        correctAnswer: 1,
        difficulty: "low",
        explanation: "KMS CMKs offer key policies, grants, rotation, and CloudTrail logging, and integrate with many AWS services.",
        explanationRich:
          "With <strong>AWS KMS customer managed keys</strong>, you get centralized administration, <strong>key policies</strong>, <strong>grants</strong> for delegated access, optional <em>automatic rotation</em>, and full <strong>CloudTrail</strong> audit of cryptographic API calls. Many services (EBS, RDS, S3, EFS, Lambda) natively integrate with KMS for encryption at rest.",
        links: [
          { title: "AWS Docs — KMS Concepts", url: "https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html" },
          { title: "AWS Docs — KMS Key Policies and Grants", url: "https://docs.aws.amazon.com/kms/latest/developerguide/key-policies.html" },
          { title: "AWS Docs — AWS Service Integration with KMS", url: "https://docs.aws.amazon.com/kms/latest/developerguide/service-integration.html" }
        ]
      },
      {
        question: "A serverless workload in private subnets must read AWS Secrets Manager without internet access. What’s the most secure and operationally simple design?",
        options: [
          "Give Lambda a NAT route to reach the public Secrets Manager endpoint",
          "Store secrets in Lambda environment variables with KMS encryption",
          "Create an Interface VPC Endpoint (PrivateLink) for Secrets Manager and allow access via endpoint policy",
          "Place the secret in a private S3 bucket"
        ],
        correctAnswer: 2,
        difficulty: "medium",
        explanation: "Use an Interface VPC Endpoint to keep traffic private and control access with endpoint and IAM policies.",
        explanationRich:
          "Create a <strong>Secrets Manager interface VPC endpoint</strong> in your subnets. Grant the Lambda execution role <code>secretsmanager:GetSecretValue</code> on the specific secret ARN and constrain network access with the <strong>endpoint policy</strong>. This keeps traffic on private IPs and removes the need for NAT.",
        links: [
          { title: "AWS Docs — Interface VPC Endpoints (AWS PrivateLink)", url: "https://docs.aws.amazon.com/vpc/latest/privatelink/endpoint-services-overview.html" },
          { title: "AWS Docs — Secrets Manager Overview", url: "https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html" }
        ]
      },
      {
        question: "You want to centrally detect S3 public access, suspicious IAM activity, and aggregate security findings across accounts. What should you deploy?",
        options: [
          "CloudWatch Logs only",
          "AWS GuardDuty and AWS Security Hub integrated with AWS Organizations",
          "VPC Flow Logs only",
          "Amazon Inspector classic"
        ],
        correctAnswer: 1,
        difficulty: "medium",
        explanation: "GuardDuty provides continuous threat detection; Security Hub aggregates findings and standards scores across accounts.",
        explanationRich:
          "Enable <strong>Amazon GuardDuty</strong> for intelligent threat detection across CloudTrail, VPC Flow Logs, and DNS logs. Turn on <strong>AWS Security Hub</strong> to aggregate <em>findings</em> (GuardDuty, Inspector, Macie, partner tools) and to evaluate against standards (CIS, Foundational Security Best Practices). Use <strong>Organizations</strong> for delegated admin and central visibility.",
        links: [
          { title: "AWS Docs — Amazon GuardDuty", url: "https://docs.aws.amazon.com/guardduty/latest/ug/what-is-guardduty.html" },
          { title: "AWS Docs — AWS Security Hub", url: "https://docs.aws.amazon.com/securityhub/latest/userguide/what-is-securityhub.html" },
          { title: "AWS Docs — Delegated Admin with Organizations", url: "https://docs.aws.amazon.com/organizations/latest/userguide/orgs_integrate_services.html" }
        ]
      }
    ]
  },

  // -------------------- Domain 2 --------------------
  {
    category: "Domain 2: Design Resilient Architectures",
    questions: [
      {
        question: "How do you increase availability of a stateless web tier within a Region?",
        options: [
          "Single EC2 instance with an Elastic IP",
          "Auto Scaling group across multiple Availability Zones behind an Application Load Balancer",
          "One Auto Scaling group in a single Availability Zone",
          "Route 53 weighted routing to a single AZ"
        ],
        correctAnswer: 1,
        difficulty: "low",
        explanation: "Distribute capacity across multiple AZs behind an ALB and use health checks to replace unhealthy targets.",
        explanationRich:
          "Deploy an <strong>ALB</strong> and a multi-AZ <strong>EC2 Auto Scaling group</strong>. Target group health checks remove bad instances; the ASG <em>replenishes</em> capacity automatically. Use <em>target tracking</em> or <em>step scaling</em>, enable <em>warm pools</em> for faster scale-out, and set <em>connection draining</em> (deregistration delay) for graceful rotations.",
        links: [
          { title: "AWS Docs — ALB + Auto Scaling", url: "https://docs.aws.amazon.com/autoscaling/ec2/userguide/attach-load-balancer-asg.html" },
          { title: "AWS Docs — Target Group Health Checks", url: "https://docs.aws.amazon.com/elasticloadbalancing/latest/application/target-group-health-checks.html" }
        ]
      },
      {
        question: "Which database configuration provides automatic failover across AZs for PostgreSQL with minimal operation?",
        options: [
          "Self-managed PostgreSQL with cron-based failover",
          "Amazon RDS Single-AZ with frequent snapshots",
          "Amazon RDS Multi-AZ deployment",
          "Amazon Aurora Global Database"
        ],
        correctAnswer: 2,
        difficulty: "low",
        explanation: "RDS Multi-AZ maintains a synchronous standby in another AZ and fails over automatically.",
        explanationRich:
          "<strong>Amazon RDS Multi-AZ</strong> keeps a synchronous standby and performs <em>automatic failover</em> during maintenance or infrastructure events. Applications reconnect to the same endpoint. Consider <strong>RDS Proxy</strong> for connection pooling and faster recovery under failovers.",
        links: [
          { title: "AWS Docs — RDS Multi-AZ", url: "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html" },
          { title: "AWS Docs — RDS Proxy", url: "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-proxy.html" }
        ]
      },
      {
        question: "Your static site must remain available during a Regional S3 disruption. What should you implement?",
        options: [
          "S3 Standard in one Region only",
          "S3 Cross-Region Replication (CRR) and CloudFront origin failover",
          "Copy objects manually every month",
          "Single CloudFront origin pointing at one S3 bucket"
        ],
        correctAnswer: 1,
        difficulty: "medium",
        explanation: "CRR replicates objects to another Region; CloudFront origin failover serves the healthy origin.",
        explanationRich:
          "Enable <strong>Versioning</strong> and <strong>CRR</strong> to a secondary Region. Configure <strong>CloudFront origin groups</strong> with primary/secondary origins for automatic failover. Consider <em>Replication Time Control (RTC)</em> for predictable replication SLAs when required.",
        links: [
          { title: "AWS Docs — S3 Replication", url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html" },
          { title: "AWS Docs — CloudFront Origin Failover", url: "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/high_availability_origin_failover.html" }
        ]
      },
      {
        question: "How do you design a multi-Region API with the lowest RTO/RPO and global low latency?",
        options: [
          "Snapshot-based restore to a cold standby",
          "Active-active with Route 53 latency-based routing and globally replicated data",
          "Manual DNS switch to a warm standby",
          "Single Region with increased instance size"
        ],
        correctAnswer: 1,
        difficulty: "high",
        explanation: "Run active-active in multiple Regions and replicate state (e.g., DynamoDB Global Tables). Use DNS latency routing and health checks.",
        explanationRich:
          "Deploy in at least two Regions, replicate state with <strong>DynamoDB Global Tables</strong> (multi-active) or <strong>Aurora Global Database</strong> (read-local, write-primary). Use <strong>Route 53</strong> latency-based routing + health checks for global user placement and failover.",
        links: [
          { title: "AWS Whitepaper — Multi-Region Architectures", url: "https://docs.aws.amazon.com/whitepapers/latest/aws-building-fault-tolerant-applications/multi-region-architectures.html" },
          { title: "AWS Docs — Route 53 Routing Policies", url: "https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html" }
        ]
      },
      {
        question: "A streaming system must handle producer spikes and consumer outages without losing events. Which design is best?",
        options: [
          "Direct synchronous HTTP between producers and consumers",
          "Amazon Kinesis Data Streams with multiple shards and enhanced fan-out",
          "Store events in memory on the consumer",
          "Use SQS with visibility timeout of 0 seconds"
        ],
        correctAnswer: 1,
        difficulty: "high",
        explanation: "Kinesis provides durable, ordered shards, retention, and enhanced fan-out for consumer isolation.",
        explanationRich:
          "<strong>Kinesis Data Streams</strong> stores data durably for a configurable retention window, letting consumers <em>checkpoint</em> and catch up after outages. <em>Enhanced fan-out</em> gives each consumer dedicated throughput, reducing contention and improving resilience.",
        links: [
          { title: "AWS Docs — Kinesis Data Streams", url: "https://docs.aws.amazon.com/streams/latest/dev/introduction.html" },
          { title: "AWS Docs — Enhanced Consumers", url: "https://docs.aws.amazon.com/streams/latest/dev/enhanced-consumers.html" }
        ]
      }
    ]
  },

  // -------------------- Domain 3 --------------------
  {
    category: "Domain 3: Design High-Performing Architectures",
    questions: [
      {
        question: "How can you reduce read latency for frequently requested items without changing your database engine?",
        options: [
          "Place all data in a single large EC2 instance",
          "Use Amazon ElastiCache for Redis as a cache layer",
          "Migrate to S3 for reads",
          "Increase RDS instance size only"
        ],
        correctAnswer: 1,
        difficulty: "low",
        explanation: "A cache layer such as ElastiCache for Redis provides sub-millisecond reads and offloads the database.",
        explanationRich:
          "<strong>ElastiCache for Redis</strong> offers rich data structures, sub-ms latency, and clustering for scale. Common patterns: <em>read-through</em>, <em>write-through</em>, and <em>cache-aside</em>. Enable TLS/auth, Multi-AZ with auto-failover, and appropriate eviction policies to meet performance and availability goals.",
        links: [
          { title: "AWS Docs — What is ElastiCache for Redis?", url: "https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/WhatIs.html" },
          { title: "AWS Docs — Choosing Redis vs. Memcached", url: "https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/SelectEngine.html" }
        ]
      },
      {
        question: "Global users upload large files to your S3 bucket. Which approach maximizes upload performance?",
        options: [
          "Store files on EBS then copy later",
          "Use S3 Transfer Acceleration and multipart upload",
          "Increase the size of an EC2 instance in one Region",
          "Disable checksums on upload"
        ],
        correctAnswer: 1,
        difficulty: "medium",
        explanation: "Transfer Acceleration uses edge locations and the AWS backbone; multipart upload increases throughput and resiliency.",
        explanationRich:
          "Enable <strong>S3 Transfer Acceleration</strong> so clients post to the nearest edge; combine with <strong>multipart upload</strong> (parallel parts, retries, checksums). This reduces latency from distant locations and improves success rates for large objects.",
        links: [
          { title: "AWS Docs — S3 Transfer Acceleration", url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/transfer-acceleration.html" },
          { title: "AWS Docs — Multipart Upload Overview", url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html" }
        ]
      },
      {
        question: "Your analytics team runs ad-hoc SQL over PB-scale data in S3. How do you improve both performance and cost?",
        options: [
          "Store data as CSV and use EC2-hosted Presto",
          "Convert to columnar formats (Parquet/ORC) and query with Amazon Athena",
          "Copy to EBS volumes before querying",
          "Keep JSON and increase concurrency"
        ],
        correctAnswer: 1,
        difficulty: "medium",
        explanation: "Columnar formats reduce scanned bytes; Athena charges per data scanned and is serverless.",
        explanationRich:
          "Convert datasets to <strong>Parquet/ORC</strong>, partition by time or high-cardinality dimensions, and maintain schemas in the <strong>AWS Glue Data Catalog</strong>. Athena then scans fewer bytes per query, decreasing cost and latency.",
        links: [
          { title: "AWS Docs — Athena Performance Tuning", url: "https://docs.aws.amazon.com/athena/latest/ug/performance-tuning.html" },
          { title: "AWS Docs — AWS Glue Data Catalog", url: "https://docs.aws.amazon.com/glue/latest/dg/populate-data-catalog.html" }
        ]
      },
      {
        question: "A latency-sensitive workload on EC2 requires high, predictable IOPS at low latency. Which EBS volume type fits best for most cases with cost control?",
        options: [
          "st1 (Throughput Optimized HDD)",
          "sc1 (Cold HDD)",
          "gp3 (General Purpose SSD) with provisioned IOPS/throughput as needed",
          "io2 Block Express in every case"
        ],
        correctAnswer: 2,
        difficulty: "low",
        explanation: "gp3 lets you provision extra IOPS and throughput independent of volume size with good price/performance.",
        explanationRich:
          "<strong>gp3</strong> decouples capacity from performance. If you need the highest durability and ultra-low latency for critical workloads, consider <strong>io2/io2 Block Express</strong>. Always pair with <em>EBS-optimized</em> instances for consistent throughput.",
        links: [
          { title: "AWS Docs — EBS Volume Types", url: "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ebs-volume-types.html" }
        ]
      },
      {
        question: "Your ALB-backed application suffers from high network latency for users far from your Regions. You cannot cache responses. What helps most?",
        options: [
          "Amazon CloudFront in front of the ALB for dynamic caching",
          "AWS Global Accelerator pointing to the ALB endpoints",
          "Route 53 latency-based routing only",
          "Increase ALB idle timeout"
        ],
        correctAnswer: 1,
        difficulty: "medium",
        explanation: "Global Accelerator provides Anycast static IPs and routes over the AWS global network to the nearest healthy endpoint.",
        explanationRich:
          "<strong>AWS Global Accelerator</strong> accelerates TCP/UDP traffic without caching by optimizing the network path over the AWS backbone. It improves latency and jitter for dynamic apps, gaming, real-time communications, and APIs that can’t be cached.",
        links: [
          { title: "AWS Docs — What is Global Accelerator?", url: "https://docs.aws.amazon.com/global-accelerator/latest/dg/what-is-global-accelerator.html" }
        ]
      }
    ]
  },

  // -------------------- Domain 4 --------------------
  {
    category: "Domain 4: Design Cost-Optimized Architectures",
    questions: [
      {
        question: "A steady 24/7 container workload will run for 1–3 years. Which purchasing model most reduces cost while preserving flexibility?",
        options: [
          "On-Demand only",
          "Standard Reserved Instances for a fixed instance type",
          "Compute Savings Plans (e.g., 3-year)",
          "Spot Instances only"
        ],
        correctAnswer: 2,
        difficulty: "low",
        explanation: "Compute Savings Plans provide significant discounts across instance families, Regions (same plan type), and cover Fargate and Lambda.",
        explanationRich:
          "<strong>Savings Plans</strong> apply automatically to eligible compute usage (EC2, Fargate, Lambda). A 3-year plan often yields the largest savings while allowing instance family/size/OS changes. Combine with autoscaling and occasional Spot for additional savings.",
        links: [
          { title: "AWS Docs — What is Savings Plans?", url: "https://docs.aws.amazon.com/savingsplans/latest/userguide/what-is-savings-plans.html" },
          { title: "AWS Docs — How Savings Plans Apply", url: "https://docs.aws.amazon.com/savingsplans/latest/userguide/how-savings-plans-work.html" }
        ]
      },
      {
        question: "Your NAT Gateway bill is high due to S3 and DynamoDB access from private subnets. How do you cut that cost?",
        options: [
          "Add more NAT Gateways for better throughput",
          "Replace the NAT with an Internet Gateway",
          "Create VPC Gateway Endpoints for S3 and DynamoDB",
          "Use a larger NAT instance"
        ],
        correctAnswer: 2,
        difficulty: "low",
        explanation: "Gateway endpoints keep traffic private and avoid NAT data processing charges.",
        explanationRich:
          "Add <strong>Gateway Endpoints</strong> for S3/DynamoDB and update route tables in private subnets. Restrict access with <strong>endpoint policies</strong> and <strong>bucket/table policies</strong> to ensure requests only arrive via the endpoint.",
        links: [
          { title: "AWS Docs — Gateway Endpoints Overview", url: "https://docs.aws.amazon.com/vpc/latest/privatelink/gateway-endpoints.html" }
        ]
      },
      {
        question: "Your object data has unpredictable access patterns. How do you minimize storage cost while preserving durability?",
        options: [
          "Keep all data in S3 Standard",
          "Move everything immediately to S3 Glacier Deep Archive",
          "Use S3 Intelligent-Tiering and lifecycle transitions for very cold data",
          "Use S3 One Zone-IA for compliance archives"
        ],
        correctAnswer: 2,
        difficulty: "medium",
        explanation: "Intelligent-Tiering moves objects automatically between frequent and infrequent tiers; lifecycle transitions can push very cold data to Glacier classes.",
        explanationRich:
          "Enable <strong>S3 Intelligent-Tiering</strong> to adapt to changing access patterns, paying a small monitoring fee per object. Add <strong>Lifecycle</strong> rules to transition stale data to <strong>Glacier Instant/Flexible/Deep Archive</strong> as appropriate while retaining 11 9’s durability.",
        links: [
          { title: "AWS Docs — S3 Intelligent-Tiering", url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/intelligent-tiering.html" },
          { title: "AWS Docs — S3 Storage Classes", url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html" }
        ]
      },
      {
        question: "How can you automatically right-size EC2, EBS, Lambda memory, and ECS on Fargate to reduce cost?",
        options: [
          "AWS Budgets",
          "AWS Compute Optimizer",
          "AWS Trusted Advisor Service Limits checks only",
          "Amazon CloudWatch Dashboards"
        ],
        correctAnswer: 1,
        difficulty: "low",
        explanation: "Compute Optimizer analyzes historical metrics and recommends right-sizing actions.",
        explanationRich:
          "<strong>AWS Compute Optimizer</strong> uses ML to analyze utilization and proposes cheaper instance types/sizes, EBS volume types, Lambda memory settings, and ECS service task sizes on Fargate. Export findings and automate with <strong>SSM Automation</strong> if desired.",
        links: [
          { title: "AWS Docs — What is AWS Compute Optimizer?", url: "https://docs.aws.amazon.com/compute-optimizer/latest/ug/what-is-aws-compute-optimizer.html" },
          { title: "AWS Docs — Supported Resources", url: "https://docs.aws.amazon.com/compute-optimizer/latest/ug/what-is.html#supported-resources" }
        ]
      },
      {
        question: "Your scheduled ETL jobs on Lambda generate high log storage cost. What’s the best cost-control approach?",
        options: [
          "Disable logging completely",
          "Use CloudWatch Logs retention policies and metric filters; export older logs to S3 with lifecycle",
          "Keep infinite retention for auditing",
          "Write logs to EBS volumes"
        ],
        correctAnswer: 1,
        difficulty: "low",
        explanation: "Set retention policies to a reasonable period, filter noise, and move long-term logs to cheaper storage.",
        explanationRich:
          "Configure <strong>CloudWatch Logs retention</strong> to auto-expire older data, add <strong>metric filters</strong> for actionable patterns, and <strong>export to S3</strong> with lifecycle policies (e.g., Glacier) for long-term compliance at low cost. Use <strong>CloudWatch Logs Insights</strong> for ad-hoc queries.",
        links: [
          { title: "AWS Docs — CloudWatch Logs Retention", url: "https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Working-with-log-groups-and-streams.html" },
          { title: "AWS Docs — CloudWatch Logs Insights", url: "https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AnalyzingLogData.html" }
        ]
      }
    ]
  }
];

// Optional global export bindings (adjust for your environment)
if (typeof window !== "undefined") window.questions = questions;
if (typeof module !== "undefined") module.exports = questions;
