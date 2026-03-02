pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'quantm-frontend'
        DOCKER_TAG = "${BUILD_NUMBER}"
        DEPLOY_DIR = '/var/www/quantm/quantm-fe'
        NGINX_CONFIG = '/etc/nginx/sites-available/quantm-fe'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo "Building Docker image ${DOCKER_IMAGE}:${DOCKER_TAG}..."
                    sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
                    sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"
                }
            }
        }

        stage('Determine Deployment Target') {
            steps {
                script {
                    echo "Detecting current active environment..."
                    // Check Nginx config for current port. Default to 4400 if not found (meaning first deploy is Blue)
                    def currentPort = sh(script: "grep -oP 'proxy_pass http://localhost:\\K[0-9]+' ${NGINX_CONFIG} || echo '4400'", returnStdout: true).trim()
                    
                    env.NEXT_PORT = (currentPort == "4200") ? "4400" : "4200"
                    env.NEXT_COLOR = (env.NEXT_PORT == "4200") ? "blue" : "green"
                    env.CURRENT_PORT = currentPort
                    
                    echo "Current Port: ${currentPort}"
                    echo "Next Deploy: ${env.NEXT_COLOR} on port ${env.NEXT_PORT}"
                }
            }
        }

        stage('Sync Code to Deployment Directory') {
            steps {
                script {
                    echo "Syncing code to: ${DEPLOY_DIR}..."
                    sh "mkdir -p ${DEPLOY_DIR}"
                    // Sync local files like docker-compose.yml 
                    sh "rsync -av --delete --exclude='.git' --exclude='node_modules' --exclude='dist' ${WORKSPACE}/ ${DEPLOY_DIR}/"
                }
            }
        }

        stage('Target Clearance & Parallel Deploy') {
            steps {
                script {
                    dir(DEPLOY_DIR) {
                        echo "Cleaning up target ${env.NEXT_COLOR}..."
                        sh "docker compose stop quantm-fe-${env.NEXT_COLOR} || true"
                        sh "docker compose rm -f quantm-fe-${env.NEXT_COLOR} || true"
                        
                        echo "Starting service quantm-fe-${env.NEXT_COLOR}..."
                        sh "docker compose up --build -d quantm-fe-${env.NEXT_COLOR}"
                    }
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    echo "Waiting for health check on port ${env.NEXT_PORT}..."
                    // Wait for NGINX inside container to start
                    sleep 10
                    // Retry up to 5 times
                    sh """
                    for i in {1..15}; do
                        if curl -s http://localhost:${env.NEXT_PORT} > /dev/null; then
                            echo "Health check PASSED"
                            exit 0
                        fi
                        echo "Health check failed, retrying in 2 seconds..."
                        sleep 2
                    done
                    echo "Health check FAILED"
                    exit 1
                    """
                }
            }
        }

        stage('Instant Switch (Nginx)') {
            steps {
                script {
                    echo "Switching traffic from ${env.CURRENT_PORT} to ${env.NEXT_PORT}..."
                    // Use sed to replace the port in the NGINX config file
                    sh "sudo sed -i 's/proxy_pass http:\\/\\/localhost:${env.CURRENT_PORT}/proxy_pass http:\\/\\/localhost:${env.NEXT_PORT}/' ${NGINX_CONFIG}"
                    // Reload host Nginx
                    sh "sudo systemctl reload nginx"
                }
            }
        }

        stage('Safety Stop') {
            steps {
                script {
                    def prevColor = (env.NEXT_COLOR == "blue") ? "green" : "blue"
                    echo "Stopping old ${prevColor} container (retaining for rollback)..."
                    dir(DEPLOY_DIR) {
                        sh "docker compose stop quantm-fe-${prevColor} || true"
                    }
                }
            }
        }

        stage('Cleanup Images') {
            steps {
                sh "docker image prune -f"
            }
        }
    }

    post {
        success {
            echo "Successfully deployed Quantm-FE to ${env.NEXT_COLOR} cluster at port ${env.NEXT_PORT}!"
        }
        failure {
            echo "Deployment failed! Rolling back to ${env.CURRENT_PORT}..."
            script {
                // If we attempted to update Nginx but it might have failed or the container is down,
                // we should ensure Nginx still points to the previous working port.
                sh "sudo sed -i 's/proxy_pass http:\\/\\/localhost:[0-9]\\+/proxy_pass http:\\/\\/localhost:${env.CURRENT_PORT}/' ${NGINX_CONFIG}"
                sh "sudo systemctl reload nginx"
                
                // Ensure the previous container is running
                def prevColor = (env.NEXT_COLOR == "blue") ? "green" : "blue"
                dir(DEPLOY_DIR) {
                    sh "docker compose start quantm-fe-${prevColor} || true"
                }
            }
        }
    }
}
