# Pipeline example

```yml
stages:
    - test
tfsec scan:
  stage: test
  image:
    name: node
  script:
    - apt-get update && apt-get install -y gnupg software-properties-common curl
    - curl -fsSL https://apt.releases.hashicorp.com/gpg | apt-key add -
    - apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
    - apt-get update && apt-get install terraform
    - terraform init
    - wget https://github.com/aquasecurity/tfsec/releases/download/v0.56.0/tfsec-linux-amd64 -O tfsec
    - chmod +x tfsec
    - npx gitlab-tfsec-parser --binary "./tfsec"
    - node gitlab-tfsec-convert/convert.js
  artifacts:
    when: always
    reports:
      sast: "gl-tfsec-scanning.json"
```