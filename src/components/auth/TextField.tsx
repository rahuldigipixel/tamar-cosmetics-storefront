interface TextFieldProps {
  id: string;
  name: string;
  label: string;
  type?: "text" | "email";
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  required?: boolean;
}

export function TextField({ id, name, label, type = "text", value, onChange, autoComplete, required }: TextFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[16px] leading-[26px] font-normal text-black">
        {label} {required ? <span className="text-brand-accent">*</span> : null}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-full border border-black/15 px-4 text-[16px] outline-none focus:border-brand-accent"
      />
    </div>
  );
}
