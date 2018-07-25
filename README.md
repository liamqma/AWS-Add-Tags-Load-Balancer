# Add tags to Load Balancer by Elasticbeanstalk environment name

## Usage

```Javascript
$ cat ./credentials.yaml
access_key_id: XXXXXXXXXXXX
secret_access_key: XXXXXXXXXXXXXXXXXXXXXXXX
$ npm i -g aws-add-tags-load-balancer
$ aws-add-tags-load-balancer --awsKeysFilePath=./credentials.yaml --environmentName=pickle-prod --tag.key1=value1 --tag.key2=value2
```