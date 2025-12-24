import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createTestProviders } from "../../utils/providers";
import { ArraySelector } from "../../../../src/components";
import userEvent from '@testing-library/user-event';
import styles from "../../../../src/components/ArraySelector/ArraySelector.module.scss";
import enumStyles from "../../../../src/components/ArraySelector/components/EnumSelectorDropdown/EnumSelectorDropdown.module.scss";
import qubitsStyles from "../../../../src/components/ArraySelector/components/QubitsSelectorPopup/QubitsSelectorPopup.module.scss";
import { arrayParameterMock } from "./__mocks__/arrayParameter";

describe("ArraySelector - Trigger and selected data display", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render selector", async () => {
    const { Providers } = createTestProviders();

    const { container } = render(
      <Providers>
        <ArraySelector
          parameterKey={'parameterKey'}
          disabled={false}
          value={[]}
          onChange={() => {}}
          options={[]}
        />
      </Providers>
    );

    await waitFor(() => expect(container.querySelector(`.${styles.field}`)).toBeInTheDocument());
  });

  it("should render selector with selected values", async () => {
    const { Providers } = createTestProviders();

    render(
      <Providers>
        <ArraySelector
          parameterKey={'parameterKey'}
          disabled={false}
          value={arrayParameterMock.array.default}
          onChange={() => {}}
          options={[]}
        />
      </Providers>
    );

    await waitFor(() => {
      arrayParameterMock.array.default.map(option =>
        expect(screen.getByText(option)).toBeInTheDocument()
      );
    });
  });

  it("should not render 'plus' button when options list is empty", async () => {
    const { Providers } = createTestProviders();

    const { container } = render(
      <Providers>
        <ArraySelector
          parameterKey={'parameterKey'}
          disabled={false}
          value={arrayParameterMock.array.default}
          onChange={() => {}}
          options={[]}
        />
      </Providers>
    );

    expect(container.querySelector(`.${styles.openPopupTrigger}`)).not.toBeInTheDocument()
  });

  it("should not render 'plus' button when selector is disabled", async () => {
    const { Providers } = createTestProviders();

    const { container } = render(
      <Providers>
        <ArraySelector
          parameterKey={'parameterKey'}
          disabled={true}
          value={arrayParameterMock.array.default}
          onChange={() => {}}
          options={arrayParameterMock.array.options}
        />
      </Providers>
    );

    expect(container.querySelector(`.${styles.openPopupTrigger}`)).not.toBeInTheDocument()
  });
});

describe("Enum Selector", () => {
  it("should open popup on 'plus' button click", async () => {
    const { Providers } = createTestProviders();

    const { container } = render(
      <Providers>
        <ArraySelector
          parameterKey={'parameterKey'}
          disabled={false}
          value={arrayParameterMock.array.default}
          onChange={() => {}}
          options={arrayParameterMock.array.options}
        />
      </Providers>
    );

    const openButton = container.querySelector(`.${styles.openPopupTrigger}`);
    expect(openButton).toBeInTheDocument();
    if (!openButton) return;

    fireEvent.click(openButton);

    expect(container.querySelector(`.${enumStyles.popup}`)).toBeInTheDocument();
    expect(container.querySelector(`.${enumStyles.popup}`)?.querySelector('input')?.focus).toBeTruthy();
  });

  it("should not display already selected options in popup", async () => {
    const { Providers } = createTestProviders();

    const { container } = render(
      <Providers>
        <ArraySelector
          parameterKey={'parameterKey'}
          disabled={false}
          value={arrayParameterMock.array.default}
          onChange={() => {}}
          options={arrayParameterMock.array.options}
        />
      </Providers>
    );

    const openButton = container.querySelector(`.${styles.openPopupTrigger}`);
    expect(openButton).toBeInTheDocument();
    if (!openButton) return;

    fireEvent.click(openButton);

    await waitFor(() => {
      arrayParameterMock.array.default.map(selectedOption =>
        expect(container.querySelector(`.${enumStyles.popupOption}[data-value="${selectedOption}]"`))
          .not.toBeInTheDocument()
      )
    });
  });

  it("should fire onChange callback when option is selected", async () => {
    const mockOnChange = vi.fn();
    const { Providers } = createTestProviders();

    const { container } = render(
      <Providers>
        <ArraySelector
          parameterKey={'parameterKey'}
          disabled={false}
          value={arrayParameterMock.array.default}
          onChange={mockOnChange}
          options={arrayParameterMock.array.options}
        />
      </Providers>
    );

    const openButton = container.querySelector(`.${styles.openPopupTrigger}`);
    expect(openButton).toBeInTheDocument();
    if (!openButton) return;

    fireEvent.click(openButton);

    const firstOption = container.querySelector(`.${enumStyles.popupOption}`)
    expect(firstOption).toBeInTheDocument();
    if (!firstOption) return;

    fireEvent.click(firstOption);

    expect(mockOnChange).toBeCalledWith([
      ...arrayParameterMock.array.default,
      firstOption?.getAttribute('data-value')
    ])
  });

  it("should filter out options on search", async () => {
    const { Providers } = createTestProviders();

    const { container } = render(
      <Providers>
        <ArraySelector
          parameterKey={'parameterKey'}
          disabled={false}
          value={arrayParameterMock.array.default}
          onChange={() => {}}
          options={arrayParameterMock.array.options}
        />
      </Providers>
    );

    const openButton = container.querySelector(`.${styles.openPopupTrigger}`);
    expect(openButton).toBeInTheDocument();
    if (!openButton) return;

    fireEvent.click(openButton);

    const input = container.querySelector(`.${enumStyles.popup} input`);
    expect(input).toBeInTheDocument();
    if (!input) return;

    const firstOption = arrayParameterMock.array.options.reverse().find(option => !arrayParameterMock.array.default.includes(option.id));
    expect(firstOption).toBeTruthy();
    if (!firstOption) return

    const user = userEvent.setup();
    await user.type(input, firstOption.title);

    expect(Array.from(container.querySelectorAll(`.${enumStyles.popupOption}`)).length).toBe(1);
    expect(container.querySelector(`.${enumStyles.popupOption}`)?.getAttribute('data-value')).toBe(firstOption.id);
  });
});

