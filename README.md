# Tenant Service

The Tenant Service is a serverless application built on AWS Lambda and other services using the Serverless Framework. It provides management of tenants and payments made for a property, as well as basic CRUD operations for properties.

![image](https://github.com/charlallison/tenant-service/assets/2844422/01d78232-97f4-4ab5-bc1f-c064fa0fa899)

## Features
- Tenant Management: Create, update, and delete tenant information, including name, phone, and property allocation.
- Payment Management: Record tenant payments, including payment amount and date.
- Property CRUD: Perform basic CRUD operations (Create, Read, Update) on property information, such as property details, address, and rental rates.

## Architecture
The Tenant Service utilizes the following AWS services:

- **AWS Lambda:** Handles the serverless functions for processing tenant, payment and property operations.
- **API Gateway:** Provides a RESTful API to interact with the service.
- **DynamoDB:** Stores tenant and property data, as well as payment records.
- **EventBridge (CloudWatch Events):** Triggers lambda function on schedule.
- **AWS CloudFormation:** Automates the provisioning and management of AWS resources.
- **Amazon SNS** Sends SMS Notification to tenants.

## Getting Started
To get started with the Tenant Service, follow these steps:
1. Clone the repository:
    ```shell
    git clone https://github.com/charlallison/tenant-service.git
    ```
2. Install dependencies:
    ```shell
   cd tenant-service
   npm install
   ```
3. Configure AWS credentials:<br />
    Ensure that you have valid AWS credentials setup using the AWS CLI otherwise follow the instructions on [how to set up your AWS credentials](https://medium.com/aws-in-plain-english/serverless-development-with-aws-33fd48089ec)
4. Configure service settings:<br />
    Open the serverless.yml file and update the `profile`, `service name`, `region`, etc. as needed.
5. Deploy the service using:
    ```shell
    sls deploy
    ```
6. Access the API:<br />
   Once the deployment is successful, you will receive an API endpoint URL. Use this URL to interact with the Tenant Service using an API client such as cURL or Postman.

## Usage
The Tenant Service API provides the following endpoints:

`GET /properties?status={status}`: Retrieves a list of all properties by status.

`GET /properties/{id}`: Retrieves a specific property by ID.

`POST /properties`: Creates a new property.

`PATCH /properties/{id}`: Updates an existing property.

`GET /tenants?status={status}`: Retrieves a list of all tenants by status.

`GET /tenants/{id}`: Retrieves a specific tenant by ID.

`POST /tenants`: Creates a new tenant.

`PATCH /tenants/{id}`: Updates an existing tenant.

`DELETE /tenants/{id}`: Deletes a tenant.

`POST /tenants/{id}/pay`: Pays the rent for a property.

## License
The Tenant Service is open-source and available under the [MIT License](https://opensource.org/licenses/MIT). Feel free to use, modify, and distribute the code as per the terms of the license.