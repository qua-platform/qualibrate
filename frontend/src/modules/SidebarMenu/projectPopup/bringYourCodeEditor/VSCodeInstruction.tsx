import React from "react";

import Title from "./common/Title";
import SubTitle from "./common/SubTitle";
import ExpandCodeBlock from "./common/ExpandCodeBlock";

const configCode = `{
  "telemetry.telemetryLevel": "off",
  // Local config file with ssh setup
  "remote.SSH.configFile": "/home/user/Documents/.ssh_config",
  // Remote user config path. Should be unique for each user.
  "remote.SSH.serverInstallPath": {
    "<runtime_name>": "/config/vscode_users_config/user_1"
  },
  // Optional remote host type
  "remote.SSH.remotePlatform": {
    "<runtime_name>": "linux"
  },
  // Automatically install on remote host
  "remote.SSH.defaultExtensions": ["ms-python.python"]
}`;

const sshConfig = `Host <runtime_name>
  HostName <runtime host address>
  User <username>
  IdentityFile <path to private ssh key>`;

const VSCodeInstruction: React.FC = () => {
  return (
    <div>
      <Title title={"VSCode"} />
      <SubTitle text={"VSCode setup instruction"} configRoute={"/runtime/{runtime_id}/ssh_setup/vscode"} />
      <ExpandCodeBlock title={"VSCode config example:"} code={configCode} />
      <ExpandCodeBlock
        title={"Local ssh config file:"}
        subTitle={"Example of remote config. Multiple hosts can exist in one file."}
        code={sshConfig}
      />
    </div>
  );
};

export default VSCodeInstruction;
