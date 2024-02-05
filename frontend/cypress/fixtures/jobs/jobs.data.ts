export const workflowListData = [
  {
    name: "A day in office",
    description: "What happens in local office",
    commit: "388550c965d879bb7beff7861b62f02b6adb1dc0",
    nodes: {
      GrumpyAdministrator: {
        description: "divides task lisk and sends them to others",
        inputs: {
          "customers (list of strings)": "all customers we have today",
          "clerk_salary (k$)": "workforce demands",
        },
        outputs: {
          "clerk_request (string)": "notifies connected clerk to do work",
        },
        outputs_retention: {
          clerk_request: 0,
        },
      },
      CheerfulNode: {
        description: "greets customers",
        inputs: {
          "customer (human)": "one person at a time",
          "weather (best guess)": "How is weather today",
        },
        outputs: {
          "requested_salary (k$)": "requested fees from administrator",
        },
        outputs_retention: {
          requested_salary: 2,
        },
      },
    },
    time_created: "2022-06-16T07:36:15.994644+00:00",
    author_id: 1,
    data_id: 14,
    id: 14,
    eui: {
      path: "#/we",
    },
  },
  {
    name: "A day in office",
    description: "What happens in local office",
    commit: "f14c6c8480503ee28e6468c1197836aaa268b14d",
    nodes: {
      GrumpyAdministrator: {
        description: "divides task lisk and sends them to others",
        inputs: {
          "customers (list of strings)": "all customers we have today",
          "clerk_salary (k$)": "workforce demands",
        },
        outputs: {
          "clerk_request (string)": "notifies connected clerk to do work",
        },
        outputs_retention: {
          clerk_request: 0,
        },
      },
      CheerfulNode: {
        description: "greets customers",
        inputs: {
          "customer (human)": "one person at a time",
          "weather (best guess)": "How is weather today",
        },
        outputs: {
          "requested_salary (k$)": "requested fees from administrator",
        },
        outputs_retention: {
          requested_salary: 2,
        },
      },
    },
    time_created: "2022-06-06T15:19:04.550664+00:00",
    author_id: 1,
    data_id: 7,
    id: 7,
    eui: {
      path: "#/w7",
    },
  },
  {
    name: "Scan with error correction",
    description: "Performs Bayesian estimation for the optimal parameters and uses this during the circuit run.",
    commit: "32b961de580e8b226007804f2eae62842acd7f61",
    nodes: {
      CalibrateSystem: {
        description: "Makes sure that system is calibrated",
        inputs: {
          "instrumentAddress (IP address)": "instrument IP address for calibration",
        },
        outputs: {
          "calibration_status (calibrated, uncalibrated)": "Calibration status",
        },
        outputs_retention: {
          calibration_status: 0,
        },
      },
      TaskList: {
        description: "Does scan of parameters and triggers circuit execution",
        inputs: {
          "calibration (status)": "node will execute only if it receives positive calibration status",
          "scan_points (MHz)": "an array for setpoint execution",
          "laser_setpoint_locked (bool)": "Triger when laser setpoint is set",
          "circuit_done (bool)": "Triger when circuit execution is done",
        },
        outputs: {
          "circuit_specification (JSON)": "Triggers circuit execution by providing information for run",
          "scan_setpoint (MHz)": "Laser setpoint",
          "status (json)": "window into what node is doing",
        },
        outputs_retention: {
          circuit_specification: 0,
          scan_setpoint: 0,
          status: 1,
        },
      },
      ExternalScan: {
        description: "Sets and maintains instrument variables",
        inputs: {
          "set_point (status)": "node will execute only if it receives positive calibration status",
        },
        outputs: {
          "setpoint_reached (bool)": "Trigger",
        },
        outputs_retention: {
          setpoint_reached: 0,
        },
      },
      QPUcircuitRunner: {
        description: "Executes given circuit sequence",
        inputs: {
          "circuit_param (JSON)": "cirucuit description",
          "error_correction (JSON)": "corrected data",
        },
        outputs: {
          "precorrected_data (JSON)": "data send for error correction",
          "circuit_finished (bool)": "Event trigger",
          "final_data (bool)": "circuit averaged output",
        },
        outputs_retention: {
          precorrected_data: 2,
          circuit_finished: 0,
          final_data: 2,
        },
      },
      BayesianEstimation: {
        description: "error correction algorithm",
        inputs: {
          "precorrected_data (JSON)": "cirucuit description",
        },
        outputs: {
          "correction_data (JSON)": "corrected data",
        },
        outputs_retention: {
          correction_data: 2,
        },
      },
      FinalDataAnalysis: {
        description: "Final fitting and plotting",
        inputs: {
          "data (JSON)": "experiment results",
        },
        outputs: {
          "estimated_parameter (MHz)": "final result",
          "final_plot (png)": "to-do",
        },
        outputs_retention: {
          estimated_parameter: 2,
          final_plot: 2,
        },
      },
    },
    time_created: "2022-05-27T13:17:51.771807+00:00",
    author_id: 1,
    data_id: 5,
    id: 5,
    eui: {
      path: "#/w5",
    },
  },
  {
    name: "Scan with error correction",
    description: "Performs Bayesian estimation for the optimal parameters and uses this during the circuit run.",
    commit: "4689f350c631b7d5eaa5756bcfbba54e6ea14359",
    nodes: {
      CalibrateSystem: {
        description: "Makes sure that system is calibrated",
        inputs: {
          "instrumentAddress (IP address)": "instrument IP address for calibration",
        },
        outputs: {
          "calibration_status (calibrated, uncalibrated)": "Calibration status",
        },
        outputs_retention: {
          calibration_status: 0,
        },
      },
      TaskList: {
        description: "Does scan of parameters and triggers circuit execution",
        inputs: {
          "calibration (status)": "node will execute only if it receives positive calibration status",
          "scan_points (MHz)": "an array for setpoint execution",
          "laser_setpoint_locked (bool)": "Triger when laser setpoint is set",
          "circuit_done (bool)": "Triger when circuit execution is done",
        },
        outputs: {
          "circuit_specification (JSON)": "Triggers circuit execution by providing information for run",
          "scan_setpoint (MHz)": "Laser setpoint",
          "status (json)": "window into what node is doing",
        },
        outputs_retention: {
          circuit_specification: 0,
          scan_setpoint: 0,
          status: 1,
        },
      },
      ExternalScan: {
        description: "Sets and maintains instrument variables",
        inputs: {
          "set_point (status)": "node will execute only if it receives positive calibration status",
        },
        outputs: {
          "setpoint_reached (bool)": "Trigger",
        },
        outputs_retention: {
          setpoint_reached: 0,
        },
      },
      QPUcircuitRunner: {
        description: "Executes given circuit sequence",
        inputs: {
          "circuit_param (JSON)": "cirucuit description",
          "error_correction (JSON)": "corrected data",
        },
        outputs: {
          "precorrected_data (JSON)": "data send for error correction",
          "circuit_finished (bool)": "Event trigger",
          "final_data (bool)": "circuit averaged output",
        },
        outputs_retention: {
          precorrected_data: 2,
          circuit_finished: 0,
          final_data: 2,
        },
      },
      BayesianEstimation: {
        description: "error correction algorithm",
        inputs: {
          "precorrected_data (JSON)": "cirucuit description",
        },
        outputs: {
          "correction_data (JSON)": "corrected data",
        },
        outputs_retention: {
          correction_data: 2,
        },
      },
      FinalDataAnalysis: {
        description: "Final fitting and plotting",
        inputs: {
          "data (JSON)": "experiment results",
        },
        outputs: {
          "estimated_parameter (MHz)": "final result",
          "final_plot (png)": "to-do",
        },
        outputs_retention: {
          estimated_parameter: 2,
          final_plot: 2,
        },
      },
    },
    time_created: "2022-05-25T19:58:41.518713+00:00",
    author_id: 1,
    data_id: 4,
    id: 4,
    eui: {
      path: "#/w4",
    },
  },
  {
    name: "Scan with error correction",
    description: "Performs Bayesian estimation for the optimal parameters and uses this during the circuit run.",
    commit: "db79656c27eff41374ea12baefea7ab7bea26294",
    nodes: {
      CalibrateSystem: {
        description: "Makes sure that system is calibrated",
        inputs: {
          "instrumentAddress (IP address)": "instrument IP address for calibration",
        },
        outputs: {
          "calibration_status (calibrated, uncalibrated)": "Calibration status",
        },
        outputs_retention: {
          calibration_status: 0,
        },
      },
      TaskList: {
        description: "Does scan of parameters and triggers circuit execution",
        inputs: {
          "calibration (status)": "node will execute only if it receives positive calibration status",
          "circuit_done (bool)": "Triger when circuit execution is done",
          "laser_setpoint_locked (bool)": "Triger when laser setpoint is set",
          "scan_points (MHz)": "an array for setpoint execution",
        },
        outputs: {
          "circuit_specification (JSON)": "Triggers circuit execution by providing information for run",
          "scan_setpoint (MHz)": "Laser setpoint",
          "status (json)": "window into what node is doing",
        },
        outputs_retention: {
          circuit_specification: 0,
          scan_setpoint: 0,
          status: 1,
        },
      },
      ExternalScan: {
        description: "Sets and maintains instrument variables",
        inputs: {
          "set_point (status)": "node will execute only if it receives positive calibration status",
        },
        outputs: {
          "setpoint_reached (bool)": "Trigger",
        },
        outputs_retention: {
          setpoint_reached: 0,
        },
      },
      QPUcircuitRunner: {
        description: "Executes given circuit sequence",
        inputs: {
          "circuit_param (JSON)": "cirucuit description",
          "error_correction (JSON)": "corrected data",
        },
        outputs: {
          "precorrected_data (JSON)": "data send for error correction",
          "circuit_finished (bool)": "Event trigger",
          "final_data (bool)": "circuit averaged output",
        },
        outputs_retention: {
          precorrected_data: 2,
          circuit_finished: 0,
          final_data: 2,
        },
      },
      BayesianEstimation: {
        description: "error correction algorithm",
        inputs: {
          "precorrected_data (JSON)": "cirucuit description",
        },
        outputs: {
          "correction_data (JSON)": "corrected data",
        },
        outputs_retention: {
          correction_data: 2,
        },
      },
      FinalDataAnalysis: {
        description: "Final fitting and plotting",
        inputs: {
          "data (JSON)": "experiment results",
        },
        outputs: {
          "estimated_parameter (MHz)": "final result",
          "final_plot (png)": "to-do",
        },
        outputs_retention: {
          estimated_parameter: 2,
          final_plot: 2,
        },
      },
    },
    time_created: "2022-05-06T08:14:34.849763+00:00",
    author_id: 1,
    data_id: 1,
    id: 1,
    eui: {
      path: "#/w1",
    },
  },
];

