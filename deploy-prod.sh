#!/bin/bash

# Production Deployment Script
# Usage: ./deploy-prod.sh [--with-nginx] [--with-cache] [--with-database]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.prod"
DOMAIN="dashboard.chista.com.br"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_requirements() {
    log_info "Checking requirements..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check if .env.prod exists
    if [ ! -f "$ENV_FILE" ]; then
        log_error "Environment file $ENV_FILE not found"
        log_info "Please copy env.prod.example to $ENV_FILE and configure it"
        exit 1
    fi
    
    log_success "Requirements check passed"
}

check_ssl_certificates() {
    log_info "Checking SSL certificates..."
    
    if [ ! -f "./ssl/cert.pem" ] || [ ! -f "./ssl/key.pem" ]; then
        log_warning "SSL certificates not found in ./ssl/"
        log_info "You can either:"
        log_info "1. Place your SSL certificates in ./ssl/cert.pem and ./ssl/key.pem"
        log_info "2. Use Let's Encrypt with Traefik (recommended)"
        log_info "3. Run without SSL (not recommended for production)"
        
        read -p "Continue without SSL? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        log_success "SSL certificates found"
    fi
}

create_networks() {
    log_info "Creating Docker networks..."
    
    # Create traefik network if it doesn't exist
    if ! docker network ls | grep -q "traefik-public"; then
        docker network create traefik-public
        log_success "Created traefik-public network"
    else
        log_info "traefik-public network already exists"
    fi
}

build_and_deploy() {
    log_info "Building and deploying application..."
    
    # Build the application
    log_info "Building Docker image..."
    docker-compose -f $COMPOSE_FILE build --no-cache
    
    # Stop existing containers
    log_info "Stopping existing containers..."
    docker-compose -f $COMPOSE_FILE down
    
    # Start services based on arguments
    if [[ $* == *"--with-nginx"* ]]; then
        log_info "Starting with Nginx..."
        docker-compose -f $COMPOSE_FILE --profile nginx up -d
    elif [[ $* == *"--with-cache"* ]]; then
        log_info "Starting with Redis cache..."
        docker-compose -f $COMPOSE_FILE --profile cache up -d
    elif [[ $* == *"--with-database"* ]]; then
        log_info "Starting with PostgreSQL database..."
        docker-compose -f $COMPOSE_FILE --profile database up -d
    else
        log_info "Starting basic services..."
        docker-compose -f $COMPOSE_FILE up -d
    fi
    
    log_success "Deployment completed"
}

health_check() {
    log_info "Performing health checks..."
    
    # Wait for services to start
    sleep 10
    
    # Check if the application is responding
    if curl -f http://localhost:3000/health &> /dev/null; then
        log_success "Application health check passed"
    else
        log_error "Application health check failed"
        log_info "Checking container logs..."
        docker-compose -f $COMPOSE_FILE logs web
        exit 1
    fi
    
    # Check if nginx is responding (if enabled)
    if [[ $* == *"--with-nginx"* ]]; then
        if curl -f http://localhost/health &> /dev/null; then
            log_success "Nginx health check passed"
        else
            log_warning "Nginx health check failed"
        fi
    fi
}

show_status() {
    log_info "Deployment status:"
    docker-compose -f $COMPOSE_FILE ps
    
    log_info "Container logs:"
    docker-compose -f $COMPOSE_FILE logs --tail=20
}

cleanup() {
    log_info "Cleaning up unused Docker resources..."
    docker system prune -f
    docker volume prune -f
}

# Main execution
main() {
    log_info "Starting production deployment..."
    
    check_requirements
    check_ssl_certificates
    create_networks
    build_and_deploy "$@"
    health_check "$@"
    show_status
    cleanup
    
    log_success "Production deployment completed successfully!"
    log_info "Application should be available at: https://$DOMAIN"
    log_info "Health check: https://$DOMAIN/health"
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --with-nginx     Deploy with Nginx reverse proxy"
        echo "  --with-cache     Deploy with Redis cache"
        echo "  --with-database  Deploy with PostgreSQL database"
        echo "  --help, -h       Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0                    # Basic deployment"
        echo "  $0 --with-nginx       # With Nginx proxy"
        echo "  $0 --with-cache       # With Redis cache"
        echo "  $0 --with-database    # With PostgreSQL"
        exit 0
        ;;
esac

# Run main function with all arguments
main "$@"
