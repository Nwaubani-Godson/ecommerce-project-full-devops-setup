# E-commerce Microservices Application

A scalable e-commerce platform built with microservices architecture, featuring Docker orchestration, comprehensive monitoring, and an Nginx-powered API Gateway.

## Features

- **User Management** - Complete user authentication, registration, and profile management
- **Product Catalog** - Comprehensive product browsing and inventory management
- **Shopping Cart** - Dynamic cart operations (add, update, remove items)
- **Order Processing** - Seamless order creation and management
- **API Gateway** - Centralized request routing and load balancing via Nginx
- **Monitoring & Observability** - Real-time metrics with Prometheus and Grafana dashboards

## Architecture

This application follows a microservices architecture pattern where each business capability operates as an independent, deployable service.

### System Components

- **Frontend** - React application providing the user interface
- **Nginx Proxy (API Gateway)** - Entry point handling routing and CORS
- **User Service** - Authentication and user profile management (Port: 8001)
- **Product Service** - Product information and inventory (Port: 8002)
- **Cart Service** - Shopping cart functionality (Port: 8003)
- **Order Service** - Order processing and management (Port: 8004)
- **PostgreSQL Database** - Persistent data storage
- **Prometheus** - Metrics collection and monitoring
- **Grafana** - Data visualization and dashboards
- **Nginx Prometheus Exporter** - Nginx metrics exposure

## Technology Stack

### Backend
- **Runtime** - Python 3.11
- **Framework** - FastAPI
- **ORM** - SQLAlchemy
- **Database Driver** - AsyncPG

### Frontend
- **Framework** - React
- **Build Tool** - Vite

### Infrastructure
- **Database** - PostgreSQL 13
- **Containerization** - Docker & Docker Compose
- **API Gateway** - Nginx
- **Monitoring** - Prometheus, Grafana
- **Instrumentation** - prometheus-fastapi-instrumentator, nginx-prometheus-exporter

## Quick Start

### Prerequisites

Ensure you have the following installed:
- **Git** - Version control
- **Docker Desktop** - Container runtime (includes Docker Compose)

### Installation Steps

#### 1. Clone the Repository
```bash
git clone < https://github.com/Nwaubani-Godson/ecommerce-project-full-devops-setup.git >
cd ecommerce-project
```

#### 2. Environment Configuration
Create a `.env` file in the project root:

```env
# Database Configuration
POSTGRES_DB=ecommerce_db
POSTGRES_USER=ecommerce_user
POSTGRES_PASSWORD=your_secure_password

# Application Configuration
DATABASE_URL=postgresql+asyncpg://ecommerce_user:your_secure_password@db:5432/ecommerce_db
SECRET_KEY=your_super_secret_jwt_key  # To generate <python -c "import secrets; print(secrets.token_urlsafe(64))">

# Security Note: Use strong, unique values for production
```

#### 3. Launch the Application
```bash
docker-compose up --build -d
```

This command will:
- Build all Docker images
- Start services in detached mode
- Initialize the database schema
- Configure the inter-service network

## Service Access Points

Once deployed, access the application components:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3001 | Main application interface |
| **API Gateway** | http://localhost:8000 | Backend API access point |
| **Health Check** | http://localhost:8000/health | Service status verification |
| **Prometheus** | http://localhost:9090 | Metrics and monitoring |
| **Grafana** | http://localhost:3000 | Data visualization dashboards |

### Grafana Initial Setup
- **Default credentials**: admin / admin
- **Data Source Configuration**:
  1. Navigate to Configuration → Data Sources
  2. Add Prometheus data source
  3. Set URL to `http://prometheus:9090`
  4. Save and test connection

## Monitoring & Observability

### Available Metrics

#### FastAPI Services
- `http_requests_total` - Request count by handler, status, method
- `http_request_duration_seconds` - Request latency distribution
- `http_request_size_bytes` - Incoming request body sizes
- `http_response_size_bytes` - Outgoing response body sizes

#### Nginx Gateway
- `nginx_connections_active` - Active client connections
- `nginx_requests_total` - Total requests served
- Connection states (reading, writing, waiting)

### Dashboard Creation
1. Configure Prometheus as a Grafana data source
2. Import community dashboards or create custom visualizations
3. Monitor key metrics like request duration and error rates

## API Reference

All requests should be made to the API Gateway at `http://localhost:8000/`

### User Service Endpoints
```
POST /register          # User registration
POST /token            # Authentication
GET  /users/me         # Current user profile
```

### Product Service Endpoints
```
GET  /products         # List all products
GET  /products/{id}    # Get specific product
```

### Cart Service Endpoints
```
GET    /cart                    # Get user's cart
POST   /cart/items             # Add item to cart
PUT    /cart/items/{product_id} # Update cart item
DELETE /cart/items/{product_id} # Remove cart item
```

### Order Service Endpoints
```
GET  /orders           # List user orders
POST /orders           # Create new order
```

## Troubleshooting

### Common Issues

#### Port Conflicts
**Error**: "port is already allocated"
**Solution**: 
```bash
# Check port usage
sudo lsof -i :<PORT>   
netstat -ano | findstr :<PORT>  # Windows
sudo ss -tulnp | grep :<port_number> OR
sudo netstat -tulnp | grep :<port_number> # if you get a netstat command not found error please install with this command below:
apt install net-tools




# Stop conflicting process and retry
```

#### Service Health Issues
**Error**: Container unhealthy or not starting
**Solution**:
```bash
# Check specific service logs
docker logs ecommerce-project-user-service-1

# View all service statuses
docker-compose ps
```

#### Frontend-Backend Communication
**Error**: 404 errors or CORS issues
**Solution**:
1. Verify API Gateway is running on port 8000
2. Check browser developer tools for specific errors
3. Ensure all services are healthy in Docker Compose

### Log Analysis
```bash
# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f user-service
```

## Contributing

This project is open for contributions as you can see, from the frontend to the backend. Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Docker Compose Guide](https://docs.docker.com/compose/)
- [Prometheus Monitoring](https://prometheus.io/docs/)
- [Grafana Dashboards](https://grafana.com/docs/)

---

**Note**: For production deployment, ensure you use strong passwords, enable HTTPS, and configure proper security measures.