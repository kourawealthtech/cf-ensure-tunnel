/**
 * Create CloudFlare TunnelAction for GitHub
 */

const fs = require("fs");
const cp = require("child_process");

const CF_API_BASE_URL = "https://api.cloudflare.com/client/v4";

const setOutput = (name, value) => {
  if (process.env.GITHUB_ACTIONS) {
    const outputPath = process.env.GITHUB_OUTPUT;
    if (outputPath) {
      fs.appendFileSync(outputPath, `${name}=${value}\n`);
    } else {
      console.log(`::set-output name=${name}::${value}`);
    }
  }
}

const getCurrentTunnelId = () => {
  const params = new URLSearchParams({
    name: process.env.INPUT_NAME,
    is_deleted: "false",
  });

  const { status, stdout } = cp.spawnSync("curl", [
    ...["--header", `Authorization: Bearer ${process.env.INPUT_TOKEN}`],
    ...["--header", "Content-Type: application/json"],
    `${CF_API_BASE_URL}/accounts/${process.env.INPUT_ACCOUNT_ID}/cfd_tunnel?${params.toString()}`,
  ]);

  if (status !== 0) {
    process.exit(status);
  }

  const { success, result, errors } = JSON.parse(stdout.toString());

  if (!success) {
    console.log(`::error ::${errors[0].message}`);
    process.exit(1);
  }

  const name = process.env.INPUT_NAME;
  const record = result.find((x) => x.name === name);

  if (!record) {
    return null
  }

  setOutput('id', record.id);
  return record.id;
};

const createTunnel = () => {
  // https://api.cloudflare.com/#dns-records-for-a-zone-create-dns-record
  const { status, stdout } = cp.spawnSync("curl", [
    ...["--request", "POST"],
    ...["--header", `Authorization: Bearer ${process.env.INPUT_TOKEN}`],
    ...["--header", "Content-Type: application/json"],
    ...["--silent", "--data"],
    JSON.stringify({
      name: process.env.INPUT_NAME,
      config_src: process.env.INPUT_CONFIG,
    }),
    `${CF_API_BASE_URL}/accounts/${process.env.INPUT_ACCOUNT_ID}/cfd_tunnel`,
  ]);

  if (status !== 0) {
    process.exit(status);
  }

  const { success, result, errors } = JSON.parse(stdout.toString());

  if (!success) {
    console.dir(errors[0]);
    console.log(`::error ::${errors[0].message}`);
    process.exit(1);
  }

  setOutput('id', result.id);
};

const getTunnelToken = (id) => {
  const { status, stdout } = cp.spawnSync("curl", [
    ...["--header", `Authorization: Bearer ${process.env.INPUT_TOKEN}`],
    ...["--header", "Content-Type: application/json"],
    `${CF_API_BASE_URL}/accounts/${process.env.INPUT_ACCOUNT_ID}/cfd_tunnel/${id}/token`,
  ]);

  if (status !== 0) {
    process.exit(status);
  }

  const { success, result, errors } = JSON.parse(stdout.toString());

  if (!success) {
    console.log(`::error ::${errors[0].message}`);
    process.exit(1);
  }

  const token = result.result;
  console.log(`::add-mask::${token}`);
  setOutput('token', token);
};

const id = getCurrentTunnelId();
if (id) {
  getTunnelToken(id);
} else {
  const newId = createTunnel();
  getTunnelToken(newId);
}
