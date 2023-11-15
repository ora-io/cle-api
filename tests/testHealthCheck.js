import { ZkGraphYaml } from "../type/zkgyaml.js";

function test_healthcheck(yamlPath) {
  try{
      const yaml1 = ZkGraphYaml.fromYamlPath(yamlPath);
      yaml1.healthCheck();
      console.log("valid:", yamlPath);

  } catch(e) {
      console.log(e);
  }
}

test_healthcheck('tests/testsrc/zkgraph-event.yaml')
test_healthcheck('tests/testsrc/zkgraph-storage.yaml')
test_healthcheck('tests/testsrc/zkgraph-dirty.yaml')
