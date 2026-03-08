pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'quantm-frontend'
        DOCKER_TAG = "${BUILD_NUMBER}"
        FE_PORT = "4200"
        NGINX_CONFIG = '/etc/nginx/sites-available/quantm-fe'
    }

    stages {
        stage('Build Docker Image') {
            steps {
                script {
                    echo "Building Docker image ${DOCKER_IMAGE}:${DOCKER_TAG}..."
                    sh "docker build --no-cache -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
                    sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    echo "Deploying Quantm-FE..."
                    sh "docker compose up -d --force-recreate quantm-fe"
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    echo "Waiting for health check on port ${FE_PORT}..."
                    timeout(time: 2, unit: 'MINUTES') {
                        sh """
                        until \$(curl --output /dev/null --silent --head --fail http://127.0.0.1:${FE_PORT}); do
                            printf '.'
                            sleep 5
                        done
                        """
                    }
                    echo "Health check PASSED!"
                }
            }
        }

        stage('Ensure Nginx Config') {
            steps {
                script {
                    echo "Ensuring Nginx config is pointing to 127.0.0.1:${env.FE_PORT}..."
                    
                    // Force correctly formatted proxy_pass line
                    sh "sudo sed -i -E '/FE_PORT/s/[0-9]{4,5}/${env.FE_PORT}/' ${NGINX_CONFIG}"
                    sh "sudo sed -i -E 's|proxy_pass http://[^;]+;|proxy_pass http://127.0.0.1:${env.FE_PORT};|' ${NGINX_CONFIG}"
                    
                    sh "sudo nginx -t"
                    sh "sudo systemctl reload nginx"
                }
            }
        }
    }

    post {
        success {
            echo "Successfully deployed Quantm-FE 🏆"
            sh "docker image prune -f"
        }
        failure {
            echo "Deployment failed. Check docker logs for more info."
            sh "docker logs quantm-fe --tail 50 || true"
        }
    }
}
