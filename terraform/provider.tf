terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "6.27.0"
    }
    random = {
      source = "hashicorp/random"
      version = "3.7.2"
    }
  }
  backend "s3" {
    bucket         = "primedeal-terraform-state-770"
    key            = "terraform.tfstate"
    region         = "us-east-2"
    encrypt        = true
    dynamodb_table = "primedeal-terraform-lock"
  }
}

provider "aws" {
 region = "us-east-2"
}