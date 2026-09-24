function Button({
  children,
  type = 'button',
  variant = 'primary',
  ...props
}) {
  const variantClasses = {
    primary: `
    bg-[var(--color-primary)]
    text-white
    hover:brightness-95
  `,
    secondary: `
    border
    border-[var(--color-border)]
    bg-[var(--color-background)]
    text-[var(--color-text)]
    hover:bg-sky-50
  `
  }

  return (
    <button
      type={type}
      className={`
        w-full
        min-h-12
        rounded-xl
        px-4
        text-base
        font-semibold
        transition
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-[var(--color-primary)]
        focus-visible:ring-offset-2
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${variantClasses[variant]}
      `}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
