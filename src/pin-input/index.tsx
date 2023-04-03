import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./style.scss";

export interface PinInputProps {
  isSecret?: boolean;
  length?: number;
  disabled?: boolean;
  boxValidate?: (value: string) => boolean;
  onChange?: (value: string) => void;
  onCompleted?: (value: string) => void;
}

interface PinInputItemProps {
  index: number;
  isSecret?: boolean;
  disabled?: boolean;
  boxValidate?: (value: string) => boolean;
  onChange: (value: string, currentIndex: number) => void;
  onBackspace: (currentIndex: number) => void;
  onPaste: (clipboardData: string, currentIndex: number) => void;
}

const PinInputItem = forwardRef<HTMLInputElement, PinInputItemProps>(
  (props: PinInputItemProps, ref) => {
    const {
      index,
      onBackspace,
      onChange,
      onPaste,
      boxValidate,
      isSecret,
      disabled,
    } = props;
    const [state, setState] = useState("");

    const onInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        let currentIndex = +(e.target.getAttribute("tabIndex") || 0);
        const value = e.target.value.slice(-1);

        if (value !== e.target.value) {
          e.target.value = value;
        }

        if (boxValidate && !boxValidate(value)) {
          setState("error");
          return;
        } else {
          setState("");
        }

        onChange(value, currentIndex);
      },
      [onChange, boxValidate]
    );

    const onKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.target instanceof HTMLInputElement) {
          const currentIndex = +(e.target.getAttribute("tabIndex") || 0);
          if (e.key === "Backspace" && e.target.value.length === 0) {
            if (currentIndex > 0) {
              onBackspace(currentIndex);
            }
          }
        }
      },
      [onBackspace]
    );

    const _onPaste: React.ClipboardEventHandler<HTMLInputElement> = useCallback(
      (e) => {
        const value = e.clipboardData.getData("text");
        const currentIndex = +(e.currentTarget.getAttribute("tabIndex") || 0);
        onPaste(value, currentIndex);
      },
      [onPaste]
    );
    return (
      <input
        ref={ref}
        disabled={disabled}
        key={index}
        tabIndex={index}
        onChange={onInputChange}
        onKeyDown={onKeyDown}
        onPaste={_onPaste}
        className={`input-wrap-item ${
          state === "error" ? "input-wrap-item--error" : ""
        }`}
        type={isSecret ? "password" : "text"}
      />
    );
  }
);

const PinInput = (props: PinInputProps) => {
  const {
    length = 5,
    isSecret = false,
    disabled,
    onChange,
    onCompleted,
    boxValidate,
  } = props;
  const elements = useRef<(HTMLInputElement | null)[]>([]);

  const inputs = useMemo(() => Array.from({ length }, (_, i) => i), [length]);

  const onInputChange: PinInputItemProps["onChange"] = useCallback(
    (value, currentIndex) => {
      if (boxValidate && !boxValidate(value)) {
        return;
      }

      // Set focus on next
      if (value.length === 1 && currentIndex < length - 1) {
        currentIndex += 1;
        elements.current[currentIndex]?.focus();
      }

      const pin = elements.current
        .map((el) => el?.value)
        .filter((v) => v !== undefined)
        .join("");
      // Emit onchange event to parent
      if (onChange) {
        onChange(pin);
      }

      // Emit onCompleted event to parent
      if (
        pin.length === length &&
        document.activeElement === elements.current[length - 1]
      ) {
        if (onCompleted) {
          onCompleted(pin);
        }
      }
    },
    [length, onChange, onCompleted, boxValidate]
  );

  const onInputBackspace: PinInputItemProps["onBackspace"] = useCallback(
    (currentIndex) => {
      elements.current[currentIndex - 1]?.focus();
    },
    []
  );

  const onPaste: PinInputItemProps["onPaste"] = useCallback(
    (clipboardData, currentIndex) => {
      const emptyInput = length - currentIndex;

      if (clipboardData.length !== emptyInput) {
        return;
      }

      elements.current.forEach((el, i) => {
        if (i >= currentIndex && el?.value !== undefined) {
          setTimeout(() => {
            el.value = clipboardData[i - currentIndex];
            el.focus();
          }, 0);
        }
      });
    },
    [length]
  );

  useEffect(() => {
    if (elements.current.length > 0) {
      elements.current[0]?.focus();
    }
  }, []);

  return (
    <div className="input-wrap">
      {inputs.map((i) => (
        <PinInputItem
          index={i}
          disabled={disabled}
          ref={(el) => (elements.current[i] = el)}
          boxValidate={boxValidate}
          onBackspace={onInputBackspace}
          onChange={onInputChange}
          onPaste={onPaste}
          isSecret={isSecret}
          key={i}
        />
      ))}
    </div>
  );
};

export default PinInput;
