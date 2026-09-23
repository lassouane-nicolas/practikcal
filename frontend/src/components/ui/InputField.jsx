function InputField({
    label,
    id,
    type = 'text',
    error,
    icon: Icon,
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

            <div className="relative">
                {Icon && (
                    <Icon
                        aria-hidden="true"
                        className="
                          pointer-events-none
                          absolute
                          left-4
                          top-1/2
                          h-5
                          w-5
                          -translate-y-1/2
                          text-[var(--color-text-muted)]
                        "
                    />
                )}

                <input
                    id={id}
                    type={type}
                    className={`
                      w-full
                      min-h-12
                      rounded-xl
                      border
                      border-[var(--color-border)]
                      bg-[var(--color-background)]
                      ${Icon ? 'pl-12' : 'px-4'}
                      pr-4
                      text-base
                      text-[var(--color-text)]
                      outline-none
                      transition
                      focus:border-[var(--color-primary)]
                      focus:ring-2
                      focus:ring-[var(--color-primary)]/20
                    `}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? `${id}-error` : undefined}
                    {...props}
                />
            </div>

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
