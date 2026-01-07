
resource "aws_security_group" "nlb_sg" {
  name        = "primedeal_nlb_sg"
  description = "Allow HTTP from Internet to NLB"
  vpc_id      = aws_vpc.vpc.id

  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "primedeal_nlb_sg" }
}

resource "aws_security_group" "app_sg" {
  name        = "primedeal_app_sg"
  description = "Allow HTTP from NLB/Internet to app instances"
  vpc_id      = aws_vpc.vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "primedeal_app_sg" }
}

resource "aws_security_group" "rds_sg" {
  name        = "primedeal_rds_sg"
  description = "Allow DB access from app instances"
  vpc_id      = aws_vpc.vpc.id

  ingress {
    description = "MySQL from app servers"
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    security_groups = [aws_security_group.app_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "primedeal_rds_sg" }
}
