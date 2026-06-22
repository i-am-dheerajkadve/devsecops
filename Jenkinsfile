pipeline {
    agent any
     triggers {
        cron('H H * * 0')
    }
    environment {
        REPO_URL = "https://github.com/i-am-dheerajkadve/devsecops.git"
        BRANCH = "main"

        DOCKERHUB_USERNAME = "dheerajkadve"
        BACKEND_IMAGE = "${DOCKERHUB_USERNAME}/tts-backend"
        FRONTEND_IMAGE = "${DOCKERHUB_USERNAME}/tts-frontend"
        IMAGE_TAG = "${BUILD_NUMBER}"

        BACKEND_PATH = "tts-app/src/backend"
        FRONTEND_PATH = "tts-app/src/frontend"
        MONITORING_COMPOSE = "monitoring-stack/docker-compose.yml"
    }
    
    stages {

        stage('Checkout Code') {
            steps {
                git branch: "${BRANCH}", url: "${REPO_URL}"
            }
        }

        stage('Check Repo Files') {
            steps {
                sh """
                pwd
                ls -la
                find . -maxdepth 4 -type f
                """
            }
        }

        stage('SonarQube Scan') {
            steps {
                script {
                    def scannerHome = tool 'SonarScanner'

                    withSonarQubeEnv('SonarQube-Server') {
                        sh """
                        ${scannerHome}/bin/sonar-scanner
                        """
                    }
                }
            }
        }

     

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                    echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    '''
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh """
                docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} -t ${BACKEND_IMAGE}:latest ${BACKEND_PATH}
                docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} -t ${FRONTEND_IMAGE}:latest ${FRONTEND_PATH}
                """
            }
        }

        stage('Push Docker Images') {
            steps {
                sh """
                docker push ${BACKEND_IMAGE}:${IMAGE_TAG}
                docker push ${BACKEND_IMAGE}:latest

                docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
                docker push ${FRONTEND_IMAGE}:latest
                """
            }
        }

        stage('Deploy Monitoring Stack') {
            steps {
        sh """
        echo "Checking EC2 .env file"

        if [ ! -f /home/ubuntu/.env ]; then
            echo "ERROR: /home/ubuntu/.env file not found"
            exit 1
        fi

        echo "Starting Prometheus and Grafana using EC2 .env file"

        docker compose \
          --env-file /home/ubuntu/.env \
          -f ${MONITORING_COMPOSE} \
          down || true

        docker compose \
          --env-file /home/ubuntu/.env \
          -f ${MONITORING_COMPOSE} \
          up -d

        docker ps
        """
    }
}
    }

    post {
        success {
            echo "Pipeline completed successfully."
        }
        failure {
            echo "Pipeline failed. Check Jenkins console logs."
        }
    }
}
