import React from "react";

import Title from "./common/Title";
import SubTitle from "./common/SubTitle";

const JetBrainsInstruction: React.FC = () => {
  return (
    <div>
      <Title title={"Jetbrains IDE"} />
      <SubTitle text={"Jetbrains IDE setup instruction (PyCharm Professional)"} configRoute={"/runtime/{runtime_id}/ssh_setup/jetbrains"} />
    </div>
  );
};

export default JetBrainsInstruction;
