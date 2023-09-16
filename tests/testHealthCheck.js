import {loadYaml, healthCheck} from '../common/config_utils.js';

try{
    const yaml1 = loadYaml('tests/testsrc/zkgraph.yaml');
    healthCheck(yaml1);
    console.log("valid yaml1");

} catch(e) {
    console.log(e);
}

try{
    const yaml2 = loadYaml('tests/testsrc/zkgraph2.yaml');
    healthCheck(yaml2);
    console.log("valid yaml2");

} catch(e) {
    console.log(e);
}

try {
    const yaml3 = loadYaml('tests/testsrc/zkgraph3.yaml');
    healthCheck(yaml3);
    console.log("valid yaml3");
} catch(e) {
    console.log(e);
}

try {
    const yaml4 = loadYaml('tests/testsrc/zkgraph4.yaml');
    healthCheck(yaml4);
    console.log("valid yaml4");
} catch(e) {
    console.log(e);
}