const getSelectedOptions = () => arrayParameterMock.array.options
  .map(option => screen.queryByTestId(`option_${option.id}`))
  .filter(element => element?.classList.contains(qubitsStyles.selected))

describe("Qubits Selector", () => {
  it("should open popup on 'plus' button click", async () => {
    const { Providers } = createTestProviders();

    const { container } = render(
      <Providers>
        <ArraySelector
          parameterKey={'qubits'}
          disabled={false}
          value={arrayParameterMock.array.default}
          onChange={() => {}}
          options={arrayParameterMock.array.options}
        />
      </Providers>
    );

    const openButton = container.querySelector(`.${styles.openPopupTrigger}`);
    expect(openButton).toBeInTheDocument();
    if (!openButton) return;

    fireEvent.click(openButton);

    expect(screen.getByText('Select qubits...')).toBeInTheDocument();
    expect(screen.getByRole("search")?.focus).toBeTruthy();
  });

  it("should highlight already selected options in popup", async () => {
    const { Providers } = createTestProviders();

    const { container } = render(
      <Providers>
        <ArraySelector
          parameterKey={'qubits'}
          disabled={false}
          value={arrayParameterMock.array.default}
          onChange={() => {}}
          options={arrayParameterMock.array.options}
        />
      </Providers>
    );

    const openButton = container.querySelector(`.${styles.openPopupTrigger}`);
    expect(openButton).toBeInTheDocument();
    if (!openButton) return;

    fireEvent.click(openButton);

    await waitFor(() => {
      arrayParameterMock.array.default.map(selectedOption =>
        expect(screen.getByTestId(`option_${selectedOption}`).classList).toContain(qubitsStyles.selected)
      )
    });
  });

  it("should fire onChange callback when Apply selection is clicked", async () => {
    const mockOnChange = vi.fn();
    const { Providers } = createTestProviders();

    const { container } = render(
      <Providers>
        <ArraySelector
          parameterKey={'qubits'}
          disabled={false}
          value={arrayParameterMock.array.default}
          onChange={mockOnChange}
          options={arrayParameterMock.array.options}
        />
      </Providers>
    );

    const openButton = container.querySelector(`.${styles.openPopupTrigger}`);
    expect(openButton).toBeInTheDocument()
    if (!openButton) return;

    fireEvent.click(openButton);

    const firstOptionId = arrayParameterMock.array.options.find(option => !arrayParameterMock.array.default.includes(option.id))?.id
    const firstOption = screen.getByTestId(`option_${firstOptionId}`)
    expect(firstOption).toBeInTheDocument();
    if (!firstOption) return;

    fireEvent.click(firstOption);

    const applyButton = screen.getByRole("apply");
    expect(applyButton).toBeInTheDocument();
    if (!applyButton) return;

    fireEvent.click(applyButton);

    await waitFor(() => expect(mockOnChange).toBeCalledWith([
      ...arrayParameterMock.array.default,
      firstOption?.getAttribute('data-value')
    ]))
  });

  it("should close and reset popup when Cancel is clicked", async () => {
    const mockOnChange = vi.fn();
    const { Providers } = createTestProviders();

    const { container } = render(
      <Providers>
        <ArraySelector
          parameterKey={'qubits'}
          disabled={false}
          value={arrayParameterMock.array.default}
          onChange={mockOnChange}
          options={arrayParameterMock.array.options}
        />
      </Providers>
    );


    let openButton = container.querySelector(`.${styles.openPopupTrigger}`);
    expect(openButton).toBeInTheDocument();
    if (!openButton) return;

    fireEvent.click(openButton);

    const selectAllButton = screen.getByTestId("selectAll");
    expect(selectAllButton).toBeInTheDocument();
    if (!selectAllButton) return;

    fireEvent.click(selectAllButton);

    const cancelButton = screen.getByRole("cancel");
    expect(cancelButton).toBeInTheDocument();
    if (!cancelButton) return;

    fireEvent.click(cancelButton);

    expect(mockOnChange).not.toBeCalledWith();
    await waitFor(() => expect(screen.queryByText('Select qubits...')).not.toBeInTheDocument());

    openButton = container.querySelector(`.${styles.openPopupTrigger}`);
    if (!openButton) return;
    fireEvent.click(openButton);

    const selectedOptions = getSelectedOptions();
    expect(selectedOptions.map(element => element?.getAttribute('data-value')).sort())
      .toStrictEqual(arrayParameterMock.array.default.sort())
  });

  it("should filter out options on search", async () => {
    const { Providers } = createTestProviders();

    const { container } = render(
      <Providers>
        <ArraySelector
          parameterKey={'qubits'}
          disabled={false}
          value={arrayParameterMock.array.default}
          onChange={() => {}}
          options={arrayParameterMock.array.options}
        />
      </Providers>
    );

    const openButton = container.querySelector(`.${styles.openPopupTrigger}`);
    expect(openButton).toBeInTheDocument();
    if (!openButton) return;

    fireEvent.click(openButton);

    const input = screen.getByRole("search");
    expect(input).toBeInTheDocument();
    if (!input) return;

    const firstOption = arrayParameterMock.array.options[0];
    expect(firstOption).toBeTruthy();
    if (!firstOption) return

    const user = userEvent.setup();
    await user.type(input, firstOption.title);

    const filteredOptions = arrayParameterMock.array.options
      .map(option => screen.queryByTestId(`option_${option.id}`))
      .filter(element => element || false)

    expect(Array.from(filteredOptions).length).toBe(1);
    expect(filteredOptions[0]?.getAttribute('data-value')).toBe(firstOption.id);
  });

  it("should select all options on 'Select all' click", async () => {
    const { Providers } = createTestProviders();

    const { container } = render(
      <Providers>
        <ArraySelector
          parameterKey={'qubits'}
          disabled={false}
          value={arrayParameterMock.array.default}
          onChange={() => {}}
          options={arrayParameterMock.array.options}
        />
      </Providers>
    );

    const openButton = container.querySelector(`.${styles.openPopupTrigger}`);
    expect(openButton).toBeInTheDocument();
    if (!openButton) return;

    fireEvent.click(openButton);

    const selectAllButton = screen.getByTestId("selectAll");
    expect(selectAllButton).toBeInTheDocument();
    if (!selectAllButton) return;

    fireEvent.click(selectAllButton);

    const selectedOptions = getSelectedOptions()

    expect(selectedOptions.length).toBe(arrayParameterMock.array.options.length);
  });

  it("should clear all selection on 'Clear all' click", async () => {
    const { Providers } = createTestProviders();

    const { container } = render(
      <Providers>
        <ArraySelector
          parameterKey={'qubits'}
          disabled={false}
          value={arrayParameterMock.array.default}
          onChange={() => {}}
          options={arrayParameterMock.array.options}
        />
      </Providers>
    );


    const openButton = container.querySelector(`.${styles.openPopupTrigger}`);
    expect(openButton).toBeInTheDocument();
    if (!openButton) return;

    fireEvent.click(openButton);

    const selectAllButton = screen.getByTestId("selectAll");
    expect(selectAllButton).toBeInTheDocument();
    if (!selectAllButton) return;

    fireEvent.click(selectAllButton);

    const selectedOptions = getSelectedOptions()

    expect(selectedOptions.length).toBe(arrayParameterMock.array.options.length);

    const clearAllButton = screen.getByTestId("clearAll");
    expect(clearAllButton).toBeInTheDocument();
    if (!clearAllButton) return;

    fireEvent.click(clearAllButton);

    const clearedOptions = getSelectedOptions()

    expect(clearedOptions.length).toBe(0);
  });

  it("should select only online options on 'Online only' click", async () => {
    const { Providers } = createTestProviders();

    const { container } = render(
      <Providers>
        <ArraySelector
          parameterKey={'qubits'}
          disabled={false}
          value={arrayParameterMock.array.default}
          onChange={() => {}}
          options={arrayParameterMock.array.options}
        />
      </Providers>
    );


    const openButton = container.querySelector(`.${styles.openPopupTrigger}`);
    expect(openButton).toBeInTheDocument();
    if (!openButton) return;

    fireEvent.click(openButton);

    const onlineOnlyButton = screen.getByTestId("onlineOnly");
    expect(onlineOnlyButton).toBeInTheDocument();
    if (!onlineOnlyButton) return;

    fireEvent.click(onlineOnlyButton);

    const selectedOptions = getSelectedOptions()

    expect(selectedOptions.length).toBe(
      arrayParameterMock.array.options.filter(option => option.online).length
    );
  });
});
