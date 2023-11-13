import { ZkGraphYaml } from "../type/zkgyaml.js";

try{
    const yaml1 = ZkGraphYaml.fromYamlPath('tests/testsrc/zkgraph.yaml');
    yaml1.yamlhealthCheck();
    console.log("valid yaml1");

} catch(e) {
    console.log(e);
}

try{
    const yaml2 = ZkGraphYaml.fromYamlPath('tests/testsrc/zkgraph2.yaml');
    yaml2.yamlhealthCheck();
    console.log("valid yaml2");

} catch(e) {
    console.log(e);
}

try {
    const yaml3 = ZkGraphYaml.fromYamlPath('tests/testsrc/zkgraph3.yaml');
    yaml3.yamlhealthCheck();
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
