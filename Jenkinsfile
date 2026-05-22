pipeline {
    agent any

    environment {
        APP_NAME = 'securecareops-api'
        IMAGE_NAME = 'securecareops-api'
        IMAGE_TAG = "1.0.${BUILD_NUMBER}"
        STAGING_URL = 'http://localhost:3000'
    }

    stages {
        stage('Build') {
            steps {
                echo 'Starting Build Stage...'
                bat 'npm install'
                bat 'npm run build'
                bat 'docker build -t %IMAGE_NAME%:%IMAGE_TAG% .'
                bat 'docker tag %IMAGE_NAME%:%IMAGE_TAG% %IMAGE_NAME%:latest'
            }
        }

        stage('Test') {
            steps {
                echo 'Starting Test Stage...'
                bat 'npm test'
            }
            post {
                always {
                    echo 'Test stage completed. Jest coverage report generated in coverage folder.'
                }
            }
        }

        stage('Code Quality') {
            steps {
                echo 'Starting Code Quality Stage...'

                script {
                    def scannerHome = tool 'SonarScanner'

                    withSonarQubeEnv('SonarCloud') {
                        bat "\"${scannerHome}\\bin\\sonar-scanner.bat\""
                    }
                }

                echo 'SonarQube/SonarCloud code quality analysis completed.'
            }
        }

        stage('Security') {
            steps {
                echo 'Starting Security Stage...'
                bat 'npm audit --audit-level=moderate'
                echo 'Dependency security scan completed.'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Starting Deploy Stage...'

                bat 'docker rm -f securecareops-api || exit /b 0'
                bat 'docker rm -f securecareops-prometheus || exit /b 0'
                bat 'docker compose down --remove-orphans || exit /b 0'
                bat 'docker compose up -d --build'

                echo 'Application deployed to local Docker staging environment.'
            }
}

        stage('Release') {
            steps {
                echo 'Starting Release Stage...'
                bat 'docker tag %IMAGE_NAME%:latest %IMAGE_NAME%:release-%BUILD_NUMBER%'
                echo 'Release image created with build number.'
            }
        }

        stage('Monitoring') {
            steps {
                echo 'Starting Monitoring Stage...'
                timeout(time: 60, unit: 'SECONDS') {
                    bat 'powershell -Command "Start-Sleep -Seconds 10"'
                    bat 'powershell -Command "$response = Invoke-WebRequest -Uri http://localhost:3000/health -UseBasicParsing; if ($response.StatusCode -ne 200) { exit 1 }"'
                    bat 'powershell -Command "$metrics = Invoke-WebRequest -Uri http://localhost:3000/metrics -UseBasicParsing; if ($metrics.Content.Contains(\'securecareops_http_requests_total\') -eq $false) { exit 1 }"'                }
                echo 'Monitoring endpoints verified successfully.'
            }
        }
    }

    post {
        always {
            echo 'Pipeline completed. Collect Jenkins stage view screenshot for the report.'
        }

        success {
            echo 'SecureCareOps Jenkins pipeline completed successfully.'
        }

        failure {
            echo 'SecureCareOps Jenkins pipeline failed. Check the failed stage logs.'
        }
    }
}