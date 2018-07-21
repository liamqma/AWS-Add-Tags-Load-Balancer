#!/usr/bin/env node
var yaml = require('js-yaml');
var fs = require('fs');
var argv = require('yargs').argv;
var AWS = require('aws-sdk');
var invariant = require('invariant');
var _ = require('lodash');

var PROJECT_NAME = 'ADD-TAGS';

function getAwsCredentials(keyFile) {
    return yaml.safeLoad(fs.readFileSync(keyFile, 'utf8'));
}

function main() {
    invariant(argv.awsKeysFilePath, 'awsKeysFilePath is required');
    invariant(argv.environmentName, 'environmentName is required');
    invariant(typeof argv.tag === 'object', 'tag is required');
    
    var awsCredentials = getAwsCredentials(argv.awsKeysFilePath);
    var environmentName = argv.environmentName;
    var tags = [];
    _.forOwn(argv.tag, function(value, key) {
        tags.push({
            Key: key,
            Value: value,
        });
    });

    var elasticbeanstalk = new AWS.ElasticBeanstalk({
        accessKeyId: awsCredentials.access_key_id,
        secretAccessKey: awsCredentials.secret_access_key,
        sessionToken: awsCredentials.session_token || null,
        region: awsCredentials.region || 'ap-southeast-2',
    });
    
    var elb = new AWS.ELB({
        accessKeyId: awsCredentials.access_key_id,
        secretAccessKey: awsCredentials.secret_access_key,
        sessionToken: awsCredentials.session_token || null,
        region: awsCredentials.region || 'ap-southeast-2',
    });
    
    elasticbeanstalk.describeEnvironmentResources({
        EnvironmentName: environmentName
    }, function(err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
            return;
        } 
        
        var LoadBalancerName = _.get(data, 'EnvironmentResources.LoadBalancers[0].Name');
        invariant(LoadBalancerName, 'Load Balancer is not found');
        console.log(PROJECT_NAME + ': Found envrionment. The LoadBalancerName is ' + LoadBalancerName); // successful response
    
        elb.addTags({
            LoadBalancerNames: [
                LoadBalancerName
            ], 
            Tags: tags
        }, function(err, data) {
            if (err) {
                console.log(err, err.stack); // an error occurred
            } else { 
                console.log(PROJECT_NAME + ': Done'); // successful response
            }
        })
    });
}

main();