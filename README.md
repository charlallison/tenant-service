# Tenant Service

The Tenant Service is a serverless application built on AWS Lambda and other services using the Serverless Framework. It provides management of tenants and payments made for a property, as well as basic CRUD operations for properties.

![image](https://github.com/charlallison/tenant-service/assets/2844422/01d78232-97f4-4ab5-bc1f-c064fa0fa899)

## Features
- Tenant Management: Create, update, and delete tenant information, including name, contact details, and property allocation.
- Payment Management: Record and manage tenant payments, including payment amount, date, and payment status.
- Property CRUD: Perform basic CRUD operations (Create, Read, Update, Delete) on property information, such as property details, address, and rental rates.

## Architecture
As seen in the architecture diagram above, the Tenant Service utilizes the following AWS services:

- **AWS Lambda:** Handles the serverless functions for processing tenant, payment and property operations.
- **API Gateway:** Provides a RESTful API to interact with the service.
- **DynamoDB:** Stores tenant and property data, as well as payment records.
- **EventBridge (CloudWatch Events):** Stores static assets, such as property images or documents.
- **API Gateway:** Automates the provisioning and management of AWS resources.
- **SNS** Notifies tenants of a payment notification or payment reminder via SMS

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
3. Configure AWS credentials:

    Ensure that you have valid AWS credentials setup using the AWS CLI otherwise follow the instructions on [how to set up your AWS credentials](https://medium.com/aws-in-plain-english/serverless-development-with-aws-33fd48089ec)

4. Configure service settings:

    Open the serverless.yml file and update the `profile`, `service name`, `region`, etc. as needed.

5. Deploy the service using:
    ```shell
    sls deploy
    ```
6. Access the API:

   Once the deployment is successful, you will receive an API endpoint URL. Use this URL to interact with the Tenant Service using an API client such as cURL or Postman.

## Usage
The Tenant Service API provides the following endpoints:

`GET /properties`: Retrieves a list of all properties.

`GET /properties/{id}`: Retrieves a specific property by ID.

`POST /properties`: Creates a new property.

`PATCH /properties/{id}`: Updates an existing property.

`GET /tenants?status={status}`: Retrieves a list of all tenants.

`GET /tenants/{id}`: Retrieves a specific tenant by ID.

`POST /tenants`: Creates a new tenant.

`PATCH /tenants/{id}`: Updates an existing tenant.

`DELETE /tenants/{id}`: Deletes a tenant.

Refer to the API documentation or code for detailed request and response formats.

## License
The Tenant Service is open-source and available under the MIT License. Feel free to use, modify, and distribute the code as per the terms of the license.