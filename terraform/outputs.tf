output "nlb_dns" {
  description = "Network Load Balancer DNS name"
  value       = aws_lb.nlb.dns_name
}

output "rds_endpoint" {
  description = "RDS endpoint"
  value       = aws_db_instance.rds.address
}

output "rds_port" {
  description = "RDS port"
  value       = aws_db_instance.rds.port
}

output "asg_name" {
  description = "AutoScaling Group name"
  value       = aws_autoscaling_group.app_asg.name
}
