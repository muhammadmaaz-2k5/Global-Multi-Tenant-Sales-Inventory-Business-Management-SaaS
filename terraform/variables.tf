variable "aws_region" {
  description = "The AWS region to deploy the infrastructure into"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment (e.g., prod, staging)"
  type        = string
  default     = "production"
}
