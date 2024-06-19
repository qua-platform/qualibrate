def test_state_updates(node, machine):
    with node.record_state_updates(interactive_only=False):
        channel = machine.channels["ch1"]
        channel.intermediate_frequency = 50e6

    assert channel.intermediate_frequency == 100e6
    assert node._state_updates == [
        {"channel": "ch1", "intermediate_frequency": 50e6}
    ]