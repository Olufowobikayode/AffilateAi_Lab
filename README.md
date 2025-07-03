# Advanced Facebook & PoD Growth Bot

This project implements an AI-driven bot designed to increase sales, followers, and engagement for Print on Demand (PoD) businesses, leveraging free-tier cloud resources and AI services like Gemini and OpenAI.

## Production Readiness Enhancements

This application has been enhanced for production readiness with a focus on robust data handling, optimization, and scalability.

### Key Improvements:

- **Centralized Error Handling**: Implemented a global error handling middleware to ensure consistent error responses.
- **Input Validation**: Integrated Joi for validating incoming API request data and BullMQ job payloads, preventing malformed data from entering the system.
- **Optimized Asynchronous Processing**: Utilized BullMQ for job queuing, with added retry mechanisms (exponential backoff) and improved error logging for workers, enhancing resilience against transient failures.
- **Robust Configuration Management**: Environment variables are now validated at application startup to ensure all necessary configurations are present and correctly formatted.
- **External API Call Resilience**: A custom `ApiClient` has been implemented with features like request timeouts, automatic retries, and a circuit breaker pattern to gracefully handle external API (e.g., Reddit, Facebook) unresponsiveness or failures.
- **Dockerization**: A `Dockerfile` has been provided for the backend service, enabling easy containerization and deployment.

### Idempotency Considerations:

For data modification operations (e.g., saving posts, comments), idempotency is crucial to prevent duplicate data or unintended side effects during retries. This is primarily handled through:
- **Database Constraints**: Utilizing unique constraints on relevant database fields (e.g., `facebook_post_id` for posts, `facebook_comment_id` for comments) to prevent duplicate entries.
- **Careful Job Design**: Ensuring that worker jobs are designed to check for existing records before creating new ones, or to update existing records rather than always inserting.

Further enhancements for idempotency would involve implementing unique request IDs for all external API calls and storing them to prevent reprocessing, or using transactional outbox patterns for critical operations.

### Security Considerations:

While several security measures have been implemented (e.g., environment variable validation, rate limiting), a comprehensive security audit is recommended for a production environment. Key areas for further consideration include:
- **Authentication and Authorization**: Implementing robust user authentication and authorization mechanisms for accessing internal APIs.
- **Data Encryption**: Ensuring all sensitive data is encrypted at rest and in transit.
- **Vulnerability Scanning**: Regularly scanning dependencies and the application code for known vulnerabilities.
- **Least Privilege Principle**: Ensuring that services and users only have the minimum necessary permissions.
- **API Key Management**: Securely managing and rotating API keys.

## Getting Started

To run the backend application:

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up your environment variables in a `.env` file (refer to `.env.example` or the `envValidation.ts` for required variables).
4.  Build the application:
    ```bash
    npm run build
    ```
5.  Start the application:
    ```bash
    npm start
    ```

Alternatively, you can use Docker:

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Build the Docker image:
    ```bash
    docker build -t pod-growth-bot-backend .
    ```
3.  Run the Docker container:
    ```bash
    docker run -p 3000:3000 --env-file ./.env pod-growth-bot-backend
    ```

## Project Structure

(This section can be expanded with more details about each directory and its purpose.)

## Contributing

(Add contributing guidelines here.)
