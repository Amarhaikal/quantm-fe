pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'quantm-frontend'
        DOCKER_TAG = "${BUILD_NUMBER}"
        COMPOSE_PROJECT_NAME = 'quantm'
        DEPLOY_DIR = '/var/www/quantm/quantm-fe'
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
                    sh """
                        docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .
                        docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest
                    """
                }
            }
        }

        stage('Stop Old Containers') {
            steps {
                script {
                    echo 'Stopping old containers...'
                    sh """
                        if [ -d "${DEPLOY_DIR}" ]; then
                            cd ${DEPLOY_DIR}
                            docker stop ${DOCKER_IMAGE} || true
                            docker rm ${DOCKER_IMAGE} || true
                            docker compose down || true
                        fi
                    """
                }
            }
        }

        stage('Sync Code to Deployment Directory') {
            steps {
                script {
                    echo "Syncing code from workspace to deployment directory: ${DEPLOY_DIR}..."
                    sh """
                        # Create deployment directory if it doesn't exist
                        mkdir -p ${DEPLOY_DIR}
                        
                        # Sync all needed files
                        rsync -av --delete \
                            --exclude='.git' \
                            --exclude='node_modules' \
                            --exclude='dist' \
                            ${WORKSPACE}/ ${DEPLOY_DIR}/
                        
                        echo 'Code sync completed!'
                    """
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    echo 'Deploying new containers...'
                    sh """
                        cd ${DEPLOY_DIR}
                        docker compose up -d
                    """
                }
            }
        }

        stage('Cleanup') {
            steps {
                script {
                    echo 'Cleaning up old images...'
                    sh """
                        docker image prune -f
                    """
                }
            }
        }
    }

    post {
        success {
            echo 'Deployment successful!'
        }
        failure {
            echo 'Deployment failed!'
            sh "docker compose logs ${DOCKER_IMAGE} || true"
        }
    }
}
