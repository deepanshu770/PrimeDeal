# 1. The Trust Policy (Allows EC2 to use this role)
resource "aws_iam_role" "asg_role" {
  name = "primedeal-asg-secrets-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# 2. The Permission Policy (Allows reading from Secrets Manager)
resource "aws_iam_role_policy" "secrets_read" {
  name = "SecretsManagerReadPolicy"
  role = aws_iam_role.asg_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action   = ["secretsmanager:GetSecretValue"]
        Effect   = "Allow"
        Resource = [
          aws_secretsmanager_secret.rds_password.arn,
          data.aws_secretsmanager_secret.app_secrets.arn
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ssm_policy" {
  role       = aws_iam_role.asg_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# 3. The Instance Profile (The bridge between IAM and EC2)
resource "aws_iam_instance_profile" "asg_profile" {
  name = "primedeal-asg-instance-profile"
  role = aws_iam_role.asg_role.name
}