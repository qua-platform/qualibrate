# Node Actions

## Introduction

Node Actions provide a structured way to organize the code within a
`QualibrationNode` while preserving the interactivity essential for
calibration tasks. Traditionally, calibration scripts might be long,
monolithic files or broken into functions without a standardized execution
flow. Node Actions introduce a lightweight mechanism using decorators to
define distinct, executable steps within a node script.

This approach aims to balance the need for clear, maintainable code
structure with the flexibility required for debugging and iterative
development common in quantum calibration workflows. It addresses the
challenge that overly rigid structures can hinder the quick experimentation
needed when tuning quantum systems.

## Structuring Nodes with Actions

The core of this feature is the `@node.run_action` decorator. By applying
this decorator to a function within a `QualibrationNode` script, you
designate that function as a "Node Action."

```python
from qualibrate import QualibrationNode, NodeParameters
from typing import Optional # Added for Optional type hint

# Define Parameters (assuming Parameters class exists)
class Parameters(NodeParameters):
    # ... node parameters
    simulate: bool = False
    load_data_id: Optional[int] = None

# Instantiate the node
node = QualibrationNode(
    name="example_node",
    parameters=Parameters()
)
# Node setup might occur here, e.g., loading configurations or machine state if needed

# Define an action
@node.run_action
def save_results(node: QualibrationNode):
    """Saves the node's results."""
    print("Saving results...")
    # Add logic to gather results if needed before saving
    node.save()
    print("Results saved.")

# >> Output when script is run:
# Saving results...
# Results saved.

```

When the Python script containing the node is executed (either directly, via
the Calibration Library, or the Web App), functions decorated with
`@node.run_action` are:

1.  **Executed Immediately:** The function runs as soon as it's defined in
    the script flow.
2.  **Registered:** The action is registered with the node instance, making it
    potentially available for more advanced control flows or debugging tools
    in the future (like re-running specific steps).

## Sharing Data Between Actions

Since actions are distinct functions, you need a way to pass data generated
in one action to another action executed later in the script. The
`node.namespace` attribute serves this purpose. It is a dictionary attached
to the `node` object where you can store and retrieve variables.

You can directly assign values to keys in `node.namespace`:

```python
# Inside an action function:
intermediate_result = 42
node.namespace["my_result"] = intermediate_result
```

In a subsequent action, you can access this stored value:

```python
# Inside a later action function:
previous_result = node.namespace["my_result"]
print(f"The previous result was: {previous_result}")
```

As a convenience, if an action function returns a dictionary, the contents of
that dictionary are automatically added to `node.namespace`. Keys from the
returned dictionary will overwrite existing keys in the namespace if they
collide.

**Example: Using `node.namespace`**

```python
# In your QualibrationNode script...

# %% {Generate_Data}
@node.run_action
def generate_data(node: QualibrationNode):
    """Generates some data and stores it."""
    print("Generating data...")
    raw_data = [1, 2, 3, 4, 5]
    # Store directly in namespace
    node.namespace["raw_data"] = raw_data
    print("Raw data stored in namespace.")
    # Return a dict to add more items to namespace
    # The following is equivalent to: node.namespace["processing_factor"] = 10
    return {"processing_factor": 10}

# %% {Process_Data}
@node.run_action
def process_data(node: QualibrationNode):
    """Processes data retrieved from the namespace."""
    print("Processing data...")
    # Retrieve data stored directly
    retrieved_raw_data = node.namespace["raw_data"]
    # Retrieve data added via return dict
    factor = node.namespace["processing_factor"]
    processed_data = [x * factor for x in retrieved_raw_data]
    node.namespace["processed_data"] = processed_data
    print(f"Processed data: {processed_data}")

# %% {Use_Processed_Data}
@node.run_action
def use_processed_data(node: QualibrationNode):
    """Uses the final processed data."""
    final_data = node.namespace["processed_data"]
    print(f"Using final data: {final_data}")
    # ... further steps ...

```

This mechanism allows for a clear flow of data between the modular steps
defined by your node actions.

## Controlling Execution Flow with `skip_if`

Node Actions allow for conditional execution using keyword arguments in the
decorator. The primary implemented control mechanism is the `skip_if`
argument.

If the expression passed to `skip_if` evaluates to `True`, the action will be
skipped during execution. This avoids complex `if/else` blocks cluttering the
main script body.

**Example: Skipping Simulation or Execution**

In a typical calibration node, you might want different execution paths:
simulate a process, execute it on hardware, or load previously saved
data. Node Actions with `skip_if` can manage this cleanly:

```python
# In your QualibrationNode script...

# %% {Simulate_Process}
@node.run_action(
    skip_if=node.parameters.load_data_id is not None
            or not node.parameters.simulate
)
def simulate_process(node: QualibrationNode):
    """Simulate the calibration process"""
    print("Simulating process...")
    # ... simulation logic ...
    # Example: Store simulation results
    # node.results["simulation"] = {"figure": fig, ...}
    print("Simulation complete.")

# %% {Execute_Process}
@node.run_action(
    skip_if=node.parameters.load_data_id is not None
            or node.parameters.simulate
)
def execute_process(node: QualibrationNode):
    """Execute the process and fetch the raw data."""
    print("Executing process...")
    # ... execution logic ...
    # Example: Store raw data
    # node.results["ds_raw"] = dataset
    print("Execution complete.")

# %% {Load_Data}
@node.run_action(skip_if=node.parameters.load_data_id is None)
def load_data(node: QualibrationNode):
    """Load a previously acquired dataset."""
    load_data_id = node.parameters.load_data_id # Store before node is overwritten
    print(f"Loading data from ID: {load_data_id}...")
    # Load the specified dataset - Note: this populates the node variable
    node.load_from_id(load_data_id)
    # Restore the parameter if needed, as load_from_id might reset it
    node.parameters.load_data_id = load_data_id
    print("Data loaded.")

# %% {Analyse_Data}
@node.run_action(skip_if=node.parameters.simulate)
def analyse_data(node: QualibrationNode):
    """Analyse the raw or loaded data."""
    print("Analysing data...")
    # ... analysis logic ...
    print("Analysis complete.")

# %% {Save_Results}
@node.run_action()
def save_results(node: QualibrationNode):
    """Saves the node's results."""
    print("Saving results...")
    node.save()
    print("Results saved.")

```

Using `# %% {Cell Name}` comments before each action allows editors like
VS Code to recognize these sections as runnable cells. This simplifies
debugging and interactive execution of specific actions within a compatible
kernel.

In this example:

- `simulate_process` only runs if `load_data_id` is `None` AND
  `simulate` is `True`.
- `execute_process` only runs if `load_data_id` is `None` AND
  `simulate` is `False`.
- `load_data` only runs if `load_data_id` is provided.
- `analyse_data` runs if `simulate` is `False` (meaning we either executed
  or loaded data).
- `save_results` always runs at the end.

## Benefits of Using Node Actions

Using Node Actions significantly improves the clarity and maintainability
of calibration scripts. Encapsulating logic in named functions makes scripts
easier to read and modify, while the decorator handles conditional execution
cleanly, avoiding complex `if` statements.

Furthermore, actions function as largely independent units. Explicitly
sharing data between them using `node.namespace` reduces implicit coupling
compared to scripts relying on shared local variables. This modularity and
reduced coupling lead to cleaner code and provide essential hooks for future
enhancements, such as interactively re-running steps or building custom
workflows, leading to more robust calibration nodes within the QUAlibrate
framework.
