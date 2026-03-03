pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'quantm-frontend'
        DOCKER_TAG = "${BUILD_NUMBER}"
        NGINX_CONFIG = '/etc/nginx/sites-available/quantm-fe'
    }

    stages {
        // Stage 1: Checkout is done automatically by Jenkins
        
        stage('Build Docker Image') {
            steps {
                script {
                    echo "Building Docker image ${DOCKER_IMAGE}:${DOCKER_TAG}..."
                    // We build it here so we can tag it properly before deployment
                    sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
                    sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"
                }
            }
        }

        stage('Determine Deployment Target') {
            steps {
                script {
                    echo "Detecting current active environment..."
                    // SMARTER DETECTION: Only looks for the port inside the 'location /' block
                    def currentPort = sh(script: "sed -n '/location \\/ {/,/}/p' ${NGINX_CONFIG} | grep -oP 'localhost:\\K[0-9]+' || echo '4400'", returnStdout: true).trim()
                    
                    env.CURRENT_PORT = currentPort
                    env.NEXT_PORT = (currentPort == "4200") ? "4400" : "4200"
                    env.NEXT_COLOR = (env.NEXT_PORT == "4200") ? "blue" : "green"
                    
                    echo "Current Port: ${env.CURRENT_PORT}"
                    echo "Next Deploy: ${env.NEXT_COLOR} on port ${env.NEXT_PORT}"
                }
            }
        }

        stage('Target Clearance & Parallel Deploy') {
            steps {
                script {
                    echo "Cleaning up any old ${env.NEXT_COLOR} container..."
                    sh "docker compose stop quantm-fe-${env.NEXT_COLOR} || true"
                    sh "docker compose rm -f quantm-fe-${env.NEXT_COLOR} || true"
                    
                    echo "Starting fresh service: quantm-fe-${env.NEXT_COLOR}..."
                    // We use --build just in case, but it relies on 'quantm-frontend:latest' which we just tagged
                    sh "docker compose up -d quantm-fe-${env.NEXT_COLOR}"
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    echo "Waiting for health check on port ${env.NEXT_PORT}..."
                    timeout(time: 2, unit: 'MINUTES') {
                        sh """
                        until \$(curl --output /dev/null --silent --head --fail http://localhost:${env.NEXT_PORT}); do
                            printf '.'
                            sleep 5
                        done
                        """
                    }
                    echo "Health check PASSED!"
                }
            }
        }

        stage('Instant Switch (Nginx)') {
            steps {
                script {
                    echo "Switching traffic from ${env.CURRENT_PORT} to ${env.NEXT_PORT}..."
                    sh "sudo sed -i '/location \\/ {/,/}/ s/localhost:${env.CURRENT_PORT}/localhost:${env.NEXT_PORT}/' ${NGINX_CONFIG}"
                    sh "sudo systemctl reload nginx"
                    echo "Nginx traffic successfully switched to Port ${env.NEXT_PORT}!"
                }
            }
        }

        stage('Safety Stop') {
            steps {
                script {
                    def prevColor = (env.NEXT_COLOR == "blue") ? "green" : "blue"
                    echo "Stopping old version (${prevColor})..."
                    sh "docker compose stop quantm-fe-${prevColor} || true"
                }
            }
        }

        stage('Housekeeping') {
            steps {
                sh "docker image prune -f"
            }
        }
    }

    post {
        success {
            echo "Successfully deployed Quantm-FE to the ${env.NEXT_COLOR} cluster! 🏆"
        }
        failure {
            script {
                echo "DEPLOYMENT FAILED. Initiating self-healing rollback..."
                def prevColor = (env.NEXT_COLOR == "blue") ? "green" : "blue"
                sh "sudo sed -i '/location \\/ {/,/}/ s/localhost:[0-9]\\+/localhost:${env.CURRENT_PORT}/' ${NGINX_CONFIG}"
                sh "sudo systemctl reload nginx"
                sh "docker compose start quantm-fe-${prevColor} || true"
                echo "Rollback successful. Users are back on stable Port ${env.CURRENT_PORT}."
            }
        }
    }
}
