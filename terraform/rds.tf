

resource "random_password" "rds_password" {
  length           = 16
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

resource "aws_secretsmanager_secret" "rds_password" {
  name = "primedeal-rds-password"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "rds_password" {
  secret_id     = aws_secretsmanager_secret.rds_password.id
  secret_string = random_password.rds_password.result
}

resource "aws_db_subnet_group" "rds_sn" {
  name       = "primedeal-rds-subnet-group"
  subnet_ids = [aws_subnet.private.id, aws_subnet.private_for_rds.id]
  tags = { Name = "primedeal-rds-subnet-group" }
}

resource "aws_db_instance" "rds" {
  identifier              = "primedeal-db"  
  engine                  = "mysql"
  engine_version          = "8.0"
  instance_class          = "db.t4g.micro"
  username                = "admin"
  password                = aws_secretsmanager_secret_version.rds_password.secret_string
  db_subnet_group_name    = aws_db_subnet_group.rds_sn.name
  vpc_security_group_ids  = [aws_security_group.rds_sg.id]
  skip_final_snapshot     = true
  publicly_accessible     = false
  allocated_storage = 20
  tags = { Name = "primedeal_rds" }
}
