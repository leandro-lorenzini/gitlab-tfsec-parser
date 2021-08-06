#!/usr/bin/env node

var { exec } = require("child_process");
var fs = require('fs');
var minimist = require('minimist');
const { exit } = require("process");

var argv = minimist(process.argv.slice(2));

var output = argv['output'] || 'gl-tfsec-scanning.json';
var binary = argv['binary'] || 'tfsec';

exec(`${binary} . --format json`, (error, stdout, stderr) => {
    if (stdout) {
        try {
            var vulnerabilities = JSON.parse(stdout.substring(stdout.indexOf('{')));
            vulnerabilities = vulnerabilities.results.map(vulnerability => {
                return {
                    tool: "tfsec",
                    category: "sast", 
                    name: vulnerability.impact, 
                    namespace: vulnerability.rule_id, 
                    message: vulnerability.impact, 
                    description: vulnerability.description, 
                    severity: vulnerability.severity,
                    confidence: "High",
                    scanner:{ id: "tfsec", name: "tfsec" }, 
                    location:{ 
                        file: vulnerability.location.filename.replace(process.cwd(), ""), 
                        start_line: vulnerability.location.start_line, 
                        end_line: vulnerability.location.end_line
                    }, 
                    identifiers:[{
                        type: "tfscan_rule_type", 
                        name: vulnerability.rule_id, 
                        url: vulnerability.links[0]
                    }],
                    solution: vulnerability.resolution,
                    instances: vulnerability.location.filename.replace(process.cwd(), ""),
                    links: vulnerability.links.slice(1).map(link => { 
                        return { url: link } 
                    })
                };
            });
            
            var report = {
                "version":"2.0", 
                "remediations":[],
                "scan": { 
                    "scanner":{
                        "id": "tfsec",
                        "name":"tfsec",
                        "url":"https://tfsec.dev",
                        "vendor":{ "name": "tfSec" },
                        "version":"Latest"
                    },
                    "type": "sast",
                    "status": "success"
                },
                "vulnerabilities": vulnerabilities
            };
            fs.writeFileSync(output, JSON.stringify(report, null, " "));
        } catch (error) {
            console.log(error);
            exit(-1);
        }
    } else {
        console.log(`Command "${binary} . --format json" did not return any output`);
        exit(-1);
    }
});