export const jobsListData = [
  {
    description: "desc",
    project_id: 1,
    runtime_id: 1,
    author_id: 1,
    submit: "2022-05-06T08:15:39.013052+00:00",
    current_status: "Failure",
    id: 1,
    workflow_id: 1,
    parameters_id: 1,
    start: null,
    end: "2022-05-06T08:15:39.311442+00:00",
    eui: {
      path: "#/j1",
    },
  },

  {
    description: "test_diff1",
    project_id: 1,
    runtime_id: 1,
    author_id: 1,
    submit: "2022-05-27T13:17:51.873339+00:00",
    current_status: "Pending",
    id: 7,
    workflow_id: 5,
    parameters_id: 6,
    start: null,
    end: null,
    eui: {
      path: "#/j7",
    },
  },

  {
    description: "Thjs",
    project_id: 1,
    runtime_id: 1,
    author_id: 1,
    submit: "2022-05-25T19:58:41.625550+00:00",
    current_status: "Revoked",
    id: 6,
    workflow_id: 4,
    parameters_id: 5,
    start: null,
    end: null,
    eui: {
      path: "#/j6",
    },
  },
  {
    description: "16.06 10:26",
    project_id: 1,
    runtime_id: 1,
    author_id: 1,
    submit: "2022-06-16T07:26:12.263665+00:00",
    current_status: "Partially successful",
    id: 49,
    workflow_id: 7,
    parameters_id: 9,
    start: null,
    end: "2022-06-16T07:26:22.016507+00:00",
    eui: {
      path: "#/j31",
    },
  },
  {
    description: "16.06 10:37",
    project_id: 1,
    runtime_id: 1,
    author_id: 1,
    submit: "2022-06-16T07:37:25.804924+00:00",
    current_status: "Successful",
    id: 51,
    workflow_id: 14,
    parameters_id: 16,
    start: null,
    end: "2022-06-16T07:37:33.890193+00:00",
    eui: {
      path: "#/j33",
    },
  },
];

