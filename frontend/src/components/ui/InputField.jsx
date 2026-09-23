function InputField({
  label,
  id,
  type = 'text',
  error,
  ...props
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-[var(--color-text)]"
      >
        {label}
      </label>

      <input
        id={id}
        type={type}
        className="
          w-full
          min-h-12
          rounded-xl
          border
          border-[var(--color-border)]
          bg-[var(--color-background)]
          px-4
          text-base
          text-[var(--color-text)]
          outline-none
          transition
          focus:border-[var(--color-primary)]
          focus:ring-2
          focus:ring-[var(--color-primary)]/20
        "
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />

      {error && (
        <p
          id={`${id}-error`}
          className="text-sm text-[var(--color-error)]"
        >
          {error}
        </p>
      )}
    </div>
  )
}

export default InputField
