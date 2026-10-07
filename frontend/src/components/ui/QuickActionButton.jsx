function QuickActionButton({
  icon: Icon,
  children,
  ...props
}) {
  return (
    <button
      type="button"
      className="
        flex
        min-h-10
        items-center
        justify-center
        gap-2
        rounded-xl
        border
        border-sky-200
        bg-sky-50
        px-3
        text-sm
        font-medium
        text-[var(--color-primary)]
        transition
        hover:bg-sky-100
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-[var(--color-primary)]
        focus-visible:ring-offset-2
      "
      {...props}
    >
      {Icon && (
        <Icon
          aria-hidden="true"
          className="h-4 w-4"
        />
      )}

      {children}
    </button>
  )
}

export default QuickActionButton
