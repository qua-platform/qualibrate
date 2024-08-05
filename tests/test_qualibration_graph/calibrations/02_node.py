from qualibrate import NodeParameters, QualibrationNode


class Parameters(NodeParameters):
    str_value: str = "test"
    float_value: float = 1.0



node = QualibrationNode("one_more_node", parameters_class=Parameters)
node.parameters = Parameters()

import requests

response = requests.get("https://ya.ru")
print(response.status_code)

