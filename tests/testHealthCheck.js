import {loadYaml, yamlhealthCheck} from '../common/config_utils.js';

try{
    const yaml1 = loadYaml('tests/testsrc/zkgraph.yaml');
    yamlhealthCheck(yaml1);
    console.log("valid yaml1");

} catch(e) {
    console.log(e);
}

try{
    const yaml2 = loadYaml('tests/testsrc/zkgraph2.yaml');
    yamlhealthCheck(yaml2);
    console.log("valid yaml2");

} catch(e) {
    console.log(e);
}

try {
    const yaml3 = loadYaml('tests/testsrc/zkgraph3.yaml');
    yamlhealthCheck(yaml3);
    console.log("valid yaml3");
} catch(e) {
    console.log(e);
}

// try {
//     const yaml4 = loadYaml('tests/testsrc/zkgraph4.yaml');
//     yamlhealthCheck(yaml4);
//     console.log("valid yaml4");
// } catch(e) {
//     console.log(e);
// }

// try {
//     const yaml5 = loadYaml('tests/testsrc/zkgraph5.yaml');
//     yamlhealthCheck(yaml5);
//     console.log("valid yaml5");
// } catch(e) {
//     console.log(e);
// }