export const jobParameterData = {
  workflow: {
    name: "A day in office",
    nodes: {
      CheerfulNode: {
        inputs: {
          "customer (human)": "one person at a time",
          "weather (best guess)": "How is weather today",
        },
        outputs: {
          "requested_salary (k$)": "requested fees from administrator",
        },
        description: "greets customers",
        outputs_retention: {
          requested_salary: 2,
        },
      },
      GrumpyAdministrator: {
        inputs: {
          "clerk_salary (k$)": "workforce demands",
          "customers (list of strings)": "all customers we have today",
        },
        outputs: {
          "clerk_request (string)": "notifies connected clerk to do work",
        },
        description: "divides task lisk and sends them to others",
        outputs_retention: {
          clerk_request: 0,
        },
      },
    },
    description: "What happens in local office",
  },
  parameters: {
    boss: {
      customers: "[1,2,3,4,5]",
    },
    clerk: {
      weather: '"sunny_rainy"',
    },
  },
};

export const jobsDiff = {
  workflow:
    'diff --git a/cheerful_node.py b/cheerful_node.py\ndeleted file mode 100644\nindex bc7862f..0000000\n--- a/cheerful_node.py\n+++ /dev/null\n@@ -1,50 +0,0 @@\n-# ==================== DEFINE NODE ====================\n-import entropylab.flame.nodeio as nodeio\n-import time\n-\n-nodeio.context(\n-    name="CheerfulNode",\n-    description="greets customers",\n-    icon="bootstrap/person-circle.svg",\n-)\n-\n-inputs = nodeio.Inputs()\n-inputs.flow("customer", units="human", description="one person at a time")\n-inputs.state("weather", units="best guess", description="How is weather today")\n-\n-outputs = nodeio.Outputs()\n-outputs.define(\n-    "requested_salary",\n-    units="k$",\n-    description="requested fees from administrator",\n-    retention=2,\n-)\n-\n-nodeio.register()\n-\n-# ==================== DRY RUN DATA ====================\n-\n-inputs.set(weather="sunny")\n-inputs.set(customer="Alice")\n-inputs.set(customer="Bob")\n-inputs.set(customer="Mars")\n-inputs.set(customer="Venus")\n-\n-# =============== RUN NODE STATE MACHINE ===============\n-\n-part_of_day = 0\n-salary_demand = 0.0\n-\n-while nodeio.status.active:\n-    person = inputs.get("customer")\n-    weather = inputs.get("weather")\n-    if part_of_day % 2 == 0:\n-        day_time = "morning"\n-    else:\n-        day_time = "afternoon"\n-    print(f"Hi {person}, it is a {weather} {day_time}")\n-    part_of_day += 1\n-\n-    salary_demand += 1.2\n-\n-    outputs.set(requested_salary=salary_demand)\ndiff --git a/circuitExec.py b/circuitExec.py\nindex 2dab526..b84fe08 100644\n--- a/circuitExec.py\n+++ b/circuitExec.py\n@@ -11,8 +11,8 @@ nodeio.context(\n )\n \n input = nodeio.Inputs()\n-input.flow("circuit_param", units="JSON", description="cirucuit description")\n-input.flow("error_correction", units="JSON", description="corrected data")\n+input.stream("circuit_param", units="JSON", description="cirucuit description")\n+input.stream("error_correction", units="JSON", description="corrected data")\n \n output = nodeio.Outputs()\n output.define(\ndiff --git a/entropynodes/library/BayesianEstimation.py b/entropynodes/library/BayesianEstimation.py\nindex 8891c58..657b6a5 100644\n--- a/entropynodes/library/BayesianEstimation.py\n+++ b/entropynodes/library/BayesianEstimation.py\n@@ -8,7 +8,7 @@ class BayesianEstimation(object):\n     def __init__(self, workflow_node_unique_name, precorrected_data=None):\n         """error correction algorithm\n \n-        :param precorrected_data: (JSON - FLOW) cirucuit description\n+        :param precorrected_data: (JSON - STREAM) cirucuit description\n         """\n         self._command = "python3"\n         self._bin = "errorCorrection.py"\ndiff --git a/entropynodes/library/CheerfulNode.py b/entropynodes/library/CheerfulNode.py\ndeleted file mode 100644\nindex b250fe1..0000000\n--- a/entropynodes/library/CheerfulNode.py\n+++ /dev/null\n@@ -1,90 +0,0 @@\n-from entropylab.flame.inputs import Inputs\n-from entropylab.flame.workflow import Workflow\n-\n-__all__ = ["CheerfulNode"]\n-\n-\n-class CheerfulNode(object):\n-    def __init__(self, workflow_node_unique_name, customer=None, weather=None):\n-        """greets customers\n-\n-        :param customer: (human - FLOW) one person at a time\n-        :param weather: (best guess - STATE) How is weather today\n-        """\n-        self._command = "python3"\n-        self._bin = "cheerful_node.py"\n-        self._name = workflow_node_unique_name\n-        self._icon = "bootstrap/person-circle.svg"\n-        self._inputs = _Inputs(\n-            customer=customer,\n-            weather=weather,\n-        )\n-        self._outputs = _Outputs(self._name)\n-        self._host = {}\n-        Workflow._register_node(self)  # register the node in the workflow context\n-\n-    def host(self, **kwargs):\n-        """Sets additional options for execution on the host."""\n-        for key, value in kwargs.items():\n-            self._host[key] = value\n-        return self\n-\n-    @property\n-    def i(self):\n-        """Node inputs"""\n-        return self._inputs\n-\n-    @property\n-    def o(self):\n-        """Node outputs"""\n-        return self._outputs\n-\n-\n-class _Inputs(object):\n-    def __init__(self, customer=None, weather=None):\n-        self._inputs = Inputs()\n-\n-        self._inputs.state(\n-            "customer", description="one person at a time", units="human"\n-        )\n-        self._inputs.set(customer=customer)\n-\n-        self._inputs.state(\n-            "weather", description="How is weather today", units="best guess"\n-        )\n-        self._inputs.set(weather=weather)\n-\n-    @property\n-    def customer(self):\n-        """Input: one person at a time (human)"""\n-        return self._inputs.get("customer")\n-\n-    @customer.setter\n-    def customer(self, value):\n-        """Input: one person at a time (human)"""\n-        self._inputs.set(customer=value)\n-\n-    @property\n-    def weather(self):\n-        """Input: How is weather today (best guess)"""\n-        return self._inputs.get("weather")\n-\n-    @weather.setter\n-    def weather(self, value):\n-        """Input: How is weather today (best guess)"""\n-        self._inputs.set(weather=value)\n-\n-\n-class _Outputs(object):\n-    def __init__(self, name):\n-        self._name = name\n-        self._outputs = [\n-            "requested_salary",\n-        ]\n-\n-    @property\n-    def requested_salary(self):\n-        """Output: requested fees from administrator\n-        :return: (k$)\n-        """\n-        return "#" + self._name + "/requested_salary"\ndiff --git a/entropynodes/library/ExternalScan.py b/entropynodes/library/ExternalScan.py\nindex 4e91f00..b9384bb 100644\n--- a/entropynodes/library/ExternalScan.py\n+++ b/entropynodes/library/ExternalScan.py\n@@ -8,7 +8,7 @@ class ExternalScan(object):\n     def __init__(self, workflow_node_unique_name, set_point=None):\n         """Sets and maintains instrument variables\n \n-        :param set_point: (status - FLOW) node will execute only if it receives positive calibration status\n+        :param set_point: (status - STREAM) node will execute only if it receives positive calibration status\n         """\n         self._command = "python3"\n         self._bin = "externalScan.py"\ndiff --git a/entropynodes/library/FinalDataAnalysis.py b/entropynodes/library/FinalDataAnalysis.py\nindex 6117d4d..205a796 100644\n--- a/entropynodes/library/FinalDataAnalysis.py\n+++ b/entropynodes/library/FinalDataAnalysis.py\n@@ -8,7 +8,7 @@ class FinalDataAnalysis(object):\n     def __init__(self, workflow_node_unique_name, data=None):\n         """Final fitting and plotting\n \n-        :param data: (JSON - FLOW) experiment results\n+        :param data: (JSON - STREAM) experiment results\n         """\n         self._command = "python3"\n         self._bin = "plot.py"\ndiff --git a/entropynodes/library/GrumpyAdministrator.py b/entropynodes/library/GrumpyAdministrator.py\ndeleted file mode 100644\nindex d9b6373..0000000\n--- a/entropynodes/library/GrumpyAdministrator.py\n+++ /dev/null\n@@ -1,90 +0,0 @@\n-from entropylab.flame.inputs import Inputs\n-from entropylab.flame.workflow import Workflow\n-\n-__all__ = ["GrumpyAdministrator"]\n-\n-\n-class GrumpyAdministrator(object):\n-    def __init__(self, workflow_node_unique_name, customers=None, clerk_salary=None):\n-        """divides task lisk and sends them to others\n-\n-        :param customers: (list of strings - STATE) all customers we have today\n-        :param clerk_salary: (k$ - STATE) workforce demands\n-        """\n-        self._command = "python3"\n-        self._bin = "grumpy_administrator.py"\n-        self._name = workflow_node_unique_name\n-        self._icon = "bootstrap/person-lines-fill.svg"\n-        self._inputs = _Inputs(\n-            customers=customers,\n-            clerk_salary=clerk_salary,\n-        )\n-        self._outputs = _Outputs(self._name)\n-        self._host = {}\n-        Workflow._register_node(self)  # register the node in the workflow context\n-\n-    def host(self, **kwargs):\n-        """Sets additional options for execution on the host."""\n-        for key, value in kwargs.items():\n-            self._host[key] = value\n-        return self\n-\n-    @property\n-    def i(self):\n-        """Node inputs"""\n-        return self._inputs\n-\n-    @property\n-    def o(self):\n-        """Node outputs"""\n-        return self._outputs\n-\n-\n-class _Inputs(object):\n-    def __init__(self, customers=None, clerk_salary=None):\n-        self._inputs = Inputs()\n-\n-        self._inputs.state(\n-            "customers",\n-            description="all customers we have today",\n-            units="list of strings",\n-        )\n-        self._inputs.set(customers=customers)\n-\n-        self._inputs.state("clerk_salary", description="workforce demands", units="k$")\n-        self._inputs.set(clerk_salary=clerk_salary)\n-\n-    @property\n-    def customers(self):\n-        """Input: all customers we have today (list of strings)"""\n-        return self._inputs.get("customers")\n-\n-    @customers.setter\n-    def customers(self, value):\n-        """Input: all customers we have today (list of strings)"""\n-        self._inputs.set(customers=value)\n-\n-    @property\n-    def clerk_salary(self):\n-        """Input: workforce demands (k$)"""\n-        return self._inputs.get("clerk_salary")\n-\n-    @clerk_salary.setter\n-    def clerk_salary(self, value):\n-        """Input: workforce demands (k$)"""\n-        self._inputs.set(clerk_salary=value)\n-\n-\n-class _Outputs(object):\n-    def __init__(self, name):\n-        self._name = name\n-        self._outputs = [\n-            "clerk_request",\n-        ]\n-\n-    @property\n-    def clerk_request(self):\n-        """Output: notifies connected clerk to do work\n-        :return: (string)\n-        """\n-        return "#" + self._name + "/clerk_request"\ndiff --git a/entropynodes/library/QPUcircuitRunner.py b/entropynodes/library/QPUcircuitRunner.py\nindex 13b73c1..c0f0c4a 100644\n--- a/entropynodes/library/QPUcircuitRunner.py\n+++ b/entropynodes/library/QPUcircuitRunner.py\n@@ -10,8 +10,8 @@ class QPUcircuitRunner(object):\n     ):\n         """Executes given circuit sequence\n \n-        :param circuit_param: (JSON - FLOW) cirucuit description\n-        :param error_correction: (JSON - FLOW) corrected data\n+        :param circuit_param: (JSON - STREAM) cirucuit description\n+        :param error_correction: (JSON - STREAM) corrected data\n         """\n         self._command = "python3"\n         self._bin = "circuitExec.py"\ndiff --git a/entropynodes/library/TaskList.py b/entropynodes/library/TaskList.py\nindex ac8e37e..a88bba0 100644\n--- a/entropynodes/library/TaskList.py\n+++ b/entropynodes/library/TaskList.py\n@@ -17,8 +17,8 @@ class TaskList(object):\n \n         :param calibration: (status - STATE) node will execute only if it receives positive calibration status\n         :param scan_points: (MHz - STATE) an array for setpoint execution\n-        :param laser_setpoint_locked: (bool - FLOW) Triger when laser setpoint is set\n-        :param circuit_done: (bool - FLOW) Triger when circuit execution is done\n+        :param laser_setpoint_locked: (bool - STREAM) Triger when laser setpoint is set\n+        :param circuit_done: (bool - STREAM) Triger when circuit execution is done\n         """\n         self._command = "python3"\n         self._bin = "sequence.py"\ndiff --git a/entropynodes/schema/CheerfulNode.json b/entropynodes/schema/CheerfulNode.json\ndeleted file mode 100644\nindex 7d64236..0000000\n--- a/entropynodes/schema/CheerfulNode.json\n+++ /dev/null\n@@ -1,27 +0,0 @@\n-{\n-  "name": "CheerfulNode",\n-  "description": "greets customers",\n-  "command": "python3",\n-  "bin": "cheerful_node.py",\n-  "dependancies": [],\n-  "icon": "bootstrap/person-circle.svg",\n-  "inputs": [\n-    {\n-      "description": {\n-        "customer": "one person at a time",\n-        "weather": "How is weather today"\n-      },\n-      "units": { "customer": "human", "weather": "best guess" },\n-      "type": { "customer": 2, "weather": 1 }\n-    }\n-  ],\n-  "outputs": [\n-    {\n-      "description": {\n-        "requested_salary": "requested fees from administrator"\n-      },\n-      "units": { "requested_salary": "k$" },\n-      "retention": { "requested_salary": 2 }\n-    }\n-  ]\n-}\ndiff --git a/entropynodes/schema/GrumpyAdministrator.json b/entropynodes/schema/GrumpyAdministrator.json\ndeleted file mode 100644\nindex 2dedc49..0000000\n--- a/entropynodes/schema/GrumpyAdministrator.json\n+++ /dev/null\n@@ -1,25 +0,0 @@\n-{\n-  "name": "GrumpyAdministrator",\n-  "description": "divides task lisk and sends them to others",\n-  "command": "python3",\n-  "bin": "grumpy_administrator.py",\n-  "dependancies": [],\n-  "icon": "bootstrap/person-lines-fill.svg",\n-  "inputs": [\n-    {\n-      "description": {\n-        "customers": "all customers we have today",\n-        "clerk_salary": "workforce demands"\n-      },\n-      "units": { "customers": "list of strings", "clerk_salary": "k$" },\n-      "type": { "customers": 1, "clerk_salary": 1 }\n-    }\n-  ],\n-  "outputs": [\n-    {\n-      "description": { "clerk_request": "notifies connected clerk to do work" },\n-      "units": { "clerk_request": "string" },\n-      "retention": { "clerk_request": 0 }\n-    }\n-  ]\n-}\ndiff --git a/errorCorrection.py b/errorCorrection.py\nindex 8aee372..a445ab6 100644\n--- a/errorCorrection.py\n+++ b/errorCorrection.py\n@@ -1,5 +1,6 @@\n import entropylab.flame.nodeio as nodeio\n import time\n+from math import floor\n \n # ==================== DEFINE NODE ====================\n \n@@ -10,7 +11,7 @@ nodeio.context(\n )\n \n input = nodeio.Inputs()\n-input.flow("precorrected_data", units="JSON", description="cirucuit description")\n+input.stream("precorrected_data", units="JSON", description="cirucuit description")\n \n output = nodeio.Outputs()\n output.define(\n@@ -33,8 +34,6 @@ input.set(\n \n # =============== RUN NODE STATE MACHINE ===============\n \n-from math import floor\n-\n v = 0\n \n while nodeio.status.active:\ndiff --git a/externalScan.py b/externalScan.py\nindex baa653c..16f72df 100644\n--- a/externalScan.py\n+++ b/externalScan.py\n@@ -1,5 +1,4 @@\n import entropylab.flame.nodeio as nodeio\n-import time\n \n # ==================== DEFINE NODE ====================\n \n@@ -10,7 +9,7 @@ nodeio.context(\n )\n \n input = nodeio.Inputs()\n-input.flow(\n+input.stream(\n     "set_point",\n     units="status",\n     description="node will execute only if it receives positive calibration status",\ndiff --git a/grumpy_administrator.py b/grumpy_administrator.py\ndeleted file mode 100644\nindex ed6c4cf..0000000\n--- a/grumpy_administrator.py\n+++ /dev/null\n@@ -1,46 +0,0 @@\n-# ==================== DEFINE NODE ====================\n-import entropylab.flame.nodeio as nodeio\n-import time\n-\n-nodeio.context(\n-    name="GrumpyAdministrator",\n-    description="divides task lisk and sends them to others",\n-    icon="bootstrap/person-lines-fill.svg",\n-)\n-\n-inputs = nodeio.Inputs()\n-inputs.state(\n-    "customers", units="list of strings", description="all customers we have today"\n-)\n-inputs.state("clerk_salary", units="k$", description="workforce demands")\n-\n-outputs = nodeio.Outputs()\n-outputs.define(\n-    "clerk_request",\n-    units="string",\n-    description="notifies connected clerk to do work",\n-    retention=0,\n-)\n-\n-nodeio.register()\n-\n-# ==================== DRY RUN DATA ====================\n-\n-inputs.set(customers=["Alice", "Bob"])\n-inputs.set(clerk_salary=23.2)\n-\n-# =============== RUN NODE STATE MACHINE ===============\n-\n-while nodeio.status.active:\n-    today_work = inputs.get("customers")\n-    for i, customer in enumerate(today_work):\n-        outputs.set(clerk_request=customer)\n-        print(f"Here comes {customer}")\n-        # budget_requests = inputs.get("clerk_salary")\n-        # print(f"Clerk demands {budget_requests} k$")\n-\n-    time.sleep(1)  # coffee break\n-    budget_requests = inputs.get("clerk_salary")\n-    print(f"Clerk demands {budget_requests} k$")\n-\n-    nodeio.terminate_workflow()\ndiff --git a/plot.py b/plot.py\nindex e0088ba..cd76225 100644\n--- a/plot.py\n+++ b/plot.py\n@@ -1,5 +1,9 @@\n import entropylab.flame.nodeio as nodeio\n-import time\n+\n+import numpy as np\n+import matplotlib.pyplot as plt\n+import io\n+import base64\n \n # ==================== DEFINE NODE ====================\n \n@@ -10,7 +14,7 @@ nodeio.context(\n )\n \n input = nodeio.Inputs()\n-input.flow("data", units="JSON", description="experiment results")\n+input.stream("data", units="JSON", description="experiment results")\n \n output = nodeio.Outputs()\n output.define(\n@@ -27,11 +31,6 @@ input.set(data=3.23)\n \n # =============== RUN NODE STATE MACHINE ===============\n \n-import numpy as np\n-import matplotlib.pyplot as plt\n-import io\n-import base64\n-\n while nodeio.status.active:\n     a = input.get("data")\n     print(a)\ndiff --git a/sequence.py b/sequence.py\nindex 9287bde..6b1c5e1 100644\n--- a/sequence.py\n+++ b/sequence.py\n@@ -17,12 +17,12 @@ input.state(\n )\n input.state("scan_points", units="MHz", description="an array for setpoint execution")\n \n-input.flow(\n+input.stream(\n     "laser_setpoint_locked",\n     units="bool",\n     description="Triger when laser setpoint is set",\n )\n-input.flow(\n+input.stream(\n     "circuit_done", units="bool", description="Triger when circuit execution is done"\n )\n \ndiff --git a/workflow.py b/workflow.py\nindex d72b20f..9413ab6 100644\n--- a/workflow.py\n+++ b/workflow.py\n@@ -3,7 +3,8 @@ from entropylab.flame.workflow import Workflow\n \n wf = Workflow(\n     "Scan with error correction",\n-    description="Performs Bayesian estimation for the optimal parameters and uses this during the circuit run.",\n+    description="Performs Bayesian estimation for the optimal parameters "\n+    "and uses this during the circuit run.",\n )\n \n c = expNodes.CalibrateSystem("calibration_1")\n',
  parameters:
    'diff --git a/parameters.json b/parameters.json\nindex 394103e..63e946f 100644\n--- a/parameters.json\n+++ b/parameters.json\n@@ -1,22 +1,11 @@\n {\n   "calibration_1": {\n-    "instrumentAddress": "123.192.41.56"\n+    "instrumentAddress": "123.192.41.5"\n   },\n   "scan_list": {\n     "scan_points": [\n-      1.23,\n-      4.2,\n-      10.2,\n-      18.2,\n-      24.2,\n-      27.8,\n-      28.1,\n-      28.6,\n-      29.1,\n-      29.2,\n-      29.1,\n-      30.0,\n+      1.23, 4.2, 10.2, 18.2, 24.2, 27.8, 28.1, 28.6, 29.1, 29.2, 29.1, 30.0,\n       30.12\n     ]\n   }\n-}\n\\ No newline at end of file\n+}\n',
};
