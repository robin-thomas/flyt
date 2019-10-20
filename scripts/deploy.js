const { spawn } = require("child_process");

const config = require("../src/config.json");

const args = process.argv.slice(2).join(" ");
console.log(`RUNNING build with args: ${args}`);

const truffle = () => {
  const network = config[config.app].network.name;
  const cmd = spawn("truffle", [
    "deploy",
    "--network",
    network,
    "--reset",
    "all"
  ]);

  cmd.stdout.on("data", data => console.log(data.toString()));
  cmd.stderr.on("data", data => console.log(data.toString()));
};

switch (args) {
  default:
  case "truffle":
    truffle();
    break;
}
