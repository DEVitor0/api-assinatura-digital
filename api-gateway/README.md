# API Gateway

This project serves as an API Gateway for routing requests to various microservices. It acts as a single entry point for clients, allowing them to interact with multiple services seamlessly.

## Project Structure

- **src/**: Contains the source code for the API Gateway.
  - **config/**: Configuration files for external services.
    - `gcp-config.ts`: Configuration settings for connecting to Google Cloud Platform (GCP).
  - **middlewares/**: Middleware functions for handling requests.
    - `auth.ts`: Authentication middleware for verifying tokens and permissions.
    - `proxy.ts`: Middleware for proxying requests to respective microservices.
  - **routes/**: Route definitions for the API Gateway.
    - `index.ts`: Sets up the routes and connects middleware.
  - **services/**: Service layer for external integrations.
    - `gcp-connector.ts`: Functions for communicating with GCP services.
  - `app.ts`: Main application file that initializes the Express app and middleware.
  - `server.ts`: Entry point of the application that starts the server.

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd api-gateway
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the root directory and add the necessary environment variables, such as API keys and database URLs.

4. **Run the application**:
   ```bash
   npm start
   ```

## Usage

Once the API Gateway is running, you can send requests to the defined routes. The gateway will handle authentication and proxy requests to the appropriate microservices based on the routing logic defined in `src/routes/index.ts`.

## Connecting to GCP

The project includes a configuration file for GCP located at `src/config/gcp-config.ts`. Ensure that you have the necessary credentials and settings to connect to GCP services.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or features.

## License

This project is licensed under the MIT License.