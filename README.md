# AWS SAM Lambda NodeJS S3 Example  
Lambda S3 lab from the Backspace Academy AWS Certified Developer Associate course.  
## Instructions  
install DOCKER
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user
exit and relogin
Verify Docker works --> docker run hello-world

cd aws-sam-lambda-nodejs-s3/code  
npm init  
npm install sharp  
rm -r node_modules  
cd ../  
sam build --use-container
sam deploy --guided
