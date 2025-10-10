import { InputHTMLAttributes } from "react";
import clsx from "clsx";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  description?: string;
  error?: string;
};

const InputField = ({ label, description, error, className, id, ...props }: InputFieldProps) => {
  const inputId = id ?? props.name ?? label.toLowerCase();

  return (
    <label className="flex w-full flex-col gap-2" htmlFor={inputId}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {description && <span className="text-xs text-slate-500">{description}</span>}
      <input
        id={inputId}
        className={clsx(
          "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30",
          error && "border-red-400 focus:border-red-500 focus:ring-red-300/60",
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </label>
  );
};

export default InputField;
