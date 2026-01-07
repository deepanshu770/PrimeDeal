

resource "aws_launch_template" "app_lt" {
  name_prefix   = "primedeal-app-"
  image_id      = "ami-0f5fcdfbd140e4ab7"
  instance_type = "t3.micro"
  iam_instance_profile {
 name = aws_iam_instance_profile.asg_profile.name
  }
 network_interfaces {
   associate_public_ip_address = false
   security_groups = [aws_security_group.app_sg.id]
 }
  user_data = base64encode(templatefile("${path.module}/user_data.sh", {
    image_tag     = var.image_tag
    db_host       = aws_db_instance.rds.address
    db_port       = aws_db_instance.rds.port
    secret_id     = aws_secretsmanager_secret.rds_password.name
    app_secret_id = data.aws_secretsmanager_secret.app_secrets.name
    region        = "us-east-2"
  }))
    tag_specifications {
        resource_type = "instance"
        tags = {
        Name = "primedeal_app_instance"
        }
    }
}

resource "aws_autoscaling_group" "app_asg" {
  name                      = "primedeal-asg"
  desired_capacity          = 2
  max_size                  = 3
  min_size                  = 1
  vpc_zone_identifier       = [aws_subnet.private.id]
  depends_on                = [aws_nat_gateway.nat, aws_route_table_association.private_assoc]

  instance_refresh {
    strategy = "Rolling"
    preferences {
      min_healthy_percentage = 50
    }
  }

  launch_template {
    id      = aws_launch_template.app_lt.id
    version = aws_launch_template.app_lt.latest_version
  }

  target_group_arns = [aws_lb_target_group.app_tg.arn]

  tag {
    key                 = "Name"
    value               = "primedeal_app_instance"
    propagate_at_launch = true
  }
}
