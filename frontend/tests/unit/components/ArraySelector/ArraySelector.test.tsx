import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createTestProviders } from "../../utils/providers";
import { ArraySelector } from "../../../../src/components";
import userEvent from '@testing-library/user-event';
import styles from "../../../../src/components/ArraySelector/ArraySelector.module.scss";
import { arrayParameterMock } from "./__mocks__/arrayParameter";

describe("ArraySelector - Parameter Management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render selector", async () => {
    const { Providers } = createTestProviders();

    const { container } = render(
      <Providers>
        <ArraySelector
          key={'parameterKey'}
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
          key={'parameterKey'}
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
          key={'parameterKey'}
          disabled={false}
          value={arrayParameterMock.array.default}
          onChange={() => {}}
          options={[]}
        />
      </Providers>
    );

    expect(container.querySelector(`.${styles.openPopupButton}`)).not.toBeInTheDocument()
  });

  it("should not render 'plus' button when selector is disabled", async () => {
    const { Providers } = createTestProviders();

    const { container } = render(
      <Providers>
        <ArraySelector
          key={'parameterKey'}
          disabled={true}
          value={arrayParameterMock.array.default}
          onChange={() => {}}
          options={arrayParameterMock.array.options}
        />
      </Providers>
    );

    expect(container.querySelector(`.${styles.openPopupButton}`)).not.toBeInTheDocument()
  });

  it("should open popup on 'plus' button click", async () => {
    const { Providers } = createTestProviders();

    const { container } = render(
      <Providers>
        <ArraySelector
          key={'parameterKey'}
          disabled={false}
          value={arrayParameterMock.array.default}
          onChange={() => {}}
          options={arrayParameterMock.array.options}
        />
      </Providers>
    );

    const openButton = container.querySelector(`.${styles.openPopupButton}`);
    expect(openButton).toBeInTheDocument();
    if (!openButton) return;

    fireEvent.click(openButton);

    expect(container.querySelector(`.${styles.popup}`)).toBeInTheDocument();
    expect(container.querySelector(`.${styles.popup}`)?.querySelector('input')?.focus).toBeTruthy();
  });

  it("should not display already selected options in popup", async () => {
    const { Providers } = createTestProviders();

    const { container } = render(
      <Providers>
        <ArraySelector
          key={'parameterKey'}
          disabled={false}
          value={arrayParameterMock.array.default}
          onChange={() => {}}
          options={arrayParameterMock.array.options}
        />
      </Providers>
    );

    const openButton = container.querySelector(`.${styles.openPopupButton}`);
    expect(openButton).toBeInTheDocument();
    if (!openButton) return;

    fireEvent.click(openButton);

    await waitFor(() => {
      arrayParameterMock.array.default.map(selectedOption =>
        expect(container.querySelector(`.${styles.popupOption}[data-value="${selectedOption}]"`))
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
          key={'parameterKey'}
          disabled={false}
          value={arrayParameterMock.array.default}
          onChange={mockOnChange}
          options={arrayParameterMock.array.options}
        />
      </Providers>
    );

    const openButton = container.querySelector(`.${styles.openPopupButton}`);
    expect(openButton).toBeInTheDocument();
    if (!openButton) return;

    fireEvent.click(openButton);

    const firstOption = container.querySelector(`.${styles.popupOption}`)
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
          key={'parameterKey'}
          disabled={false}
          value={arrayParameterMock.array.default}
          onChange={() => {}}
          options={arrayParameterMock.array.options}
        />
      </Providers>
    );

    const openButton = container.querySelector(`.${styles.openPopupButton}`);
    expect(openButton).toBeInTheDocument();
    if (!openButton) return;

    fireEvent.click(openButton);

    const input = container.querySelector(`.${styles.popup} input`);
    expect(input).toBeInTheDocument();
    if (!input) return;

    const firstOption = arrayParameterMock.array.options.find(option => !arrayParameterMock.array.default.includes(option.id));
    expect(firstOption).toBeTruthy();
    if (!firstOption) return

    const user = userEvent.setup();
    await user.type(input, firstOption.title);

    expect(Array.from(container.querySelectorAll(`.${styles.popupOption}`)).length).toBe(1);
    expect(container.querySelector(`.${styles.popupOption}`)?.getAttribute('data-value')).toBe(firstOption.id);
  });
});
