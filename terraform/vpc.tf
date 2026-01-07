resource "aws_vpc" "vpc" {
  cidr_block = "10.0.0.0/16"
  tags = {
    Name = "primedeal_vpc"
  }
}

resource "aws_subnet" "public" {
  vpc_id = aws_vpc.vpc.id
  cidr_block = "10.0.1.0/24"
  availability_zone = "us-east-2a"
    tags = {
        Name = "primedeal_public_subnet"
    }
}
resource "aws_subnet" "private" {
  vpc_id = aws_vpc.vpc.id
  cidr_block = "10.0.2.0/24"
  availability_zone = "us-east-2a"
    tags = {
        Name = "primedeal_private_subnet"
    }

}
resource "aws_subnet" "private_for_rds" {
  vpc_id = aws_vpc.vpc.id
  cidr_block = "10.0.3.0/24"
  availability_zone = "us-east-2b"
    tags = {
        Name = "primedeal_private_subnet_for_rds"
    }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.vpc.id


  tags = { Name = "primedeal_igw" }
}

resource "aws_eip" "nat" {
  tags = { Name = "primedeal_nat_eip" }
}

resource "aws_nat_gateway" "nat" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public.id
  depends_on    = [aws_internet_gateway.igw]

  tags = { Name = "primedeal_nat" }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.vpc.id
  depends_on = [ aws_vpc.vpc,aws_internet_gateway.igw ]
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
  tags = { Name = "primedeal_public_rt" }
}

resource "aws_route_table_association" "public_assoc" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.vpc.id
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat.id
  }
  tags = { Name = "primedeal_private_rt" }
}

resource "aws_route_table_association" "private_assoc" {
  subnet_id      = aws_subnet.private.id
  route_table_id = aws_route_table.private.id
}
resource "aws_route_table_association" "private_for_rds_assoc" {
  subnet_id      = aws_subnet.private_for_rds.id
  route_table_id = aws_route_table.private.id
}
