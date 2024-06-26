def test_state_updates(node, machine):
    channel = machine.channels["ch1"]
    assert channel.intermediate_frequency == 100e6

    with node.record_state_updates(interactive_only=False):
        channel.intermediate_frequency = 50e6

    assert channel.intermediate_frequency == 100e6
    assert node.state_updates == {
        "#/channels/ch1/intermediate_frequency": {
            "key": "#/channels/ch1/intermediate_frequency",
            "attr": "intermediate_frequency",
            "val": 50e6,
            "old": 100e6,
        }
    }
