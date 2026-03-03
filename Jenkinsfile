pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'quantm-frontend'
        DOCKER_TAG = "${BUILD_NUMBER}"
        NGINX_CONFIG = '/etc/nginx/sites-available/quantm-fe'
        DOCKER_BUILDKIT = '0'
        COMPOSE_DOCKER_CLI_BUILD = '0'
    }

    stages {
        stage('Prepare') {
            steps {
                script {
                    echo "Cleaning up Docker build cache..."
                    sh "docker image prune -f"
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo "Building Docker image ${DOCKER_IMAGE}:${DOCKER_TAG}..."
                    sh "docker build --no-cache -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
                    sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"
                }
            }
        }

        stage('Determine Deployment Target') {
            steps {
                script {
                    echo "Detecting current active environment..."
                    // Ultra-flexible: Just looks for FE_PORT on the same line as the port
                    def currentPort = sh(script: "grep 'FE_PORT' ${NGINX_CONFIG} | grep -oP 'localhost:\\K[0-9]+' || echo 'NOT_FOUND'", returnStdout: true).trim()
                    
                    if (currentPort == "NOT_FOUND" || currentPort == "") {
                        // Debugging: Show the user what the file looks like if it fails
                        sh "cat ${NGINX_CONFIG}"
                        error "FATAL: Could not find 'FE_PORT' marker in ${NGINX_CONFIG}. Please ensure your proxy_pass line has '# FE_PORT' at the end!"
                    }
                    
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
                    echo "Cleaning up current target: ${env.NEXT_COLOR}..."
                    sh "docker compose stop quantm-fe-${env.NEXT_COLOR} || true"
                    sh "docker compose rm -f quantm-fe-${env.NEXT_COLOR} || true"
                    
                    echo "Deploying fresh ${env.NEXT_COLOR} version..."
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
                    // Flexible Switch: Targets any line with FE_PORT
                    sh """sudo sed -i '/FE_PORT/s/localhost:${env.CURRENT_PORT}/localhost:${env.NEXT_PORT}/' ${NGINX_CONFIG}"""
                    
                    sh "sudo nginx -t"
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
    }

    post {
        success {
            echo "Successfully deployed Quantm-FE 🏆"
        }
        failure {
            script {
                echo "DEPLOYMENT FAILED. Rolling back..."
                def prevColor = (env.NEXT_COLOR == "blue") ? "green" : "blue"
                sh """sudo sed -i '/FE_PORT/s/localhost:[0-9]\\+/localhost:${env.CURRENT_PORT}/' ${NGINX_CONFIG}"""
                sh "sudo systemctl reload nginx"
                sh "docker compose start quantm-fe-${prevColor} || true"
            }
        }
    }
}
