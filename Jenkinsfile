pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'quantm-frontend'
        DOCKER_TAG = "${BUILD_NUMBER}"
        NGINX_CONFIG = '/etc/nginx/sites-available/quantm-fe'
    }

    stages {
        // Stage 1: Checkout is done automatically by Jenkins scm checkout in agents
        
        stage('Determine Deployment Target') {
            steps {
                script {
                    echo "Detecting current active environment..."
                    // SMARTER DETECTION: Only looks for the port inside the 'location /' block to avoid BE port conflict
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
                    // Running directly in the Jenkins Workspace!
                    echo "Cleaning up any old ${env.NEXT_COLOR} container..."
                    sh "docker compose stop quantm-fe-${env.NEXT_COLOR} || true"
                    sh "docker compose rm -f quantm-fe-${env.NEXT_COLOR} || true"
                    
                    echo "Starting fresh service: quantm-fe-${env.NEXT_COLOR}..."
                    // We build and start ONLY the target color
                    sh "docker compose up --build -d quantm-fe-${env.NEXT_COLOR}"
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    echo "Waiting for health check on port ${env.NEXT_PORT}..."
                    // Standard frontend health check: wait for the index page to load
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
                    // SMARTER SWITCH: Only replaces the port inside the 'location /' block
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
                    // We stop the old color but leave it 'Exited' for inspection
                    sh "docker compose stop quantm-fe-${prevColor} || true"
                }
            }
        }

        stage('Housekeeping') {
            steps {
                // Prune old images to keep the Ubuntu disk clean
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
                
                // 1. Point Nginx back to the STABLE port specifically in the root location block
                sh "sudo sed -i '/location \\/ {/,/}/ s/localhost:[0-9]\\+/localhost:${env.CURRENT_PORT}/' ${NGINX_CONFIG}"
                sh "sudo systemctl reload nginx"
                
                // 2. Restart the stable version
                sh "docker compose start quantm-fe-${prevColor} || true"
                
                echo "Rollback successful. Users are back on stable Port ${env.CURRENT_PORT}."
            }
        }
    }
}
