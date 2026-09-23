function Button({ children, type = 'button', ...props }) {
  return (
    <button
      type={type}
      className="
        w-full
        min-h-12
        rounded-xl
        bg-[var(--color-primary)]
        px-4
        text-base
        font-semibold
        text-white
        transition
        hover:brightness-95
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-[var(--color-primary)]
        focus-visible:ring-offset-2
        disabled:cursor-not-allowed
        disabled:opacity-50
      "
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
