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
        stage('Determine Deployment Target') {
            steps {
                script {
                    echo "Detecting current active environment..."
                    // We do this FIRST so that even if the build fails later, 
                    // we have a valid CURRENT_PORT for the rollback script.
                    def rawLine = sh(script: "grep 'FE_PORT' ${NGINX_CONFIG} || echo 'NOT_FOUND'", returnStdout: true).trim()
                    
                    if (rawLine == "NOT_FOUND") {
                        sh "cat ${NGINX_CONFIG}"
                        error "FATAL: Could not find 'FE_PORT' marker in ${NGINX_CONFIG}."
                    }

                    def matcher = (rawLine =~ /127\.0\.0\.1:(\d+)/) ?: (rawLine =~ /localhost:(\d+)/)
                    def currentPort = ""

                    if (matcher.find()) {
                        currentPort = matcher[0][1]
                    } else {
                        echo "WARNING: Port is corrupted (e.g. 'null'). Defaulting to 4400 for recovery."
                        currentPort = "4400"
                    }
                    
                    env.CURRENT_PORT = currentPort
                    env.NEXT_PORT = (currentPort == "4200") ? "4400" : "4200"
                    env.NEXT_COLOR = (env.NEXT_PORT == "4200") ? "primary" : "secondary"
                    
                    echo "Current Port: ${env.CURRENT_PORT}"
                    echo "Next Deploy will be: ${env.NEXT_COLOR} on port ${env.NEXT_PORT}"
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo "Building Docker image ${DOCKER_IMAGE}:${DOCKER_TAG}..."
                    // Removed 'image prune' from before the build as it causes "failed to get destination image" errors
                    sh "docker build --no-cache -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
                    sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"
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
                    echo "Switching traffic from Port ${env.CURRENT_PORT} to Port ${env.NEXT_PORT}..."
                    sh """sudo sed -i '/FE_PORT/s/[0-9]\{4,5\}/${env.NEXT_PORT}/' ${NGINX_CONFIG}"""
                    sh "sudo sed -i '/FE_PORT/s/localhost/127.0.0.1/' ${NGINX_CONFIG}"
                    sh "sudo nginx -t"
                    sh "sudo systemctl reload nginx"
                    echo "Nginx traffic successfully switched to Port ${env.NEXT_PORT}!"
                }
            }
        }

        stage('Safety Stop') {
            steps {
                script {
                    def prevColor = (env.NEXT_COLOR == "primary") ? "secondary" : "primary"
                    echo "Stopping old version (${prevColor})..."
                    sh "docker compose stop quantm-fe-${prevColor} || true"
                }
            }
        }
    }

    post {
        success {
            echo "Successfully deployed Quantm-FE 🏆"
            // Prune only AFTER success
            sh "docker image prune -f"
        }
        failure {
            script {
                echo "DEPLOYMENT FAILED. Rolling back..."
                // Only attempt rollback if CURRENT_PORT was successfully detected
                if (env.CURRENT_PORT && env.CURRENT_PORT != "null") {
                    def prevColor = (env.NEXT_COLOR == "primary") ? "secondary" : "primary"
                    sh """sudo sed -i '/FE_PORT/s/localhost:[^;]*/localhost:${env.CURRENT_PORT}/' ${NGINX_CONFIG}"""
                    sh "sudo systemctl reload nginx"
                    sh "docker compose start quantm-fe-${prevColor} || true"
                    echo "Rollback to Port ${env.CURRENT_PORT} completed."
                } else {
                    echo "Rollback skipped: CURRENT_PORT was not determined."
                }
            }
        }
    }
}
