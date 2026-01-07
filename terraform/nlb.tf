resource "aws_lb" "nlb" {
  name               = "primedeal-nlb-v2"
  internal           = false
  load_balancer_type = "network"
  subnets            = [aws_subnet.public.id]
  security_groups    = [aws_security_group.nlb_sg.id]
  depends_on         = [aws_internet_gateway.igw]
  tags = { Name = "primedeal_nlb" }
}

resource "aws_lb_target_group" "app_tg" {
  name     = "primedeal-app-tg-v2"
  port     = 80
  protocol = "TCP"
  vpc_id   = aws_vpc.vpc.id
  target_type = "instance"
  preserve_client_ip = "false"

  health_check {
    protocol = "TCP"
    port     = "80"
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_lb_listener" "nlb_listener" {
  load_balancer_arn = aws_lb.nlb.arn
  port              = 80
  protocol          = "TCP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app_tg.arn
  }
}
