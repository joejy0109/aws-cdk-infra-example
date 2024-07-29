# aws-cdk-infra-example

## Set environment

Account ID 확인

```bash
aws sts get-caller-identity --query Account --output text --no-cli-pager
```

Bootstrap 생성

```bash
cdk bootstrap aws://ACCOUNT_ID/REGION

cdk bootstrap --profile AWS_PROFILE
```

App 초기화

```bash
# 현재 디렉터리가 비어 있어야 함. 만약 일부 구성 파일 때문에 비울 수 없다면
# 임의의 빈 디렉터리에서 초기화 후 파일 전체(또는 일부) 복사.

# 개발언어: typescript
cdk init app -l typescript
```

App(Infra) 배포

```bash
# 전체 스택 배포
cdk deploy --all

# 일부 스택만 배포
cdk deploy <STACK_NAME>

# 배포 시 확인 프롬프트 제외 (배포 자동화 시 필요)
cdk deploy --require-approval never
```

변경 사항 비교

```bash
cdk diff
```
